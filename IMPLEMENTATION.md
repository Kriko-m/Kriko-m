# Kriko-M — Implementation Plan

This file is a prompt/checklist for an AI coding session. It reflects a deliberate
architectural decision (below) reached after reviewing the codebase. Work the
**BUILD** and **DELETE** lists together — many "fixes" from the original review are
now *deletions*, which is the better fix. Verify with `cmd /c "npm run build"` from
`./website/` after each group. Commit per logical change with semantic messages.

---

## Architecture decision (the why)

The portal was over-built around **parent identity** (accounts, logins,
child-linking, S&G sync). The real need is much smaller:

1. Parents say **yes/no** to a camp.
2. Parents see a **private** uitnodiging + practical info (not public).
3. Parents **order** webshop items and get payment instructions.

None of that requires parent accounts, and none of it requires the S&G API —
because **all parent mail is sent from the S&G site**, which already has every
address. The site's job shrinks to: *generate a private link, collect answers,
take orders.*

### Target system
- **Public site** (unchanged): takken, echos, kalender, verhuur, contact.
- **Camps:** leiding create a camp + upload uitnodiging/files + practical info →
  site generates a **private link per camp** → leiding paste it into their
  S&G-composed email → parents **self-RSVP** (no account) → leiding see the tally
  → archived per werkjaar.
- **Webshop:** **accountless** checkout (name + email + child + tak), server-side
  price validation, `+++` structured communication, **confirmation email
  (Resend)** + printable confirmation, payment reconciled via bank.
- **Leiding login:** Supabase email/password, **leiding only**. Parents have no
  accounts anywhere.
- **No S&G API.** Medical fiches stay in S&G (leiding read them there). No
  site-sent mail except the shop confirmation.

### Locked decisions
- Fresh private link **per camp** (not durable, not per-child).
- RSVP is **self-declared**: child name + tak (dropdown) + ja/nee + opmerking;
  "+ nog een kind" to answer for siblings in one submit.
- RSVP edit rule: reopen same link, resubmit, **last answer per (child, tak)
  wins**.
- Camp link: **unguessable slug + `noindex`**. Nothing truly sensitive (medical,
  home addresses) goes on that page.
- Webshop **confirmation email: YES** (Resend).
- Retire **all** parent accounts and the S&G integration completely.

---

## BUILD

### B1. Tokenless camp RSVP — private link + self-RSVP
- **Data:** add a private `slug` (long random, unguessable) to `kampen`. New table
  `kamp_rsvp` (`kamp_id`, `kind_naam`, `tak`, `status` ja/nee, `opmerking`,
  `created_at`, `updated_at`). Unique-ish on (`kamp_id`, lower(trim(`kind_naam`)),
  `tak`) so resubmits upsert (last answer wins). **Normalize names before the
  upsert** (trim, collapse internal whitespace, case-insensitive match) — parents
  will type "Jan", "jan ", "Jan P." across resubmits and name-keyed upserts
  silently duplicate otherwise.
- **Leiding side:** in the leiding camp view, show the generated private link with
  a **copy button** (they paste it into the S&G mail). Already have camp CRUD +
  `kamp_bestanden` uploads + `briefadres`/`contact_info`/paklijst — reuse them.
- **Public RSVP page:** route like `/kamp/[slug]` — `noindex`, no auth. Renders
  uitnodiging PDF + practical info + paklijst, and a form: child name, tak
  (dropdown), ja/nee, opmerking, "+ nog een kind". On submit → upsert into
  `kamp_rsvp`. Show a friendly confirmation + "wijzig je antwoord via dezelfde
  link".
- **Responses view (leiding):** per camp, per tak: Ja / Nee / tally. This list is
  the "aanwezige leden" that feeds the archive (B4). **Must include a
  merge/edit/delete affordance per row** — name normalization won't catch every
  duplicate ("Jan Peeters" vs "Jan P."), and leiding need to clean up junk or
  prank entries. This one admin affordance keeps the whole feature usable.
