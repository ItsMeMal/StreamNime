"use client";

import { useEffect, useState } from "react";
import type { Anime } from "@/lib/anime";

const KEY = "streamnime.watchlist.v1";

export function WatchlistButton({ anime }: { anime: Anime }) {
  const [saved, setSaved] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const list = JSON.parse(localStorage.getItem(KEY) || "[]") as Anime[];
      setSaved(list.some((item) => item.slug === anime.slug));
    } catch {}
    setReady(true);
  }, [anime.slug]);

  function toggle() {
    let list: Anime[] = [];
    try { list = JSON.parse(localStorage.getItem(KEY) || "[]"); } catch {}
    const next = saved
      ? list.filter((item) => item.slug !== anime.slug)
      : [{ ...anime, episodes: typeof anime.episodes === "number" ? anime.episodes : 0 }, ...list.filter((item) => item.slug !== anime.slug)];
    localStorage.setItem(KEY, JSON.stringify(next));
    setSaved(!saved);
  }

  return (
    <button className={saved ? "button-secondary saved" : "button-secondary"} onClick={toggle} disabled={!ready}>
      <span>{saved ? "✓" : "+"}</span>{saved ? "In your list" : "Add to my list"}
    </button>
  );
}
