"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState("");

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = query.trim();
    router.push(value ? `/anime?q=${encodeURIComponent(value)}` : "/anime");
  }

  const active = (href: string) => pathname === href || (href === "/anime" && pathname.startsWith("/anime/"));

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="brand" href="/" aria-label="StreamNime home">
          <span className="brand-mark"><span /></span>
          <span>stream<span className="brand-accent">nime</span></span>
        </Link>
        <nav className="main-nav" aria-label="Main navigation">
          <Link className={active("/anime") ? "nav-link active" : "nav-link"} href="/anime">Explore</Link>
          <Link className={active("/schedule") ? "nav-link active" : "nav-link"} href="/schedule">Schedule</Link>
          <Link className={active("/watchlist") ? "nav-link active" : "nav-link"} href="/watchlist">My list</Link>
        </nav>
        <form className="header-search" onSubmit={submitSearch} role="search">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 5 5" /></svg>
          <input aria-label="Search anime" placeholder="Find a series..." value={query} onChange={(event) => setQuery(event.target.value)} />
          <kbd>/</kbd>
        </form>
      </div>
    </header>
  );
}