- **Trust model (state this in the UI):** the tally is **self-declared and
  unverified**. Links get forwarded and end up in WhatsApp groups; that's
  acceptable (worst case: a fake "ja"), but leiding must treat the list as
  *indicative* and cross-check against members they know — never as
  authoritative attendance.
- **Abuse:** rate-limit the RSVP POST; slug is the only gate so keep it long.

### B2. Accountless webshop checkout
- **Files:** `website/src/app/(public)/shop/checkout/CheckoutForm.tsx`,
  `website/src/app/api/orders/route.ts`,
  `website/src/app/(public)/shop/bevestiging/page.tsx`
- Remove the login requirement from `POST /api/orders` (currently 401s if no
  user). Collect name + email + child + tak in the form. **Keep** server-side
  price validation and `+++` communication generation (already correct).
- Confirmation page: show full order + bank IBAN + `+++` communication, with a
  **print button**.
- **Order lifecycle (leiding admin):** deleting "betaling melden" is right (bank
  reconciles via `+++`), but leiding still need to manage orders after placement:
  a status field (`nieuw` → `betaald` → `geleverd`, plus `geannuleerd`) they can
  set in the admin order list, and a visible age/filter so stale unpaid orders
  surface instead of lingering forever. This comes up in week one of real use.

### B3. Order confirmation email (Resend)
- **New:** `website/src/lib/email.ts` (Resend client + a `sendOrderConfirmation`
  template).
- Send on successful order: parent gets order summary + bank IBAN + `+++`
  communication. This is the parent's durable record (no account to return to).
- Optional: BCC/notify the group's contact address on new orders.
- Add `RESEND_API_KEY` to env; verify a sending domain.

### B4. Werkjaar archive + rollover (leiding-only)
- **Data:** add `werkjaar` to year-scoped records (kampen, echos, calendar,
  `kamp_rsvp`). Active werkjaar stored as a setting.
- **Archive stores, per year, per tak:** Kriko Echo per tak; weekenden/kampen +
  their files + the RSVP "aanwezige leden"; **which leiding had which tak**.
- **Rollover (groepsleiding only):** build the new werkjaar as a **draft** (assign
  leiding→tak *manually* — no S&G pull; set up new calendar). A single
  **"Publiceer nieuw werkjaar"** action snapshots the old year into the archive
  and flips the live pointer. Not reversible *via the UI*, but nothing goes live
  until published → no accidental trigger. **Implement publish as a snapshot
  copy, not a destructive mutation** — the old year's rows stay intact under
  their `werkjaar`, so groepsleiding + a DB query can still undo a mistaken
  publish even though no UI exists for it. Cheap insurance.
- **Archive view:** `/portaal/archief` (leiding-only), browsable year-by-year.
  Keep the existing **public** `/archief` separate (feel-good history) from this
  operational archive.
- **GDPR:** store the *minimum* for "aanwezige leden" (name + tak), with a
  retention rationale. No medical/contact data in the archive.

### B5. Leiding-only auth cleanup
- Keep Supabase email/password for leiding. Collapse role checks to a single
  `requireLeiding`/`requireGroepsleiding` helper in `website/src/lib/auth.ts`.

---

## DELETE (these replace fixes from the original review)

- **`/api/demo-login`** and the whole demo-account system — the backdoor goes away
  with parent accounts. (`website/src/app/api/demo-login/route.ts`)
- **`website/src/lib/groepsadmin.ts`** + all S&G API usage, mock children/medical
  data, `isDevMode()`. Medical stays in S&G.
- **Parent registration / login UI** and `parent_children` linking. Trim
  `website/src/app/portaal/page.tsx` to leiding login only.
- **Ouder dashboard / "kinderen beheren"**:
  `website/src/app/portaal/dashboard` (parent branch),
  `website/src/app/portaal/kinderen/*`,
  `website/src/app/api/portaal/kinderen/*`.
