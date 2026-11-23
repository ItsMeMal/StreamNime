import type { Metadata } from "next";
import { WatchlistView } from "@/components/watchlist-view";

export const metadata: Metadata = { title: "My list" };

export default function WatchlistPage() {
  return (
    <main className="page-shell inner-page">
      <div className="page-kicker"><span>03</span><i /> YOUR PERSONAL SHELF</div>
      <section className="page-heading">
        <div><span className="eyebrow">KEEP WHAT YOU LOVE CLOSE</span><h1>My <em>list.</em></h1></div>
        <p>A small shelf for the series you want to come back to. Saved locally on this device.</p>
      </section>
      <WatchlistView />
    </main>
  );
}
