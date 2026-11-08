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
- Full motion and Reduce motion controls
- Foxy Loxy venue: Overview, Menu, Reviews, and Photos tabs
- Fixed Reserve button with independently scrolling venue content
- Home card and ranking entry points, back navigation with Home position restored
- Local save/helpful states, review and photo filters, and selectable crowd bars

Search is not implemented yet. Venue image areas remain the placeholders in the supplied Figma screens. Reserve and Write a review provide prototype feedback; reservation processing and review submission are not connected.

## Design source

[Figma design](https://www.figma.com/design/piKIGYS9mjqhShrqGn6kGk/Design?node-id=469-2151)

Use the **Final flow**, **DS · Foundations**, and **DS · Components** pages as the design reference. See [HANDOFF.md](HANDOFF.md) for the original implementation notes and screen node IDs.

## Collaboration

The initial upload establishes the baseline on `main`. Make subsequent changes on separate branches and use pull requests to review and merge them. Pull the latest changes before starting work and include a brief description and build result with each pull request.

```sh
git switch main
git pull --ff-only
git switch -c feature/short-description
```
