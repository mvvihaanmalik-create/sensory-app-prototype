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
- Write a review flow (posts into the Reviews tab)
- Book a table and Booking confirmed flow
- Full motion and Reduce motion controls

Search is not implemented yet.

### Booking flow rules

- Nothing is preselected. The CTA reads "Book" until party size, date and time are chosen, then becomes "Book for N · Day, Time".
- Time slots stay greyed until a date is picked. Availability and crowd labels change by day, and parties of 6 or more lose peak slots.
- Changing the date or party size clears the time if that slot is no longer available.
- Tapping the CTA early scrolls to the first missing step and nudges it.
- The confirmation screen is built from the choices (seat, comfort needs, time, crowd, hold time, busy-time tip). "Change or cancel booking" reopens the form with choices kept.

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
