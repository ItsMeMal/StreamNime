import Link from "next/link";
import type { Anime } from "@/lib/anime";
import { formatEpisodeCount } from "@/lib/anime";

export function AnimeCard({ anime, index = 0 }: { anime: Anime; index?: number }) {
  return (
    <Link className="anime-card" href={`/anime/${encodeURIComponent(anime.slug)}`}>
      <div className="poster-frame">
        {anime.poster ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={anime.poster} alt={anime.title} loading={index < 5 ? "eager" : "lazy"} />
        ) : (
          <div className="poster-fallback"><span>SN</span></div>
        )}
        <span className="poster-index">{String(index + 1).padStart(2, "0")}</span>
        <span className="poster-play" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="m9 6 10 6-10 6z" /></svg>
        </span>
      </div>
      <div className="card-copy">
        <div className="card-meta">
          <span>{anime.type || "TV"}</span>
          <span>{formatEpisodeCount(anime.episodes)}</span>
        </div>
        <h3>{anime.title}</h3>
        <p>{anime.releaseYear || anime.status || "Series"}</p>
      </div>
    </Link>
  );
}

export function AnimeShelf({
  title,
  eyebrow,
  anime,
  href = "/anime",
  emptyLabel = "Nothing to show here yet.",
}: {
  title: string;
  eyebrow?: string;
  anime: Anime[];
  href?: string;
  emptyLabel?: string;
}) {
  return (
    <section className="shelf-section">
      <div className="section-heading">
        <div>
          {eyebrow && <span className="eyebrow">{eyebrow}</span>}
          <h2>{title}</h2>
        </div>
        <Link href={href} className="text-link">View collection <span>↗</span></Link>
      </div>
      {anime.length ? (
        <div className="anime-grid">
          {anime.slice(0, 8).map((item, index) => <AnimeCard key={item.slug} anime={item} index={index} />)}
        </div>
      ) : (
        <div className="empty-inline"><span className="empty-dot" />{emptyLabel}</div>
      )}
    </section>
  );
}
