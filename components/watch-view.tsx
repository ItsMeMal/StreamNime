"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { VideoPlayer } from "@/components/video-player";
import { normalizeAnime, type Anime } from "@/lib/anime";

type Episode = { id?: string; number?: number; title?: string; date?: string };
type EpisodePayload = {
  url?: string;
  embed?: string;
  subtitleUrl?: string;
  subtitleTracks?: { label?: string; language?: string; url: string }[];
  servers?: { title: string; serverList: { title: string; serverId: string; href?: string; url?: string }[] }[];
};

export function WatchView({ slug, requestedEpisode = "" }: { slug: string; requestedEpisode?: string }) {
  const [anime, setAnime] = useState<Anime | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [selectedEpisode, setSelectedEpisode] = useState(requestedEpisode);
  const [episodeData, setEpisodeData] = useState<EpisodePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setFailed(false);
      setEpisodeData(null);
      try {
        const detailResponse = await fetch("/api/catalog/anime/" + encodeURIComponent(slug), { cache: "no-store" });
        if (!detailResponse.ok) throw new Error("Detail anime tidak tersedia");
        const detail = await detailResponse.json();
        const animeValue = normalizeAnime(detail);
        const episodeList: Episode[] = Array.isArray(detail?.episodes) ? detail.episodes : [];
        const resolvedId = requestedEpisode || episodeList[0]?.id || (slug + "__ep__1");
        if (active) {
          setAnime(animeValue);
          setEpisodes(episodeList);
          setSelectedEpisode(resolvedId);
        }
        const episodeResponse = await fetch("/api/catalog/anime/episode/" + encodeURIComponent(resolvedId), { cache: "no-store" });
        if (!episodeResponse.ok) throw new Error("Sumber episode tidak tersedia");
        const payload = await episodeResponse.json();
        if (active) setEpisodeData(payload);
      } catch {
        if (active) setFailed(true);
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, [slug, requestedEpisode]);

  const selectedIndex = Math.max(0, episodes.findIndex((episode) => episode.id === selectedEpisode));
  const selected = episodes[selectedIndex];
  const number = selected?.number || selectedIndex + 1;
  const episodeTitle = selected?.title || "Episode " + number;
  const upcoming = episodes.slice(selectedIndex, selectedIndex + 6);

  if (loading) {
    return (
      <main id="main-content" className="page-shell watch-page">
        <Link href={"/anime/" + encodeURIComponent(slug)} className="back-link">← Kembali ke anime</Link>
        <div className="empty-state" role="status"><span className="empty-state-mark">…</span><h2>Menyiapkan pemutar</h2><p>Sumber video dan subtitle sedang dimuat.</p></div>
      </main>
    );
  }

  if (failed || !anime) {
    return (
      <main id="main-content" className="page-shell watch-page">
        <Link href={"/anime/" + encodeURIComponent(slug)} className="back-link">← Kembali ke anime</Link>
        <div className="empty-state"><span className="empty-state-mark">!</span><h2>Episode tidak dapat diputar</h2><p>Sumber episode ini gagal dimuat. Buka detail anime dan pilih episode lain.</p></div>
      </main>
    );
  }

  return (
    <main id="main-content" className="page-shell watch-page">
      <div className="watch-topline">
        <Link href={"/anime/" + encodeURIComponent(slug)} className="back-link">← {anime.title}</Link>
        <span><i /> EPISODE {String(number).padStart(2, "0")}</span>
      </div>
      <VideoPlayer
        initialStream={{
          url: episodeData?.url || "",
          embed: episodeData?.embed || "",
          subtitleUrl: episodeData?.subtitleUrl || "",
        }}
        groups={episodeData?.servers || []}
        tracks={episodeData?.subtitleTracks || []}
        animeTitle={anime.title}
        episodeTitle={episodeTitle}
      />
      <section className="watch-below">
        <div><h1>{anime.title}</h1><p>{episodeTitle}</p></div>
        <Link href={"/anime/" + encodeURIComponent(slug)} className="button-secondary">Semua episode</Link>
      </section>
      {upcoming.length > 0 && (
        <section className="watch-episode-strip">
          <div className="section-heading">
            <h2>Daftar episode</h2>
            <Link href={"/anime/" + encodeURIComponent(slug)} className="text-link">Lihat semua <span>→</span></Link>
          </div>
          <div className="episode-strip">
            {upcoming.map((item, index) => {
              const id = item.id || (slug + "__ep__" + (item.number || selectedIndex + index + 1));
              return (
                <Link
                  key={id}
                  className={id === selectedEpisode ? "mini-episode current" : "mini-episode"}
                  href={"/watch/" + encodeURIComponent(slug) + "?episode=" + encodeURIComponent(id)}
                  aria-current={id === selectedEpisode ? "page" : undefined}
                >
                  <span>{String(item.number || selectedIndex + index + 1).padStart(2, "0")}</span>
                  <strong>{item.title || "Episode " + (selectedIndex + index + 1)}</strong>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}