"use client";

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

    fetch("/api/catalog/anime/" + encodeURIComponent(slug), { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Anime details are unavailable.");
        return response.json();
      })
      .then((payload) => {
        if (!active) return;
        setAnime(normalizeAnime(payload));
        setEpisodes(Array.isArray(payload?.episodes) ? payload.episodes : []);
        setEnglishTitle(payload?.englishTitle || payload?.english_title || "");
      })
      .catch(() => {
        if (active) setFailed(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [slug]);

  if (loading) {
    return (
      <main className="page-shell detail-page">
        <Link href="/anime" className="back-link">← Back to catalogue</Link>
        <div className="empty-state"><span className="empty-state-mark">◌</span><h2>Loading anime file…</h2><p>Retrieving series details and episode information.</p></div>
      </main>
    );
  }

  if (failed || !anime) {
    return (
      <main className="page-shell detail-page">
        <Link href="/anime" className="back-link">← Back to catalogue</Link>
        <div className="empty-state"><span className="empty-state-mark">∅</span><h2>Anime not available</h2><p>This title could not be loaded from the catalogue.</p></div>
      </main>
    );
  }

  const sortedEpisodes = [...episodes].sort((a, b) => Number(a.number || 0) - Number(b.number || 0));
  const firstEpisode = sortedEpisodes[0];
  const firstEpisodeId = firstEpisode?.id || \`\${slug}__ep__\${firstEpisode?.number || 1}\`;
  const genres = anime.genres || [];
  const watchlistAnime: Anime = { ...anime, episodes: sortedEpisodes };

  return (
    <main className="page-shell detail-page">
      <Link href="/anime" className="back-link">← Back to catalogue</Link>
      <section className="detail-hero">
        <div className="detail-poster">
          {anime.poster ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={anime.poster} alt={anime.title} />
          ) : <div className="poster-fallback"><span>SN</span></div>}
        </div>
        <div className="detail-copy">
          <div className="page-kicker"><span>ANIME FILE</span><i /> {anime.type || "SERIES"}</div>
          <h1>{anime.title}</h1>
          {englishTitle && englishTitle !== anime.title && <p className="detail-alt-title">{englishTitle}</p>}
          <div className="detail-meta">
            {anime.releaseYear && <span>{anime.releaseYear}</span>}
            {anime.status && <span>{String(anime.status).toUpperCase()}</span>}
            {anime.score && <span>★ {anime.score}</span>}
            <span>{sortedEpisodes.length || Number(anime.episodes || 0) || "—"} EPISODES</span>
          </div>
          <p className="detail-synopsis">{anime.synopsis || "No synopsis has been supplied for this title."}</p>
          {genres.length > 0 && (
            <div className="genre-list">{genres.map((genre) => <span key={genre}>{genre}</span>)}</div>
          )}
          <div className="detail-actions">
            {firstEpisode && <Link className="button-primary" href={\`/watch/\${encodeURIComponent(slug)}?episode=\${encodeURIComponent(firstEpisodeId)}\`}>Watch episode 1 <span>▶</span></Link>}
            <WatchlistButton anime={watchlistAnime} />
          </div>
        </div>
        <div className="detail-index">FILE NO. / {slug.slice(0, 10).toUpperCase()}</div>
      </section>

      <section className="episode-section">
        <div className="section-heading">
          <div><span className="eyebrow">THE WATCH ORDER</span><h2>Episodes <small>{sortedEpisodes.length}</small></h2></div>
          <span className="episode-sort-note">OLDEST FIRST</span>
        </div>
        {sortedEpisodes.length ? (
          <>
            <div className="episode-list">
              {sortedEpisodes.slice(0, visibleCount).map((episode, index) => {
                const id = episode.id || \`\${slug}__ep__\${episode.number || index + 1}\`;
                return (
                  <Link className="episode-row" key={id} href={\`/watch/\${encodeURIComponent(slug)}?episode=\${encodeURIComponent(id)}\`}>
                    <span className="episode-number">{String(episode.number || index + 1).padStart(2, "0")}</span>
                    <span className="episode-title">{episode.title || \`Episode \${index + 1}\`}</span>
                    <span className="episode-date">{episode.date || "STREAM"}</span>
                    <span className="episode-arrow">↗</span>
                  </Link>
                );
              })}
            </div>
            {visibleCount < sortedEpisodes.length && (
              <div className="episode-more">
                <button className="quiet-button" onClick={() => setVisibleCount((count) => count + 40)}>
                  Show more episodes ({sortedEpisodes.length - visibleCount} remaining) ↓
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="empty-inline"><span className="empty-dot" />Episode information is not available for this title yet.</div>
        )}
      </section>
    </main>
  );
}
