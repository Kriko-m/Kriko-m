# Scouts Kriko-M Web App — AI Coding Guidelines & Context

This file provides system context, tech stack specifications, styling guidelines, and command references for AI assistants working on this repository.

## Commands Reference

Always run commands inside the `./website/` directory unless working on Supabase configurations.

* **Start Dev Server:** `cmd /c "npm run dev"`
* **Build App:** `cmd /c "npm run build"`
* **Supabase Local Dev:** `npx supabase start` (requires Docker)
* **Supabase Push Migrations:** `npx supabase db push`

---

## Tech Stack & Architecture

* **Framework:** Next.js (App Router, React 19)
* **Language:** TypeScript (`strict: true`)
* **Database & Auth:** Supabase (PostgreSQL, Supabase Auth)
  * Server client: `@/lib/supabase` (for SSR and Server Actions)
  * Browser client: `@/lib/supabase-browser` (for Client Components)
* **Styling:** Vanilla CSS (`globals.css`)
* **Icons:** FontAwesome (imported globally)

---

## Design System & Styling Tokens

Always use these colors and fonts to keep the UI consistent and professional.

### Color Palette
* **Brand Bordeaux (Primary):** `#650B19` (`--color-primary`)
* **Bordeaux Dark (Headers/Footer):** `#3a0710` (`--color-primary-dark`)
* **Scouts Gold (Accent):** `#C9963A` (`--color-accent`, `--color-secondary`)
* **Gold Hover:** `#B8862F` (`--color-accent-hover`)
* **Gold Light:** `#E2C58D` (`--color-accent-light`)
* **Crème/Linen (Page Background):** `#F0ECE4` (`--color-bg-linen`)
* **White (Cards/Modals):** `#FFFFFF` (`--color-bg-white`)
* **Success Green (Portal Theme):** `#1A3D2A` (primary green), `#EEF5F1` (green background)

### Typography
* **Primary Body & Interface Font:** `Outfit` (sans-serif)
* **Main Titles & Hero Headings:** `Londrina Solid` (display woodblock style)
* **Sub-Headings:** `Nunito` (rounded sans-serif)

---

## Development Constraints & Rules

1. **Beige Flashing Prevention:** 
   * On `/portaal` routes, the body default top-padding and beige background are disabled.
   * Do not put padding-top on the global `body` selector. Instead, wrap public pages in `.public-layout-content` (defined with `padding-top: 70px`).
   * The root `layout.tsx` contains an inline script tag at the top of `<body>` to synchronously inject the portal classes and styles based on the pathname before page load.
2. **Hero Banner Preloading:**
   * Never use CSS `backgroundImage` for main hero banners.
   * Always use Next.js `<Image>` component with `priority`, `fill`, and `style={{ objectFit: 'cover' }}` to leverage WebP optimization and eliminate layout shifts.
   * Set matching background colors on hero sections (`.tak-hero`, `.verhuur-hero`) so they don't flash white while the image is loading.
3. **Contact Details & Copying:**
   * Use the `<CopyButton>` component for email addresses rather than `mailto` links to make copying easy.
   * Always wrap physical addresses in Google Maps search links (`https://www.google.com/maps/search/?api=1&query=...`).
4. **CSS Pictograms:**
   * Always use hex-escaped Unicode characters in CSS `content` (e.g., `content: '\269C'`) for banner title pictograms. Avoid printing literal emojis/special characters directly in `.css` files to prevent Mojibake encoding corruption during compiles.
5. **Horizontal Scrolling Nav (Portaal):**
   * The navigation links in `PortaalNav` scroll horizontally on mobile screens using `flex-nowrap` and `overflow-x-auto`. Keep it this way; do not wrap them or hide them behind hamburgers.
6. **Responsive Layouts:**
   * Use `.portal-grid-layout` (which drops from 2-column `1fr 3fr` to 1-column layout on media query max-width 768px) instead of inline styles for main portal layouts like `LeidingPanel.tsx`.

---

## Git Workflow & Automated Push

* **Automated Git Push:** After completing and verifying a major change, bug fix, or feature update, the AI assistant should automatically stage, commit, and push the changes to GitHub without waiting for an explicit push request from the user. Use semantic commit messages (e.g. `feat:`, `fix:`, `docs:`, `style:`).
