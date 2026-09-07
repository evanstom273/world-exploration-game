# World Exploration Game

A non-VR, first-person Earth exploration game inspired by Wander. This milestone delivers a **Street View exploration prototype** — look around real locations and walk connected panoramas.

## Prerequisites

1. A [Google Cloud](https://console.cloud.google.com/) project with billing enabled
2. Enable these APIs:
   - Maps JavaScript API
   - Places API (New)
3. Create an API key and restrict it appropriately for development/production

## Setup

```bash
npm install
cp .env.example .env.local
```

Add your API key to `.env.local`:

```env
VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
```

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
```

## GitHub Pages

The site deploys automatically to GitHub Pages when changes land on `main`.

**Live URL:** https://evanstom273.github.io/world-exploration-game/

### One-time setup

1. In the repo **Settings → Secrets and variables → Actions**, add:
   - `VITE_GOOGLE_MAPS_API_KEY` — your Google Maps API key
2. In **Settings → Pages**, set **Source** to **GitHub Actions** (if not already).
3. Restrict your API key's HTTP referrers to include:
   - `https://evanstom273.github.io/*`
   - `http://localhost:*` (for local development)

You can also trigger a deploy manually from the **Actions** tab via **Deploy to GitHub Pages → Run workflow**.

## Controls

| Input | Action |
| --- | --- |
| Mouse / touch drag | Look around |
| On-screen arrows | Move to connected panoramas |
| `W` / `↑` | Move forward in the direction you are facing |
| `A` / `←`, `D` / `→` | Rotate view left / right |
| Search box | Jump to a real-world place via Places text search |

## Architecture

Maps integration lives under `src/maps/` so future milestones can add Photorealistic 3D Tiles, an Earth view, bookmarks, exploration history, and Gemini Maps grounding without rewriting the Street View layer.

- `loader.ts` — API bootstrap and dynamic library loading
- `streetView.ts` — panorama lookup, navigation helpers, panorama factory
- `places.ts` — location search
- `types.ts` — shared geographic and UI state types

## Default location

The app starts at **Times Square, New York** — a location with reliable outdoor Street View coverage.

## License

Private project.
