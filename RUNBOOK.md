# Kompendium.co — Site Runbook

The reimagined marketing site for **Kompendium, LLC**. Static, dependency-free
(no build step), hosted on **GitHub Pages** at the custom domain `kompendium.co`.

---

## 1. What's here

```
index.html          Homepage (single page, all sections inline)
styles.css          Full design system + responsive + reduced-motion
main.js             Nav, scroll reveals, ecosystem diagram, count-up stats
404.html            Branded not-found page
site.webmanifest    PWA manifest
CNAME               Custom domain (kompendium.co) — do not delete
assets/             Brand assets used by the site (copied from the media pack)
accu2/              ACCU2 wallet subsite (linked from the homepage)
Kompendium-media-pack/  Full brand kit (source of truth for logos/colors)
media/              Legacy icons from the previous site (unused by new index)
```

There is **no build tooling** — edit the files and the site is done. This keeps
GitHub Pages deploys instant and the site maintainable by anyone.

---

## 2. Design system (quick reference)

Tokens live at the top of `styles.css` under `:root`. They mirror the media pack.

| Token | Hex | Use |
|-------|-----|-----|
| `--blue` | `#2563eb` | Primary accent, CTAs, links-in-diagram |
| `--ink` | `#111827` | Headings, the one dark band |
| `--sky` | `#38bdf8` | Gradient partner, highlights |
| `--teal` | `#0d9488` | Inline links, "live" tags |
| `--silver` / `--slate-2` | `#64748b` / `#475569` | Muted text |
| `--mist` / `--white` | `#f8fafc` / `#fff` | Backgrounds (light, per brief) |

**Type:** Fraunces (display) · Inter (UI/body) · JetBrains Mono (eyebrows & data),
loaded from Google Fonts. **Motif:** everything is *bracketed* — mono eyebrows in
`[ … ]`, the `[|<]` mark, corner brackets. Keep new sections consistent with this.

**Backgrounds stay light** by design. The single deliberate dark ("ink") band is the
Infrastructure section — don't add more dark zones.

---

## 3. Editing content

Everything is plain HTML in `index.html`, grouped by clearly-commented sections:
`NAV → HERO → ROLES → ACCUMULATE → CAPABILITIES → WORK → INFRASTRUCTURE → CTA → FOOTER`.

- **Hero copy / proof stats** → `.hero` section.
- **Ecosystem diagram** → the `<svg class="ecosystem__svg">`. Each contribution is a
  `<g class="node" data-node="KEY">`. To add/rename a node: add a `<g>` with a unique
  `data-node`, then add a matching `KEY: [...]` entry in the `PANEL` map in `main.js`.
  Edges from the core are drawn automatically in JS from each node's `translate()`.
- **Capabilities** → `.cap-grid`, six `<article class="cap">` cards with inline SVG icons.
- **Work/portfolio** → `.work-grid` (ACCU2 is the feature card; OpenDLT, Certen.io follow).
- **Stats** → any element with `data-count="N"` (optional `data-suffix="%"`) counts up on scroll.

Reveal-on-scroll is automatic for `.acc-card`, `.cap`, `.work`, `.infra-stat`, plus any
element you tag with `class="reveal"`.

---

## 4. Brand assets

Site assets in `assets/` are copies from `Kompendium-media-pack/` (the source of truth).
If the brand changes, re-copy:

```bash
cp Kompendium-media-pack/logos/svg/kompendium-logo-full-color.svg assets/logo-full.svg
cp Kompendium-media-pack/logos/svg/kompendium-k-mark.svg           assets/k-mark.svg
cp Kompendium-media-pack/icons/kompendium-k-mark-192.png           assets/icon-192.png
cp Kompendium-media-pack/icons/kompendium-k-mark-512.png           assets/icon-512.png
cp Kompendium-media-pack/social/kompendium-social-card-1200x630.jpg assets/social-card.jpg
```

The nav/hero `[|<]` mark and the ecosystem core node are drawn inline as SVG so they
animate and inherit color — they are intentionally *not* image files.

---

## 5. Deploy

> **⚠️ Cache-busting — do this whenever you change `styles.css` or `main.js`.**
> The domain sits behind Cloudflare, and GitHub Pages serves assets with
> `Cache-Control: max-age=14400` (4 h). Without a version change, browsers and the
> CDN keep serving the **old** CSS/JS against new HTML — the page renders unstyled
> and "out of control." Fix: bump the `?v=` query on the asset links in `index.html`
> (and `404.html`) every time those files change:
>
> ```html
> <link rel="stylesheet" href="styles.css?v=20260712b" />   <!-- bump the value -->
> <script src="main.js?v=20260712b"></script>
> ```
>
> Changing the value makes it a new URL, so every visitor fetches fresh immediately.
> Use a date or incrementing tag. (HTML itself has a short 10-min TTL, so it updates
> on its own.)

GitHub Pages serves from this repo. To publish:

```bash
git add -A
git commit -m "Reimagine kompendium.co homepage"
git push origin main        # Pages rebuilds automatically on push to the published branch
```

> This branch is currently `accu2-page`. Merge into `main` (the Pages source branch)
> to go live, or open a PR. Confirm the Pages source branch under
> **Settings → Pages** before pushing.

`CNAME` pins the custom domain — keep it committed or the domain unbinds on deploy.

### Verify after deploy
1. `https://kompendium.co/` loads, fonts render, hero mark animates.
2. Hover the ecosystem nodes → side panel updates; edges highlight.
3. `https://kompendium.co/accu2/` still resolves (subsite untouched).
4. Mobile: open the hamburger menu; no horizontal scroll.
5. Social preview: share the URL — the OG card (`assets/social-card.jpg`) shows.

---

## 6. Local preview

```bash
python -m http.server 8099    # then open http://localhost:8099/
```

Fonts and the ACCU2 link require serving over HTTP (not opening the file directly).

---

## 7. Accessibility & performance floor

- Reduced motion honored (`@media (prefers-reduced-motion: reduce)`).
- Keyboard: skip-link, focus-visible rings, ecosystem nodes are focusable buttons.
- No horizontal overflow at 320–1440+ (verified). Marquee overflow is masked/clipped.
- Zero JS dependencies; fonts are the only external request.
