"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

type StreamServer = { title: string; serverId: string; href?: string; url?: string; groupTitle?: string };
type StreamGroup = { title: string; serverList: StreamServer[] };
type Track = { label?: string; language?: string; url: string };

export function VideoPlayer({
  initialStream,
  groups = [],
  tracks = [],
  animeTitle,
  episodeTitle,
}: {
  initialStream: { url?: string; embed?: string; subtitleUrl?: string };
  groups?: StreamGroup[];
  tracks?: Track[];
  animeTitle: string;
  episodeTitle: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState(initialStream);
  const [activeServer, setActiveServer] = useState("default");
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const servers = groups.flatMap((group) => (group.serverList || []).map((server) => ({ ...server, groupTitle: group.title })));
  const activeTrack = stream.subtitleUrl
    ? { label: "Subtitle", language: "id", url: stream.subtitleUrl }
    : tracks[0] || null;

  useEffect(() => {
    setStream(initialStream);
    setActiveServer("default");
    setServerError("");
  }, [initialStream.url, initialStream.embed, initialStream.subtitleUrl]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !stream.url || stream.embed) return;
    let hls: { destroy: () => void } | null = null;
    let cancelled = false;

    const attach = async () => {
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream.url!;
        return;
      }
      try {
        const { default: Hls } = await import("hls.js");
        if (cancelled) return;
        if (Hls.isSupported()) {
          const instance = new Hls({ enableWorker: true, maxBufferLength: 60 });
          hls = instance;
          instance.loadSource(stream.url!);
          instance.attachMedia(video);
        } else {
          video.src = stream.url!;
        }
      } catch {
        if (!cancelled) video.src = stream.url!;
      }
    };

    void attach();
    return () => {
      cancelled = true;
      hls?.destroy();
      video.pause();
      video.removeAttribute("src");
      video.load();
    };
  }, [stream.url, stream.embed]);

  async function chooseServer(server: StreamServer) {
    if (loading) return;
    setLoading(true);
    setServerError("");
    try {
      const response = await fetch("/api/catalog/anime/server/" + encodeURIComponent(server.serverId), { cache: "no-store" });
      if (!response.ok) throw new Error("Sumber tidak tersedia");
      const payload = await response.json();
      setStream({
        url: payload.url || server.url || "",
        embed: payload.embed || "",
        subtitleUrl: payload.subtitleUrl || "",
      });
      setActiveServer(server.serverId);
    } catch {
      setServerError("Sumber gagal diganti. Pilih server lain.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="player-column" aria-busy={loading}>
      <div className="player-shell">
        {stream.embed ? (
          <iframe
            key={stream.embed}
            src={stream.embed}
            title={animeTitle + " — " + episodeTitle}
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : stream.url ? (
          <video ref={videoRef} controls playsInline preload="metadata" aria-label={animeTitle + " " + episodeTitle}>
            {activeTrack?.url && <track kind="subtitles" src={activeTrack.url} srcLang={activeTrack.language || "id"} label={activeTrack.label || "Subtitle"} default />}
          </video>
        ) : (
          <div className="player-unavailable">
            <span>SUMBER VIDEO TIDAK TERSEDIA</span>
            <p>Tidak ada sumber yang bisa diputar untuk episode ini.</p>
          </div>
        )}
        {loading && <div className="player-loading" role="status">Mengganti server…</div>}
      </div>
      <div className="player-toolbar">
        <div><strong>{animeTitle}</strong><p>{episodeTitle}</p></div>
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
      {serverError && <p className="player-error" role="alert">{serverError}</p>}
    </div>
  );
}