import Link from "next/link";

export default function NotFound() {
  return (
    <main className="page-shell not-found">
      <span className="eyebrow">404 / LOST IN THE FRAME</span>
      <h1>This scene<br /><em>isn't here.</em></h1>
      <p>The page may have moved, or the title is no longer in the catalogue.</p>
      <Link className="button-primary" href="/anime">Return to anime <span>↗</span></Link>
    </main>
  );
}
