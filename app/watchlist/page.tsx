import type { Metadata } from "next";
import { WatchlistView } from "@/components/watchlist-view";

export const metadata: Metadata = { title: "Watchlist" };

export default function WatchlistPage() {
  return (
    <main id="main-content" className="page-shell inner-page">
      <section className="page-heading">
        <div><h1>Watchlist</h1></div>
        <p>Anime yang kamu simpan di perangkat ini.</p>
      </section>
      <WatchlistView />
    </main>
  );
}