import type { Metadata } from "next";
import { AnimeExplorer } from "@/components/anime-explorer";
import { getAnimeIndex } from "@/lib/upstream";

export const metadata: Metadata = { title: "Explore anime" };
export const revalidate = 120;

export default async function AnimeIndexPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const anime = await getAnimeIndex(q);

  return (
    <main className="page-shell inner-page">
      <div className="page-kicker"><span>01</span><i /> THE CATALOGUE</div>
      <section className="page-heading">
        <div>
          <span className="eyebrow">FIND YOUR NEXT STORY</span>
          <h1>{q ? <>Results for <em>“{q}”</em></> : <>The anime<br /><em>index.</em></>}</h1>
        </div>
        <p>From the first frame to the final scene. Browse by mood, title, or the feeling you can't quite name.</p>
      </section>
      <AnimeExplorer initialAnime={anime} initialQuery={q} />
    </main>
  );
}
