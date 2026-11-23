import type { Metadata } from "next";
import { ScheduleFeed } from "@/components/schedule-feed";

export const metadata: Metadata = { title: "Jadwal rilis" };

export default function SchedulePage() {
  return (
    <main id="main-content" className="page-shell inner-page">
      <section className="page-heading">
        <div><h1>Jadwal rilis</h1></div>
        <p>Anime dan episode yang tercatat dalam jadwal rilis.</p>
      </section>
      <ScheduleFeed />
    </main>
  );
}