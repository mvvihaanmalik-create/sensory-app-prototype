# Sensory app prototype

React + Vite prototype for a sensory-friendly going-out app in Savannah, built for UXDG 370.

## Run locally

Use Node.js 20.19+ or 22.12+ and npm.

```sh
npm ci
npm run dev
```

## Build

```sh
npm run build
```

The build produces a single self-contained `dist/index.html`. Dependencies and generated builds are excluded from Git; the lockfile is included for reproducible installs.

## Current scope

- Home, Map, and Profile screens
- Home card gestures and hero motion
- Map sheet dragging and snap states
- Venue page for Foxy Loxy Cafe (Overview, Menu, Reviews, Photos), opened from the front For you card, Popular #2, or the first map result
- Sense reviews (Sound, Light, Crowd, Temperature, Seating) opened from the sense tiles, with a category bar to switch between them
- Write a review flow (posts into the Reviews tab)
- Book a table in three steps (When, Where to sit with a floor plan, Booking for) and Booking confirmed
- Full motion and Reduce motion controls

Search is not implemented yet.

### Booking flow rules

- Nothing is preselected. Each step's button stays faded until the step is complete; tapping it early scrolls to what's missing and nudges it.
- Step 1: times stay greyed until a date is picked. Availability changes by day, and parties of 6 or more lose peak slots. Changing date or party size clears a time that is no longer free.
- Step 2: four areas (Patio, Garden pond, Indoor, Bar). Which tables are taken depends on the date and time; tables too small for the party fade. Comfort picks that a table can't meet are called out, with a suggested table that fits.
- Step 3: summary rows jump back to the step that owns them; name, phone and email edit inline.
- The confirmation is built from the choices. "Change or cancel booking" reopens step 3 with everything kept.

## Design source

[Figma design](https://www.figma.com/design/piKIGYS9mjqhShrqGn6kGk/Design?node-id=469-2151) · Venue section: node 789-3120

Use the **Final flow**, **DS · Foundations**, and **DS · Components** pages as the design reference. See [HANDOFF.md](HANDOFF.md) for the original implementation notes and screen node IDs.

## Collaboration

The initial upload establishes the baseline on `main`. Make subsequent changes on separate branches and use pull requests to review and merge them. Pull the latest changes before starting work and include a brief description and build result with each pull request.

```sh
git switch main
git pull --ff-only
git switch -c feature/short-description
```
