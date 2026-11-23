import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAnimeDetail } from "@/lib/upstream";
import { WatchlistButton } from "@/components/watchlist-button";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const anime = await getAnimeDetail(slug);
  return { title: anime?.title || "Anime details", description: anime?.synopsis || "Anime details and episodes on StreamNime." };
}

export default async function AnimeDetailPage({ params }: Props) {
  const { slug } = await params;
  const anime = await getAnimeDetail(slug);
  if (!anime) notFound();

  const episodes = Array.isArray(anime.episodes) ? [...anime.episodes].sort((a: any, b: any) => Number(a.number || 0) - Number(b.number || 0)) : [];
  const genres = Array.isArray(anime.genres) ? anime.genres : [];
  const firstEpisode = episodes[0];
  const episodeId = firstEpisode?.id || `${slug}__ep__${firstEpisode?.number || 1}`;

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
          {anime.englishTitle && anime.englishTitle !== anime.title && <p className="detail-alt-title">{anime.englishTitle}</p>}
          <div className="detail-meta">
            {anime.releaseYear && <span>{anime.releaseYear}</span>}
            {anime.status && <span>{String(anime.status).toUpperCase()}</span>}
            {anime.score && <span>★ {anime.score}</span>}
            <span>{episodes.length || Number(anime.episodes || 0) || "—"} EPISODES</span>
          </div>
          <p className="detail-synopsis">{anime.synopsis || "No synopsis has been supplied for this title."}</p>
          {genres.length > 0 && (
            <div className="genre-list">{genres.map((genre: string) => <span key={genre}>{genre}</span>)}</div>
          )}
          <div className="detail-actions">
            {firstEpisode && <Link className="button-primary" href={`/watch/${encodeURIComponent(slug)}?episode=${encodeURIComponent(episodeId)}`}>Watch episode 1 <span>▶</span></Link>}
            <WatchlistButton anime={{ ...anime, slug, title: anime.title, id: anime.id || slug }} />
          </div>
        </div>
        <div className="detail-index">FILE NO. / {slug.slice(0, 10).toUpperCase()}</div>
      </section>

      <section className="episode-section">
        <div className="section-heading">
          <div><span className="eyebrow">THE WATCH ORDER</span><h2>Episodes <small>{episodes.length}</small></h2></div>
          <span className="episode-sort-note">OLDEST FIRST</span>
        </div>
        {episodes.length ? (
          <div className="episode-list">
            {episodes.map((episode: any, index: number) => {
              const id = episode.id || `${slug}__ep__${episode.number || index + 1}`;
              return (
                <Link className="episode-row" key={id} href={`/watch/${encodeURIComponent(slug)}?episode=${encodeURIComponent(id)}`}>
                  <span className="episode-number">{String(episode.number || index + 1).padStart(2, "0")}</span>
                  <span className="episode-title">{episode.title || `Episode ${index + 1}`}</span>
                  <span className="episode-date">{episode.date || "STREAM"}</span>
                  <span className="episode-arrow">↗</span>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="empty-inline"><span className="empty-dot" />Episode information is not available for this title yet.</div>
        )}
      </section>
    </main>
  );
}
