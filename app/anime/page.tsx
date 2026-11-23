import type { Metadata } from "next";
import { AnimeExplorer } from "@/components/anime-explorer";

export const metadata: Metadata = { title: "Anime" };

export default async function AnimeIndexPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  return (
    <main id="main-content" className="page-shell inner-page">
      <section className="page-heading">
        <div>
          <h1>{q ? "Hasil pencarian" : "Semua anime"}</h1>
          {q && <p>Hasil untuk “{q}”</p>}
        </div>
        {!q && <p>Cari judul anime dan buka detail untuk melihat daftar episodenya.</p>}
      </section>
      <AnimeExplorer initialAnime={[]} initialQuery={q} />
    </main>
  );
}