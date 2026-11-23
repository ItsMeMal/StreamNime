import Image from "next/image";
import Link from "next/link";
import type { Anime } from "@/lib/anime";
import { formatEpisodeCount } from "@/lib/anime";

export function AnimeCard({ anime }: { anime: Anime; index?: number }) {
  return (
    <Link className="anime-card" href={"/anime/" + encodeURIComponent(anime.slug)} aria-label={"Lihat " + anime.title}>
      <div className="poster-frame">
        {anime.poster ? (
          <Image
            src={anime.poster}
            alt={anime.title}
            fill
            unoptimized
            sizes="(max-width: 380px) 45vw, (max-width: 640px) 29vw, (max-width: 840px) 22vw, (max-width: 1120px) 18vw, 15vw"
          />
        ) : (
          <div className="poster-fallback"><span>SN</span></div>
        )}
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
        <p>{anime.releaseYear || anime.status || "Anime"}</p>
      </div>
    </Link>
  );
}

export function AnimeShelf({
  title,
  anime,
  href = "/anime",
  emptyLabel = "Belum ada anime untuk ditampilkan.",
}: {
  title: string;
  anime: Anime[];
  href?: string;
  emptyLabel?: string;
}) {
  return (
    <section className="home-section">
      <div className="section-heading">
        <h2>{title}</h2>
        <Link href={href} className="text-link">Lihat semua <span>→</span></Link>
      </div>
      {anime.length ? (
        <div className="anime-grid">
          {anime.slice(0, 8).map((item) => <AnimeCard key={item.slug} anime={item} />)}
        </div>
      ) : (
        <div className="empty-inline"><span className="empty-dot" />{emptyLabel}</div>
      )}
    </section>
  );
}