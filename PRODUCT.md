# StreamNime

StreamNime is an anime discovery and streaming website powered by the existing Nexus-Chan API integration.

## Main user tasks

- Browse current, popular, upcoming, and completed anime.
- Search for anime titles.
- Open series details and select episodes.
- Watch through HLS or embedded video sources and switch available servers.
- View the release schedule.
- Save anime to a device-local watchlist.

## Product constraints

Preserve the existing Nexus-Chan server-side proxy, route structure, API paths, identifiers, HLS and embed support, subtitle tracks, stream-server selection, schedule endpoint, and local watchlist key. The UI must not expose the upstream API origin.

Do not add accounts, payments, business dashboards, social features, pricing, or marketing sections. StreamNime is a streaming website. The catalogue, anime details, episodes, and player are the product.