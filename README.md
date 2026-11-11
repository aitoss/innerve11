# Innerve 11 — Sections (Next.js + Tailwind)

Selected sections from the Innerve 11 hackathon site (Demon Slayer fan build):
breathing-style tracks, Infinity Castle 3D flythrough, prize pool, testimonials,
past sponsors and footer.

Migrated from the original static HTML/CSS/JS build to **Next.js (App Router) + Tailwind CSS**.
The pre-migration static build is preserved on the `legacy-static` branch for rollback.

## Stack

- Next.js 15 + React 19 + TypeScript
- Tailwind CSS 3 (all styling migrated from the hand-written stylesheet; the only
  remaining custom CSS is a small `@layer` for pseudo-element effects: paper grain,
  the footer ichimatsu strip, the page vignette, and split-text spans)
- Three.js 0.160 (Infinity Castle flythrough, `lib/castle/startCastle.ts` — behavior-frozen port
  of the original `castle.js`, wrapped in a start/dispose lifecycle)
- GSAP + ScrollTrigger + Lenis (scroll choreography, `lib/scroll/driver.ts` — faithful port
  of the original `main.js`)

## Structure

- `app/` — App Router shell (`layout.tsx` fonts/metadata, `page.tsx`, `globals.css`)
- `components/` — React UI organized by layout and page section:
  - `Site.tsx` — page orchestrator (scroll driver + section composition)
  - `layout/` — shared layout chrome (`Footer.tsx`, `footer.css`)
  - `sections/` — self-contained page sections (`hero/`, `tracks/`, `castle/`, `prizes/`, `testimonials/`, `sponsors/`, `faq/`)
- `data/` — structured event content (`event.ts`, `tracks.ts`, `castle.ts`, `prizes.ts`, `testimonials.ts`, `sponsors.ts`, `faq.ts`)
- `lib/` — non-UI engines and utilities:
  - `castle/` — Three.js WebGL flythrough (`startCastle.ts`, `textures.ts`)
  - `scroll/` — GSAP/Lenis scroll driver (`driver.ts`, `splitText.ts`)
  - `utils/` — shared helpers (`format.ts`, `scramble.ts`)
- `types/` — TypeScript domain models (`content.ts`) and global window augmentations (`global.d.ts`)
- `public/assets/` — images and logos

## Develop

```bash
npm install
npm run dev
```

## Production

```bash
npm run build
npm start
```

Not affiliated with Demon Slayer, Koyoharu Gotouge or Ufotable.
