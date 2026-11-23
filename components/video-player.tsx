"use client";

import { useEffect, useRef, useState } from "react";

type StreamServer = { title: string; serverId: string; href?: string; url?: string };
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
  const [activeServer, setActiveServer] = useState("Default");
  const [loading, setLoading] = useState(false);
  const servers = groups.flatMap((group) => group.serverList || []);
  const activeTrack = tracks[0] || (initialStream.subtitleUrl ? { label: "Indonesia", language: "id", url: initialStream.subtitleUrl } : null);

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
        video.src = stream.url!;
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
    setActiveServer(server.title);
    try {
      const response = await fetch(`/api/nexus/anime/server/${encodeURIComponent(server.serverId)}`);
      if (!response.ok) throw new Error("Server unavailable");
      const payload = await response.json();
      setStream({ url: payload.url || server.url || "", embed: payload.embed || "", subtitleUrl: payload.subtitleUrl || "" });
    } catch {
      setActiveServer("Default");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="player-column">
      <div className="player-shell">
        {stream.embed ? (
          <iframe
            key={stream.embed}
            src={stream.embed}
            title={`${animeTitle} — ${episodeTitle}`}
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : stream.url ? (
          <video ref={videoRef} controls playsInline preload="metadata" poster="" aria-label={`${animeTitle} episode video`}>
            {activeTrack?.url && <track kind="subtitles" src={activeTrack.url} srcLang={activeTrack.language || "id"} label={activeTrack.label || "Subtitles"} default />}
          </video>
        ) : (
          <div className="player-unavailable">
            <span>STREAM UNAVAILABLE</span>
            <p>No playable source was returned for this episode.</p>
          </div>
        )}
        {loading && <div className="player-loading">Changing server…</div>}
      </div>
      <div className="player-toolbar">
        <div>
          <span className="eyebrow">NOW PLAYING</span>
          <strong>{animeTitle}</strong>
          <p>{episodeTitle}</p>
        </div>
        <div className="server-picker">
          <span className="server-caption">SOURCE</span>
          <div className="server-buttons">
            {servers.length ? servers.map((server) => (
              <button key={server.serverId} className={activeServer === server.title ? "server-chip selected" : "server-chip"} onClick={() => chooseServer(server)} disabled={loading}>
                {server.title}
              </button>
            )) : <span className="server-chip selected">Default</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
