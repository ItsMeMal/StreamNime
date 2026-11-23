import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: { default: "StreamNime — Nonton Anime", template: "%s · StreamNime" },
  description: "Cari anime, lihat detail dan episode, lalu tonton di StreamNime.",
  applicationName: "StreamNime",
  metadataBase: new URL("https://streamnime-green.vercel.app"),
  openGraph: {
    title: "StreamNime",
    description: "Katalog anime dan streaming episode.",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>
        <a className="skip-link" href="#main-content">Lewati navigasi</a>
        <SiteHeader />
        {children}
        <footer className="site-footer">
          <div className="footer-inner">
            <Link className="footer-brand" href="/">stream<span>nime</span></Link>
            <nav className="footer-links" aria-label="Navigasi footer">
              <Link href="/anime">Anime</Link>
              <Link href="/schedule">Jadwal</Link>
              <Link href="/watchlist">Watchlist</Link>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}