"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimeShelf } from "@/components/anime-card";
import { Skeleton } from "@/components/ui/skeleton";
import { animeList, type Anime } from "@/lib/anime";

type Feed = { ongoing: Anime[]; popular: Anime[]; upcoming: Anime[]; completed: Anime[] };
const emptyFeed: Feed = { ongoing: [], popular: [], upcoming: [], completed: [] };

export function HomeFeed() {
  const [feed, setFeed] = useState<Feed>(emptyFeed);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setFailed(false);
      try {
        const response = await fetch("/api/catalog/anime/homepage", { cache: "no-store" });
        if (!response.ok) throw new Error("Katalog tidak tersedia");
        const payload = await response.json();
        if (!active) return;
        setFeed({
          ongoing: animeList(payload?.ongoing),
          popular: animeList(payload?.popular),
          upcoming: animeList(payload?.upcoming),
          completed: animeList(payload?.completed),
        });
      } catch {
        if (active) setFailed(true);
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, [reload]);

  const featured = feed.popular[0] || feed.ongoing[0] || feed.completed[0] || feed.upcoming[0] || null;
  const featuredImage = featured?.banner || featured?.poster || "";
  const latest = feed.ongoing.filter((anime) => anime.slug !== featured?.slug);
  const popular = feed.popular.filter((anime) => anime.slug !== featured?.slug);

  return (
    <main id="main-content">
      <div className="page-shell home-shell">
        {featured ? (
          <section className="hero">
            {featuredImage && <Image className="hero-image" src={featuredImage} alt="" fill priority unoptimized sizes="100vw" />}
            <div className="hero-content">
              <h1>{featured.title}</h1>
              {featured.synopsis && <p className="hero-description">{featured.synopsis}</p>}
              <div className="hero-facts">
                {featured.releaseYear && <span>{featured.releaseYear}</span>}
                {featured.type && <span>{String(featured.type).toUpperCase()}</span>}
                {featured.score && <span>★ {featured.score}</span>}
                {featured.status && <span>{featured.status}</span>}
              </div>
              <div className="hero-actions">
                <Link className="button-primary" href={"/anime/" + encodeURIComponent(featured.slug)}>
                  Lihat anime <span aria-hidden="true">→</span>
                </Link>
                <Link className="button-secondary" href="/anime">Semua anime</Link>
              </div>
            </div>
          </section>
        ) : loading ? (
          <div className="hero-skeleton" aria-hidden="true" />
        ) : null}

        {failed && (
          <div className="feed-error" role="alert">
            <span>Katalog gagal dimuat. Periksa koneksi lalu coba lagi.</span>
            <button className="quiet-button" onClick={() => setReload((value) => value + 1)}>Coba lagi</button>
          </div>
        )}

        {loading ? (
          <section className="home-section" aria-label="Memuat anime" aria-busy="true">
            <div className="section-heading"><h2>Anime</h2></div>
            <div className="anime-grid">
              {Array.from({ length: 6 }).map((_, index) => (
                <div className="anime-card-skeleton" key={index}>
                  <Skeleton className="skeleton-poster" />
                  <Skeleton className="skeleton-line" />
                  <Skeleton className="skeleton-line short" />
                </div>
              ))}
            </div>
          </section>
        ) : (
          <>
            <AnimeShelf title="Update terbaru" anime={latest} emptyLabel="Belum ada update terbaru." />
            <AnimeShelf title="Paling populer" anime={popular} emptyLabel="Data anime populer belum tersedia." />
            <AnimeShelf title="Akan datang" anime={feed.upcoming} href="/schedule" emptyLabel="Belum ada jadwal anime mendatang." />
            {feed.completed.length > 0 && <AnimeShelf title="Tamat" anime={feed.completed} />}
          </>
        )}
      </div>
    </main>
  );
}