- **Account-based camp inschrijving:**
  `website/src/app/api/portaal/inschrijvingen/*`,
  `website/src/app/portaal/kampen/*` (parent flow) — replaced by B1.
- **"Mijn bestellingen" + "betaling melden":**
  `website/src/app/portaal/bestellingen/*`,
  `website/src/app/api/orders/[id]/betaling-melden/route.ts`. Bank reconciles via
  `+++`.
- The **order-ownership-by-email** problem from the review is now **moot**
  (accountless orders; leiding see all orders in admin).

---

## STILL RELEVANT — security & quality fixes that survive

### S1. Restrict file uploads (leiding uploads remain)
- **File:** `website/src/app/api/admin/upload/route.ts`
- Whitelist MIME (`application/pdf`, `image/jpeg`, `image/png`, `image/webp`),
  cap ~10 MB, derive extension from validated MIME not `file.name`.

### S2. Rate limiting + spam protection on public POST routes
- **Files:** new RSVP route (B1), `website/src/app/api/contact/route.ts`,
  `website/src/app/api/orders/route.ts`
- Length caps on contact fields, honeypot on contact + RSVP forms, per-IP
  throttling.
- **Don't over-engineer the throttling:** on serverless/Vercel, naive in-memory
  per-IP counters don't work across instances. For a site this size, honeypot +
  length caps do 95% of the work — implement those first, and only reach for a
  shared store (e.g. a Supabase table or Upstash) if abuse actually shows up.

### S3. Reduce service-role usage / RLS
- Reserve `createAdminClient()` for privileged writes. Re-check RLS once parent
  tables are dropped — simplify policies to "public read where appropriate" +
  "leiding write".

### S4. ICS timezone bug
- **File:** `website/src/app/api/kalender/ics/route.ts`
- Emit `DTSTART;TZID=Europe/Brussels` + VTIMEZONE; `CAL_TZ` already defined.

### S5. Homepage shows past events
- **File:** `website/src/app/(public)/page.tsx` (~line 119) — filter `>= today`,
  cap at 4–5.

### S6. Alert banner can't re-appear
- **File:** `website/src/components/Header.tsx` (~line 45) — store a hash of the
  current message; show if it differs from the dismissed hash.

### S7. Cookie banner
- Both buttons do the same thing; only functional localStorage is used. Make it a
  single-button info notice or remove it.

### S8. Self-host fonts (perf + GDPR)
- **File:** `website/src/app/layout.tsx` — replace Google Fonts CDN `<link>` with
  `next/font/google`.

### S9. `prefers-reduced-motion`
- **File:** `website/src/app/globals.css` — add a reduce block.

---

## QUICK WINS / INFRA

- **SEO:** add `website/src/app/sitemap.ts`, `website/src/app/robots.ts`, and
  OpenGraph/Twitter metadata + `og:image` (links shared in WhatsApp have no
  preview now).
- **`next.config.ts`:** add `images.remotePatterns` for the Supabase storage host.
- **CI:** `.github/workflows/ci.yml` running `npm run lint && npm run build` on PRs.
- **Dead weight:** delete default Next template SVGs in `public/`. Drop
  `Plus Jakarta Sans` (one CSS rule) or standardize on it.
- **Shared constants:** `website/src/lib/constants.ts` for
  `TAKKEN`/`TAK_NAMEN`/`TAK_KLEUREN`/`MAANDEN` (duplicated across files).

---

## Suggested order
1. **B2 + B3** (accountless checkout + confirmation email) — self-contained, ships
   value immediately.
2. **B1** (tokenless camp RSVP) — the core new capability.
3. **DELETE** pass — remove parent accounts + S&G once B1/B2 cover their use cases.
4. **B5 + S1–S3** — auth cleanup and security hardening on the smaller surface.
5. **B4** (rollover/archive) — once the per-werkjaar data exists.
6. **S4–S9 + quick wins** — opportunistically.
