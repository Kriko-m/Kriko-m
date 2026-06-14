# Scouts Kriko-M Web App — AI Coding Guidelines & Context

This file provides system context, tech stack specifications, styling guidelines, and command references for AI assistants working on this repository.

---

## Product Vision & Direction

Kriko-M is the website for a Belgian scouts group (Scouts & Gidsen Vlaanderen,
Sint-Niklaas). It has two halves: a **public marketing site** and a small
**operational tool** for leiding and parents.

**Guiding principle — keep it minimal.** The site exists to do the few things
email can't, *without* re-inventing things that already work. Email (sent from the
S&G Groepsadmin site, which already holds every parent's address) remains the
group's communication channel. WhatsApp is the leiding's last-minute push channel.
The site should **not** try to replace either — it should remove specific recurring
email burdens by turning them into structured, self-service flows.

**What the site is for (the only real jobs):**
1. Let parents say **yes/no** to a camp/weekend.
2. Let parents see a **private** uitnodiging + practical info (not public, not
   indexed).
3. Let parents **order** webshop items and receive payment instructions.
4. Give leiding a place to manage camps, echos, the calendar, and a per-werkjaar
   archive.

**Deliberate architectural decisions (target state — see `IMPLEMENTATION.md`):**
- **No parent accounts.** Camp RSVP works via an unguessable per-camp link that
  leiding paste into their S&G-composed email; parents self-declare child + tak +
  ja/nee. The webshop is accountless (name + email at checkout).
- **No S&G API integration.** Medical fiches stay in S&G where leiding read them
  directly — the site never stores medical or other S&G-sourced personal data.
- **Login is leiding-only** (Supabase email/password).
- **Site-sent email is limited to the webshop order confirmation** (Resend).
- **Server-side price validation** on all orders; never trust client prices.
- Data is scoped by **werkjaar**; a once-a-year groepsleiding "rollover" snapshots
  the year into a leiding-only archive (draft → publish, never an accidental
  click).

> NOTE: The current codebase still contains the older account-based portal and a
> half-built S&G integration. `IMPLEMENTATION.md` (repo root) is the authoritative
> plan for migrating to the target state above — it lists what to **build**, what
> to **delete**, and the order to do it in. Consult it before extending the portal.

---

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
   * Do not put padding-top on the global `body` selector.
   * The root `layout.tsx` contains an inline script tag at the top of `<body>` to synchronously inject the portal classes and styles based on the pathname before page load.
2. **Sticky Header (public site):**
   * The public header (`.site-header`, which wraps the optional alert banner + `.mainnav`) is `position: sticky; top: 0` and lives in normal flow — do **not** make it `fixed`. This way an active alert banner pushes the page down instead of being hidden behind the nav (which used to leave a beige strip between nav and page).
   * Because the header is in flow, `.public-layout-content` needs **no** `padding-top` offset — the page begins directly under the nav automatically.
   * `body` uses `overflow-x: clip` (not `hidden`) so it doesn't become a scroll container that would break `position: sticky`.
   * The mobile menu (`.nav-links` in the `max-width: 992px` query) is `position: absolute; top: 70px` anchored to the relatively-positioned `.mainnav`, so it stays flush under the nav regardless of the alert banner.
3. **Hero Banner Preloading:**
   * Never use CSS `backgroundImage` for main hero banners.
   * Always use Next.js `<Image>` component with `priority`, `fill`, and `style={{ objectFit: 'cover' }}` to leverage WebP optimization and eliminate layout shifts.
   * Set matching background colors on hero sections (`.tak-hero`, `.verhuur-hero`) so they don't flash white while the image is loading.
4. **Contact Details & Copying:**
   * Use the `<CopyButton>` component for email addresses rather than `mailto` links to make copying easy.
   * Always wrap physical addresses in Google Maps search links (`https://www.google.com/maps/search/?api=1&query=...`).
5. **CSS Pictograms:**
   * Always use hex-escaped Unicode characters in CSS `content` (e.g., `content: '\269C'`) for banner title pictograms. Avoid printing literal emojis/special characters directly in `.css` files to prevent Mojibake encoding corruption during compiles.
6. **Horizontal Scrolling Nav (Portaal):**
   * The navigation links in `PortaalNav` scroll horizontally on mobile screens using `flex-nowrap` and `overflow-x-auto`. Keep it this way; do not wrap them or hide them behind hamburgers.
7. **Responsive Layouts:**
   * Use `.portal-grid-layout` (which drops from 2-column `1fr 3fr` to 1-column layout on media query max-width 768px) instead of inline styles for main portal layouts like `LeidingPanel.tsx`.

---

## Git Workflow & Automated Push

* **Automated Git Push:** After completing and verifying a major change, bug fix, or feature update, the AI assistant should automatically stage, commit, and push the changes to GitHub without waiting for an explicit push request from the user. Use semantic commit messages (e.g. `feat:`, `fix:`, `docs:`, `style:`).
