import type { Metadata } from "next";
import { ScheduleFeed } from "@/components/schedule-feed";

export const metadata: Metadata = { title: "Release schedule" };

export default function SchedulePage() {
  return (
    <main className="page-shell inner-page">
      <div className="page-kicker"><span>02</span><i /> RELEASE CALENDAR</div>
      <section className="page-heading">
        <div><span className="eyebrow">KEEP AN EYE ON WHAT'S NEXT</span><h1>Release <em>watch.</em></h1></div>
        <p>Upcoming episodes and new additions, collected from the anime catalogue.</p>
      </section>
      <ScheduleFeed />
    </main>
  );
}
