"use client";

import { useEffect, useState } from "react";
import type { Anime } from "@/lib/anime";
import { AnimeCard } from "@/components/anime-card";

const KEY = "streamnime.watchlist.v1";

export function WatchlistView() {
  const [items, setItems] = useState<Anime[]>([]);
  useEffect(() => {
    try { setItems(JSON.parse(localStorage.getItem(KEY) || "[]")); } catch {}
  }, []);

  function clearList() {
    localStorage.removeItem(KEY);
    setItems([]);
  }

  return (
    <>
      <div className="explore-result-line">
        <span>{items.length} saved {items.length === 1 ? "title" : "titles"}</span>
        {items.length > 0 && <button className="quiet-button" onClick={clearList}>Clear list</button>}
      </div>
      {items.length ? (
        <div className="anime-grid explore-grid">
          {items.map((item, index) => <AnimeCard key={item.slug} anime={item} index={index} />)}
        </div>
      ) : (
        <div className="empty-state">
          <span className="empty-state-mark">＋</span>
          <h2>Your list starts here</h2>
          <p>Save a series from its detail page and it will stay here on this device.</p>
        </div>
      )}
    </>
  );
}
