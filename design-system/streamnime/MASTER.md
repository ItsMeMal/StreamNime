# StreamNime Design System

**Product:** Anime discovery and streaming website  
**Mode:** Content browsing and playback  
**Stack:** Next.js App Router, React, TypeScript, plain CSS

## Tokens

| Token | Value |
|---|---|
| Page background | #08090C |
| Main surface | #101217 |
| Raised surface | #171A21 |
| Primary text | #F5F6F8 |
| Secondary text | #A2A7B2 |
| Muted text | #737987 |
| Border | rgba(255,255,255,.09) |
| Accent | #E11D48 |
| Accent hover | #F43F5E |
| Success | #43C88B |
| Typeface | Inter |
| Content width | 1360px |
| Header height | 68px desktop / 104px mobile |

## Information architecture

Header and search first. Homepage presents one compact featured anime panel followed by poster shelves. Catalogue uses search and a dense poster grid. Detail page puts the episode list immediately after the series summary. Watch page gives the video player the largest area, with server selection and episode navigation beneath it.

## Component rules

- Poster images use a consistent 2:2.82 portrait ratio, subtle 7–8px radius, and minimal hover feedback.
- Do not wrap every section in a card. Use spacing and a fine divider to separate shelves.
- Buttons have primary, secondary, ghost, and selected-chip variants. Inputs use the same dark surface, border, and focus color.
- Keep text compact and content-led. Avoid monospace kickers, slogans, gradients, blur, grain, and decorative iconography.
- Images use the existing API's poster/banner URLs with the Next.js Image component unoptimized to avoid imposing an image-host allowlist.
- Use Next.js Link for internal navigation. Keep interactive browser behavior within small client components.

## Responsive rules

Six columns at wide desktop, five below 1120px, four below 840px, three below 640px, and two below 380px. The mobile header keeps brand and search on one row and navigation on the next. The player remains 16:10 only on narrow phones to preserve usable width.

## Accessibility and motion

Maintain readable contrast, visible focus rings, semantic links and buttons, skip navigation, descriptive image alternatives, labels for search, selected states through aria-pressed, and reduced-motion support. Never require hover for access to an action.

## Product exclusions

No marketing sections, pricing, accounts, payments, admin dashboards, social features, fake statistics, or content that is not returned by the catalogue.