# StreamNime

A server-rendered anime discovery and streaming frontend powered by the Nexus-Chan API.

## Stack

- Next.js App Router
- React
- HLS.js for HLS playback where native browser support is unavailable
- Vercel deployment

## Local development

1. Copy `.env.example` to `.env.local`.
2. Set the server-only `NEXUS_CHAN_API_URL` value.
3. Install dependencies with `npm install`.
4. Start the app with `npm run dev`.

## API security

The browser only calls StreamNime's same-origin `/api/nexus/*` route. The upstream API base is read from `NEXUS_CHAN_API_URL` on the server and must never be renamed with a `NEXT_PUBLIC_` prefix.

The proxy is GET-only and allowlists the anime read endpoints needed by the application. API-origin references in JSON responses are rewritten to the same-origin proxy, including HLS playlist and subtitle proxy references. No API credential is stored in the repository or shipped to the browser.

Set `NEXUS_CHAN_API_URL` as a server-side Vercel environment variable for Production, Preview, and Development.

## Features

- Anime catalogue and search
- Featured, recently updated, popular, and upcoming shelves
- Anime details and episode guide
- HLS and embed playback
- Stream server selection
- Release schedule
- Device-local watchlist

The watchlist is stored in the browser's local storage; it does not require an account or write to the upstream API.
