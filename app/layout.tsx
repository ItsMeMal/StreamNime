import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: {
    default: "StreamNime — Anime, in its own time",
    template: "%s · StreamNime",
  },
  description: "A quieter place to discover, follow, and stream anime.",
  applicationName: "StreamNime",
  metadataBase: new URL("https://streamnime.vercel.app"),
  openGraph: {
    title: "StreamNime",
    description: "A quieter place to discover, follow, and stream anime.",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <SiteHeader />
        {children}
        <footer className="site-footer">
          <div className="footer-inner">
            <span className="footer-brand">stream<span>nime</span></span>
            <p>For the stories that stay with you.</p>
            <span className="footer-note">A fan-made anime discovery experience</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
