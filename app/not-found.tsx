import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main-content" className="page-shell not-found">
      <h1>Halaman tidak ditemukan</h1>
      <p>Alamat ini tidak tersedia atau anime sudah tidak ada di katalog.</p>
      <Link className="button-primary" href="/anime">Kembali ke anime</Link>
    </main>
  );
}