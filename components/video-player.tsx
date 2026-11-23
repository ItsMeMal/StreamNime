"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

type StreamServer = { title: string; serverId: string; href?: string; url?: string; groupTitle?: string };
type StreamGroup = { title: string; serverList: StreamServer[] };
type Track = { label?: string; language?: string; url: string };
type Stream = { url?: string; embed?: string; subtitleUrl?: string };
type PlaybackMode = "video" | "embed" | "unavailable";

function getPlaybackMode(stream: Stream): PlaybackMode {
  if (stream.url) return "video";
  if (stream.embed) return "embed";
  return "unavailable";
}

function isHlsSource(source: string) {
  try {
    const parsed = new URL(source, "https://streamnime.invalid");
    const upstreamFile = parsed.searchParams.get("url") || "";
    return parsed.pathname.includes("/anime/hls")
      || /\.m3u8?(?:$|[?#])/i.test(upstreamFile)
      || /\.m3u8?(?:$|[?#])/i.test(parsed.pathname);
  } catch {
    return /\.m3u8?(?:$|[?#])/i.test(source);
  }
}

function getSubtitleLanguage(language?: string) {
  return language && /^[a-z]{2,3}(?:-[A-Z]{2})?$/.test(language) ? language : "id";
}

export function VideoPlayer({
  initialStream,
  groups = [],
  tracks = [],
  animeTitle,
  episodeTitle,
}: {
  initialStream: Stream;
  groups?: StreamGroup[];
  tracks?: Track[];
  animeTitle: string;
  episodeTitle: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState(initialStream);
  const [mode, setMode] = useState<PlaybackMode>(() => getPlaybackMode(initialStream));
  const [activeServer, setActiveServer] = useState("default");
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [playbackError, setPlaybackError] = useState("");
  const servers = groups.flatMap((group) => (group.serverList || []).map((server) => ({ ...server, groupTitle: group.title })));
  // The API's default stream can be empty while its server list still contains working sources.
  // Prefer the first Dub source as a fallback; the selected group remains visible in the server picker.
  const autoFallbackServerId =
    groups.find((group) => /dub/i.test(group.title) && group.serverList?.length)?.serverList[0]?.serverId
    || groups.find((group) => group.serverList?.length)?.serverList[0]?.serverId
    || "";

  useEffect(() => {
    if (initialStream.url || initialStream.embed || !autoFallbackServerId) return;

    let active = true;
    async function loadFallback() {
      setLoading(true);
      setServerError("");
      try {
        const response = await fetch("/api/catalog/anime/server/" + encodeURIComponent(autoFallbackServerId), { cache: "no-store" });
        if (!response.ok) throw new Error("Fallback server unavailable");
        const payload = await response.json();
        const fallbackStream: Stream = {
          url: payload.url || "",
          embed: payload.embed || "",
          subtitleUrl: payload.subtitleUrl || "",
        };
        if (!fallbackStream.url && !fallbackStream.embed) {
          throw new Error("Fallback server returned no playable source");
        }
        if (active) {
          setStream(fallbackStream);
          setMode(getPlaybackMode(fallbackStream));
          setActiveServer(autoFallbackServerId);
        }
      } catch {
        if (active) setServerError("Sumber utama kosong. Pilih server lain untuk mencoba sumber berbeda.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadFallback();
    return () => { active = false; };
  }, [initialStream.url, initialStream.embed, autoFallbackServerId]);
  const activeTrack = stream.subtitleUrl
    ? { label: "Subtitle", language: "id", url: stream.subtitleUrl }
    : tracks[0] || null;

  useEffect(() => {
    setStream(initialStream);
    setMode(getPlaybackMode(initialStream));
    setActiveServer("default");
    setServerError("");
    setPlaybackError("");
  }, [initialStream.url, initialStream.embed, initialStream.subtitleUrl]);

  useEffect(() => {
    if (mode !== "video" || !stream.url) return;

    const video = videoRef.current;
    if (!video) return;

    let destroyHls: (() => void) | null = null;
    let cancelled = false;

    const fallback = (message: string) => {
      if (cancelled) return;
      setPlaybackError(message);
      setMode(stream.embed ? "embed" : "unavailable");
    };

    const isHls = isHlsSource(stream.url);

    if (!isHls) {
      video.src = stream.url;
      return () => {
        video.pause();
        video.removeAttribute("src");
        video.load();
      };
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = stream.url;
      return () => {
        video.pause();
        video.removeAttribute("src");
        video.load();
      };
    }

    const attachHls = async () => {
      try {
        const { default: Hls } = await import("hls.js");
        if (cancelled) return;

        if (!Hls.isSupported()) {
          fallback("Browser ini tidak mendukung HLS. Mencoba sumber alternatif.");
          return;
        }

        const instance = new Hls({
          enableWorker: true,
          maxBufferLength: 45,
          backBufferLength: 30,
          manifestLoadingTimeOut: 30_000,
          levelLoadingTimeOut: 30_000,
          fragLoadingTimeOut: 30_000,
        });
        destroyHls = () => instance.destroy();

        instance.on(Hls.Events.ERROR, (_event, data) => {
          if (!data.fatal || cancelled) return;
          instance.destroy();
          destroyHls = null;
          fallback("Stream HLS gagal dimuat. Mencoba player alternatif.");
        });

        instance.loadSource(stream.url!);
        instance.attachMedia(video);
      } catch {
        fallback("Gagal menyiapkan HLS. Mencoba sumber alternatif.");
      }
    };

    void attachHls();

    return () => {
      cancelled = true;
      destroyHls?.();
      video.pause();
      video.removeAttribute("src");
      video.load();
    };
  }, [mode, stream.url, stream.embed]);

  function handleVideoError() {
    setPlaybackError("Video tidak dapat diputar dari sumber ini.");
    setMode(stream.embed ? "embed" : "unavailable");
  }

  async function chooseServer(server: StreamServer) {
    if (loading) return;
    setLoading(true);
    setServerError("");
    setPlaybackError("");

    try {
      const response = await fetch("/api/catalog/anime/server/" + encodeURIComponent(server.serverId), { cache: "no-store" });
      if (!response.ok) throw new Error("Sumber tidak tersedia");
      const payload = await response.json();
      const nextStream: Stream = {
        url: payload.url || server.url || "",
        embed: payload.embed || "",
        subtitleUrl: payload.subtitleUrl || "",
      };

      if (!nextStream.url && !nextStream.embed) {
        throw new Error("Server tidak memberikan URL video atau embed");
      }

      setStream(nextStream);
      setMode(getPlaybackMode(nextStream));
      setActiveServer(server.serverId);
    } catch {
      setServerError("Sumber server gagal dimuat. Stream yang sedang aktif tetap dipertahankan.");
    } finally {
      setLoading(false);
    }
  }

  function useAlternativePlayer() {
    if (!stream.embed) return;
    setPlaybackError("");
    setMode("embed");
  }

  return (
    <div className="player-column" aria-busy={loading}>
      <div className="player-shell">
        {mode === "embed" && stream.embed ? (
          <iframe
            key={stream.embed}
            src={stream.embed}
            title={animeTitle + " — " + episodeTitle}
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : mode === "video" && stream.url ? (
          <video
            key={stream.url}
            ref={videoRef}
            controls
            playsInline
            preload="metadata"
            onError={handleVideoError}
            onCanPlay={() => setPlaybackError("")}
            aria-label={animeTitle + " " + episodeTitle}
          >
            {activeTrack?.url && (
              <track
                kind="subtitles"
                src={activeTrack.url}
                srcLang={getSubtitleLanguage(activeTrack.language)}
                label={activeTrack.label || "Subtitle"}
                default
              />
            )}
          </video>
        ) : (
          <div className="player-unavailable">
            <span>SUMBER VIDEO TIDAK TERSEDIA</span>
            <p>{playbackError || "Tidak ada sumber video yang dikembalikan untuk episode ini."}</p>
          </div>
        )}
        {loading && <div className="player-loading" role="status">Mengganti server…</div>}
      </div>

      <div className="player-toolbar">
        <div>
          <strong>{animeTitle}</strong>
          <p>{episodeTitle}</p>
          {playbackError && <p className="player-inline-error" role="status">{playbackError}</p>}
        </div>
        <div className="server-picker">
          <span className="server-caption">PILIH SERVER</span>
          <div className="server-buttons">
            {servers.length ? servers.map((server) => (
              <Button
                key={server.serverId}
                variant="chip"
                className={activeServer === server.serverId ? "server-chip selected" : "server-chip"}
                onClick={() => chooseServer(server)}
                disabled={loading}
                aria-pressed={activeServer === server.serverId}
              >
                {server.groupTitle ? server.groupTitle + " · " + server.title : server.title}
              </Button>
            )) : <span className="server-chip selected">Default</span>}
          </div>
        </div>
      </div>

      {(serverError || playbackError) && (
        <div className="player-error" role="status">
          <span>{serverError || playbackError}</span>
          <div className="player-error-actions">
            {mode === "video" && stream.embed && (
              <Button variant="ghost" size="sm" onClick={useAlternativePlayer}>Pakai player alternatif</Button>
            )}
            {mode === "embed" && stream.embed && (
              <a href={stream.embed} target="_blank" rel="noreferrer">Buka sumber di tab baru ↗</a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
