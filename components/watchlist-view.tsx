"use client";

import { useEffect, useState } from "react";
import type { Anime } from "@/lib/anime";
import { AnimeCard } from "@/components/anime-card";
import { Button } from "@/components/ui/button";

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
        <span>{items.length} anime tersimpan</span>
        {items.length > 0 && <Button variant="ghost" size="sm" onClick={clearList}>Hapus semua</Button>}
      </div>
      {items.length ? (
        <div className="anime-grid explore-grid">
          {items.map((item) => <AnimeCard key={item.slug} anime={item} />)}
        </div>
      ) : (
        <div className="empty-state">
          <span className="empty-state-mark" aria-hidden="true">＋</span>
          <h2>Watchlist masih kosong</h2>
          <p>Simpan anime dari halaman detail. Daftar ini hanya tersimpan di perangkat yang sedang digunakan.</p>
        </div>
      )}
    </>
  );
}