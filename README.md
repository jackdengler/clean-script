# Movie Planner

A mobile-first Progressive Web App for planning movies you want to write.
Your data lives in a GitHub repo you control — no separate backend, no AI.

## Features

Unlimited movie projects. Each project has seven tabs:

- **Outline** — pick from Three-Act / Save the Cat / Hero's Journey / Freeform templates
- **Brainstorming** — project-scoped freeform notes
- **Characters** — one markdown file per character
- **Scenes** — ordered, drag-to-reorder, numbered
- **Locations** — worldbuilding entries
- **Visuals** — mood-board by image URL
- **Music** — song / score ideas with links

Plus a top-level **General Brainstorming** page for ideas that aren't tied to a project yet.

All files are plain Markdown + YAML frontmatter in your GitHub repo, so you can
also edit them directly on github.com or in any text editor.

## Getting started

### 1. Pick (or create) a data repo

Create a repo on GitHub to hold your planning data (it can be this same repo,
or a different one — it just needs to exist). A private empty repo works great.

### 2. Create a fine-grained Personal Access Token

Go to **GitHub → Settings → Developer settings → Personal access tokens →
Fine-grained tokens → [Generate new token](https://github.com/settings/personal-access-tokens/new)**

- **Repository access**: Only select repositories → your data repo
- **Repository permissions**:
  - Contents: **Read and write**
  - Metadata: **Read-only**

Copy the token.

### 3. Open the app and connect

Visit the deployed PWA (see below), enter your GitHub owner, repo name,
branch, and the PAT. The token is stored only on your device.

### 4. Install to your home screen

- **iOS Safari**: Share → Add to Home Screen
- **Android Chrome**: menu → Install app

## Development

```bash
npm install
npm run dev
```

Vite will print a LAN URL you can open from your phone.

```bash
npm run build     # production build
npm run typecheck # type check only
```

## Deployment

Pushing to `main` deploys the app to GitHub Pages via the workflow in
`.github/workflows/deploy.yml`.

One-time setup: in the repo on github.com, go to **Settings → Pages →
Build and deployment → Source: GitHub Actions**. The site will be published
at `https://<owner>.github.io/clean-script/`.

## Data layout

```
brainstorming.md              # top-level, general ideas
movies/
  <project-slug>/
    project.json              # title, logline, template, timestamps
    outline.md                # seeded from template on creation
    brainstorming.md          # per-project
    characters/<slug>.md
    scenes/<NNN-slug>.md      # zero-padded order prefix
    locations/<slug>.md
    visuals/<slug>.md         # frontmatter.image is a URL
    music/<slug>.md
```
