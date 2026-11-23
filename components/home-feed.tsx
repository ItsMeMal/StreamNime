"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimeShelf } from "@/components/anime-card";
import { animeList, type Anime } from "@/lib/anime";

type Feed = { ongoing: Anime[]; popular: Anime[]; upcoming: Anime[]; completed: Anime[] };

const emptyFeed: Feed = { ongoing: [], popular: [], upcoming: [], completed: [] };

export function HomeFeed() {
  const [feed, setFeed] = useState<Feed>(emptyFeed);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const response = await fetch("/api/catalog/anime/homepage", { cache: "no-store" });
        if (!response.ok) throw new Error("Catalogue request failed");
        const payload = await response.json();
        if (!active) return;

        setFeed({
          ongoing: animeList(payload?.ongoing),
          popular: animeList(payload?.popular),
          upcoming: animeList(payload?.upcoming),
          completed: animeList(payload?.completed),
        });
        setFailed(false);
      } catch {
        if (active) setFailed(true);
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();
    return () => { active = false; };
  }, []);

  const featured = feed.popular[0] || feed.ongoing[0] || feed.completed[0] || feed.upcoming[0] || null;
  const featuredImage = featured?.banner || featured?.poster;
  const latest = feed.ongoing.filter((anime) => anime.slug !== featured?.slug);
  const trending = feed.popular.filter((anime) => anime.slug !== featured?.slug);

  return (
    <main>
      <div className="page-shell home-shell">
        <section className={featured ? "hero hero-with-image" : "hero hero-empty"}>
          {featuredImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="hero-image" src={featuredImage} alt="" />
          )}
          <div className="hero-grain" />
          <div className="hero-content">
            <div className="hero-kicker"><span className="live-indicator" />THE ANIME EDITION <span className="kicker-divider">/</span> VOL. 01</div>
            {featured ? (
              <>
                <p className="hero-overline">THE FEATURED STORY</p>
                <h1>{featured.title}</h1>
                <p className="hero-description">{featured.synopsis || "A new story is waiting. Step in and find out where it takes you."}</p>
                <div className="hero-facts">
                  {featured.releaseYear && <span>{featured.releaseYear}</span>}
                  {featured.type && <span>{String(featured.type).toUpperCase()}</span>}
                  {featured.score && <span>★ {featured.score}</span>}
                </div>
                <div className="hero-actions">
                  <Link className="button-primary" href={\`/anime/\${encodeURIComponent(featured.slug)}\`}>Explore series <span>↗</span></Link>
                  <Link className="button-quiet" href="/anime">Browse catalogue <span>→</span></Link>
                </div>
              </>
            ) : (
              <>
                <p className="hero-overline">{loading ? "CONNECTING TO THE CATALOGUE" : "YOUR NEXT OBSESSION STARTS HERE"}</p>
                <h1>Find a story<br /><em>worth staying up for.</em></h1>
                <p className="hero-description">Explore the catalogue, follow new releases, and settle in for your next series.</p>
                <div className="hero-actions">
                  <Link className="button-primary" href="/anime">Explore anime <span>↗</span></Link>
                </div>
                {!loading && failed && <p className="service-note">The catalogue is temporarily unavailable. Try again in a moment.</p>}
              </>
            )}
          </div>
          {featured && (
            <div className="hero-side-label">
              <span>STREAMNIME SELECTS</span>
              <span>01 — 01</span>
            </div>
          )}
          <div className="hero-bottomline"><span>DISCOVER SOMETHING NEW</span><span>SCROLL TO EXPLORE ↓</span></div>
        </section>

        <div className="home-intro">
          <span className="eyebrow">A LITTLE LESS SCROLLING</span>
          <p>Good stories find their way to you.</p>
        </div>

        {loading ? (
          <div className="shelf-section"><div className="empty-inline"><span className="empty-dot" />Loading the anime catalogue…</div></div>
        ) : (
          <>
            <AnimeShelf title="Recently updated" eyebrow="FRESH FROM THE CATALOGUE" anime={latest} href="/anime" emptyLabel="No recently updated titles are available right now." />
            <AnimeShelf title="Worth your time" eyebrow="POPULAR RIGHT NOW" anime={trending} href="/anime" emptyLabel="Popular titles will appear here when the catalogue responds." />
            <AnimeShelf title="On the horizon" eyebrow="COMING UP" anime={feed.upcoming} href="/schedule" emptyLabel="No upcoming releases have been listed." />
            {feed.completed.length > 0 && <AnimeShelf title="Finished stories" eyebrow="COMPLETE SERIES" anime={feed.completed} href="/anime" />}
          </>
        )}

        <div className="home-endcap">
          <span>STAY FOR ONE MORE EPISODE</span>
          <Link href="/anime">Find your next series <span>↗</span></Link>
        </div>
      </div>
    </main>
  );
}
