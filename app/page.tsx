import Link from "next/link";
import { AnimeShelf } from "@/components/anime-card";
import { getHomepage } from "@/lib/nexus";

export const revalidate = 180;

export default async function HomePage() {
  const { ongoing, popular, upcoming, completed } = await getHomepage();
  const featured = popular[0] || ongoing[0] || completed[0] || upcoming[0] || null;
  const featuredImage = featured?.banner || featured?.poster;
  const latest = ongoing.filter((anime) => anime.slug !== featured?.slug);
  const trending = popular.filter((anime) => anime.slug !== featured?.slug);

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
                  <Link className="button-primary" href={`/anime/${encodeURIComponent(featured.slug)}`}>
                    Explore series <span>↗</span>
                  </Link>
                  <Link className="button-quiet" href="/anime">Browse catalogue <span>→</span></Link>
                </div>
              </>
            ) : (
              <>
                <p className="hero-overline">YOUR NEXT OBSESSION STARTS HERE</p>
                <h1>Find a story<br /><em>worth staying up for.</em></h1>
                <p className="hero-description">Explore the catalogue, follow new releases, and settle in for your next series.</p>
                <div className="hero-actions">
                  <Link className="button-primary" href="/anime">Explore anime <span>↗</span></Link>
                </div>
                <p className="service-note">The catalogue is connecting to its source. Check back in a moment.</p>
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

        <AnimeShelf title="Recently updated" eyebrow="FRESH FROM THE CATALOGUE" anime={latest} href="/anime" emptyLabel="No recently updated titles are available right now." />
        <AnimeShelf title="Worth your time" eyebrow="POPULAR RIGHT NOW" anime={trending} href="/anime" emptyLabel="Popular titles will appear here when the catalogue responds." />
        <AnimeShelf title="On the horizon" eyebrow="COMING UP" anime={upcoming} href="/schedule" emptyLabel="No upcoming releases have been listed." />

        {completed.length > 0 && <AnimeShelf title="Finished stories" eyebrow="COMPLETE SERIES" anime={completed} href="/anime" />}
        <div className="home-endcap">
          <span>STAY FOR ONE MORE EPISODE</span>
          <Link href="/anime">Find your next series <span>↗</span></Link>
        </div>
      </div>
    </main>
  );
}
