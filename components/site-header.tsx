"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Input } from "@/components/ui/input";

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = query.trim();
    router.push(value ? "/anime?q=" + encodeURIComponent(value) : "/anime");
  }

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      const target = event.target;
      const editing = target instanceof HTMLElement && (
        target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)
      );
      if (event.key === "/" && !editing && !event.metaKey && !event.ctrlKey && !event.altKey) {
        event.preventDefault();
        searchRef.current?.focus();
      }
      if (event.key === "Escape") searchRef.current?.blur();
    }
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  const active = (href: string) => pathname === href || (href === "/anime" && pathname.startsWith("/anime/"));

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="brand" href="/" aria-label="StreamNime beranda">
          stream<span className="brand-accent">nime</span>
        </Link>
        <nav className="main-nav" aria-label="Navigasi utama">
          <Link className={pathname === "/" ? "nav-link active" : "nav-link"} href="/">Beranda</Link>
          <Link className={active("/anime") ? "nav-link active" : "nav-link"} href="/anime">Anime</Link>
          <Link className={active("/schedule") ? "nav-link active" : "nav-link"} href="/schedule">Jadwal</Link>
          <Link className={active("/watchlist") ? "nav-link active" : "nav-link"} href="/watchlist">Watchlist</Link>
        </nav>
        <form className="header-search" onSubmit={submitSearch} role="search" aria-label="Cari anime">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 5 5" /></svg>
          <Input
            ref={searchRef}
            type="search"
            aria-label="Cari judul anime"
            placeholder="Cari anime..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <kbd aria-hidden="true">/</kbd>
        </form>
      </div>
    </header>
  );
}