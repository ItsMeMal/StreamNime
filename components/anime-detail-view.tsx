"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { WatchlistButton } from "@/components/watchlist-button";
import { normalizeAnime, type Anime } from "@/lib/anime";

type Episode = { id?: string; number?: number; title?: string; date?: string; urls?: string[] };

export function AnimeDetailView({ slug }: { slug: string }) {
  const [anime, setAnime] = useState<Anime | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [englishTitle, setEnglishTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [visibleCount, setVisibleCount] = useState(40);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setFailed(false);
    setVisibleCount(40);
    fetch("/api/catalog/anime/" + encodeURIComponent(slug), { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Detail anime tidak tersedia.");
        return response.json();
      })
      .then((payload) => {
        if (!active) return;
        setAnime(normalizeAnime(payload));
        setEpisodes(Array.isArray(payload?.episodes) ? payload.episodes : []);
        setEnglishTitle(payload?.englishTitle || payload?.english_title || "");
      })
      .catch(() => { if (active) setFailed(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [slug]);

  if (loading) {
    return (
      <main id="main-content" className="page-shell detail-page">
        <Link href="/anime" className="back-link">← Kembali ke anime</Link>
        <div className="empty-state" role="status"><span className="empty-state-mark">…</span><h2>Memuat detail anime</h2><p>Episode dan informasi anime sedang diambil.</p></div>
      </main>
    );
  }

  if (failed || !anime) {
    return (
      <main id="main-content" className="page-shell detail-page">
        <Link href="/anime" className="back-link">← Kembali ke anime</Link>
        <div className="empty-state"><span className="empty-state-mark">!</span><h2>Anime tidak tersedia</h2><p>Detail anime ini gagal dimuat dari katalog.</p></div>
      </main>
    );
  }

  const sortedEpisodes = [...episodes].sort((a, b) => Number(a.number || 0) - Number(b.number || 0));
  const firstEpisode = sortedEpisodes[0];
  const firstEpisodeId = firstEpisode?.id || (slug + "__ep__" + (firstEpisode?.number || 1));
  const watchlistAnime: Anime = { ...anime, episodes: sortedEpisodes };

  return (
    <main id="main-content" className="page-shell detail-page">
      <Link href="/anime" className="back-link">← Kembali ke anime</Link>
      <section className="detail-hero">
        {anime.banner && (
          <div className="detail-backdrop" aria-hidden="true">
            <Image src={anime.banner} alt="" fill unoptimized sizes="100vw" />
          </div>
        )}
        <div className="detail-poster">
          {anime.poster ? (
            <Image src={anime.poster} alt={anime.title} fill unoptimized sizes="(max-width: 640px) 30vw, 215px" />
          ) : <div className="poster-fallback"><span>SN</span></div>}
        </div>
        <div className="detail-copy">
          <h1>{anime.title}</h1>
          {englishTitle && englishTitle !== anime.title && <p className="detail-alt-title">{englishTitle}</p>}
          <div className="detail-meta">
            {anime.releaseYear && <span>{anime.releaseYear}</span>}
            {anime.status && <span>{String(anime.status).toUpperCase()}</span>}
            {anime.type && <span>{String(anime.type).toUpperCase()}</span>}
            {anime.score && <span>★ {anime.score}</span>}
            <span>{sortedEpisodes.length || Number(anime.episodes || 0) || "—"} episode</span>
          </div>
          <p className="detail-synopsis">{anime.synopsis || "Sinopsis belum tersedia."}</p>
          {anime.genres && anime.genres.length > 0 && (
            <div className="genre-list">{anime.genres.map((genre) => <span key={genre}>{genre}</span>)}</div>
          )}
          <div className="detail-actions">
            {firstEpisode && (
              <Link className="button-primary" href={"/watch/" + encodeURIComponent(slug) + "?episode=" + encodeURIComponent(firstEpisodeId)}>
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 5 12 7-12 7z" /></svg>
                Tonton episode 1
              </Link>
            )}
            <WatchlistButton anime={watchlistAnime} />
          </div>
        </div>
      </section>

      <section className="episode-section" aria-labelledby="episode-heading">
        <div className="section-heading">
          <h2 id="episode-heading">Daftar episode <small>{sortedEpisodes.length}</small></h2>
          <span className="episode-sort-note">Episode awal → akhir</span>
        </div>
        {sortedEpisodes.length ? (
          <>
            <div className="episode-list">
              {sortedEpisodes.slice(0, visibleCount).map((episode, index) => {
                const id = episode.id || (slug + "__ep__" + (episode.number || index + 1));
                return (
                  <Link className="episode-row" key={id} href={"/watch/" + encodeURIComponent(slug) + "?episode=" + encodeURIComponent(id)}>
                    <span className="episode-number">{String(episode.number || index + 1).padStart(2, "0")}</span>
                    <span className="episode-title">{episode.title || "Episode " + (index + 1)}</span>
                    <span className="episode-date">{episode.date || "Tonton"}</span>
                    <span className="episode-arrow" aria-hidden="true">→</span>
                  </Link>
                );
              })}
            </div>
            {visibleCount < sortedEpisodes.length && (
              <div className="episode-more">
                <button className="quiet-button" onClick={() => setVisibleCount((count) => count + 40)}>
                  Muat lebih banyak ({sortedEpisodes.length - visibleCount} tersisa)
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="empty-inline"><span className="empty-dot" />Daftar episode belum tersedia.</div>
        )}
      </section>
    </main>
  );
}