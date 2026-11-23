import type { Metadata } from "next";
import { AnimeCard } from "@/components/anime-card";
import { getAnimeSchedule } from "@/lib/upstream";

export const metadata: Metadata = { title: "Release schedule" };
export const revalidate = 300;

export default async function SchedulePage() {
  const schedule = await getAnimeSchedule();
  return (
    <main className="page-shell inner-page">
      <div className="page-kicker"><span>02</span><i /> RELEASE CALENDAR</div>
      <section className="page-heading">
        <div><span className="eyebrow">KEEP AN EYE ON WHAT'S NEXT</span><h1>Release <em>watch.</em></h1></div>
        <p>Upcoming episodes and new additions, collected from the Nexus-Chan anime catalogue.</p>
      </section>
      {schedule.length ? (
        <div className="anime-grid explore-grid">
          {schedule.map((item, index) => <AnimeCard key={item.slug} anime={item} index={index} />)}
        </div>
      ) : (
        <div className="empty-state">
          <span className="empty-state-mark">◷</span>
          <h2>No releases listed</h2>
          <p>The schedule has not returned any upcoming titles yet.</p>
        </div>
      )}
    </main>
  );
}
