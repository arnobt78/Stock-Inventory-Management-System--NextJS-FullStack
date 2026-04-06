# Vercel Production Guardrails (Generic, Reusable)

## Why This Exists — Real-World Incident

This project (FreeScribe) **exceeded Vercel free tier limits in production** within a single billing cycle due to bot/crawler traffic and unconstrained resource exposure. Observed overages:

| Metric                               | Used     | Free Limit | Notes                                                    |
| ------------------------------------ | -------- | ---------- | -------------------------------------------------------- |
| Fluid Active CPU                     | 7h 16m   | 4h         | **183% over** — bot crawl storm driving SSR/function CPU |
| Fast Origin Transfer                 | 16.32 GB | 10 GB      | **163% over** — bots downloading JS bundles repeatedly   |
| Edge Requests                        | 1.5M     | 1M         | **150% over** — crawlers hitting all routes              |
| Image Optimization - Transformations | 5.9K     | 5K         | **118% over** — bots triggering image transforms         |
| Function Invocations                 | 722K     | 1M         | Approaching limit                                        |
| Fast Data Transfer                   | 30.05 GB | 100 GB     | Under limit but high                                     |

**Root causes identified:**

- No bot protection enabled on Vercel dashboard
- No security/cache headers — bots downloaded unbounded static assets
- `/_next/static/` not set to immutable caching — every crawler re-fetched all bundles
- No `robots.ts` — crawlers had no scope guidance
- AI scrapers (GPTBot, CCBot etc.) were indexing everything with no restrictions

**This is why the guardrails in this file matter.** Apply them before deploying any public project.

---

## Purpose & AI Agent Instructions

**When this file is attached to a conversation**, apply these guardrails to the project automatically:

1. **Read the project first** - scan `next.config.ts`, `vercel.json`, `src/app/robots.ts` (or `public/robots.txt`), `src/app/layout.tsx`, and route structure before making changes.
2. **Identify project type** - classify as: static/CSR-only, SSR/API-heavy, or API-only backend (see Section 5).
3. **Apply only what is relevant** - skip rules that do not apply (e.g. ISR rules are irrelevant for a fully client-side app).
4. **Never break functionality** - no artificial delays, no hydration issues, no changes to rendering logic, no deleted code.
5. **No explanation files** - implement changes directly; do not create summary `.md` files unless explicitly asked.
6. **Minimal footprint** - only add what is necessary. Do not refactor unrelated code.

---

## 1) Safe Defaults To Enable On Day 1

### Firewall / Bot (Vercel Dashboard - manual steps)

- Turn on `Firewall -> Bot Management -> Bot Protection`.
- Turn on `Firewall -> Bot Management -> AI Bots`.
- Keep `Attack Mode` **off** by default (use only during active attack windows).

### Security Headers (code - `next.config.ts`)

Always add these headers via `async headers()` in `next.config.ts`:

```ts
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), geolocation=()" },
];
```

Also cache `/_next/static/` assets aggressively (they are content-hashed at build time):

```ts
{
  source: "/_next/static/(.*)",
  headers: [
    { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
  ],
},
```

Mirror the same security headers in `vercel.json` for edge-level enforcement.

### Robots / Crawl Scope (code - `src/app/robots.ts`)

- **Single source of truth**: use App Router `src/app/robots.ts` **OR** `public/robots.txt`, never both.
- Allow the homepage and all user-facing pages (`allow: "/"`).
- Disallow internal Next.js build output and API routes from crawlers.
- Disallow high-cardinality dynamic routes (IDs, slugs, search params) if they have no SEO value.

**Minimal template (static/CSR apps):**

```typescript
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/_next/", "/api/"],
      },
    ],
  };
}
```

**Extended template (apps with dynamic routes):**

```typescript
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/_next/",
          "/api/",
          "/dashboard/", // authenticated, no SEO value
          "/search?", // high-cardinality query params
        ],
      },
      {
        // Block AI scrapers explicitly
        userAgent: [
          "GPTBot",
          "ChatGPT-User",
          "CCBot",
          "anthropic-ai",
          "Claude-Web",
        ],
        disallow: "/",
      },
    ],
  };
}
```

### `data-scroll-behavior` (Next.js future-compat)

Add `data-scroll-behavior="smooth"` to `<html>` in `src/app/layout.tsx` to suppress Next.js scroll-behavior warning.

### Caching

- Prefer ISR (`revalidate`) for server-rendered pages and external API fetches.
- Avoid unnecessary `no-store`/`force-dynamic` unless required.
- Cache expensive data reads where possible.

### Images / Media

- Use responsive `sizes` correctly.
- Avoid oversized remote media transforms.
- Do not mark non-critical media as `priority`.
- Keep graceful fallbacks for media failures.
- Prefer a reusable safe-image pattern (try optimized first, fallback to native `<img>`).
- Reference implementation: `docs/SAFE_IMAGE_REUSABLE_COMPONENT.md`.

---

## 2) Architecture Rules That Prevent Spikes

### Keep expensive routes bounded

- On expensive routes, fetch only what is needed above the fold.
- Cap list sizes (e.g. top 10/20), do not over-fetch by default.
- Avoid duplicated external API/database calls per request.
- Do not expose unnecessary fields from API responses; return only required keys.
- Avoid N+1 fetch patterns for list/detail compositions.
- Avoid fetching hidden/offscreen sections during initial render unless needed.
- Use pagination/cursor limits to prevent large payload bursts.

### Bot-safe dynamic routing

- High-cardinality dynamic routes should not be freely crawlable unless SEO value is proven.
- If SEO is not required for a route group, use `noindex` + robots disallow.

### Preserve performance for real users

- Do bot filtering at edge/firewall first - not in client code.
- Do not add client-side anti-bot scripts that delay first paint.
- Keep critical rendering path unchanged for browsers.

---

## 3) Monitoring Routine (Free-Tier Friendly)

Use this schedule after every deployment:

- **T+15 min**: `Observability -> Edge Requests -> Bot Name` and `Routes`
- **T+1 hour**: `Usage -> Edge Requests`, `Fast Origin Transfer`, `Fluid Active CPU`
- **Next morning**: Compare slope/trend, not only cumulative totals.

What to watch:

- Sudden growth on `/_next/image`
- One bot dominating `Bot Name`
- High 4xx + firewall deny spikes (attack attempts being blocked)
- Repeated traffic bursts on one endpoint/path family

---

## 4) Incident Playbook (When Metrics Spike)

1. Confirm top source in `Observability` by `Project`, `Bot Name`, `Routes`.
2. If bot-driven: ensure `Bot Protection` and `AI Bots` are ON. Keep `Attack Mode` OFF unless uncontrollable.
3. If image/media endpoints dominate: reduce unnecessary transforms; verify media usage patterns.
4. If CPU/Origin still high: reduce heavy route payloads; tighten crawl exposure; trim API response shape.
5. Re-check at 15/60/180 minutes.

---

## 5) Project-Type Presets

### Static / CSR-only apps (e.g. this project - FreeScribe)

- Bot Protection: ON
- AI Bots: ON
- Security headers in `next.config.ts` + `vercel.json`
- `robots.ts`: allow `/`, disallow `/_next/` and `/api/`
- No ISR needed (no server-rendered data fetching)
- No dynamic route cardinality concerns (single-page app pattern)

### SSR / API-heavy apps

- Bot Protection: ON
- AI Bots: ON
- Strong ISR strategy (`revalidate`)
- Tight controls on dynamic crawlable paths
- Strict payload caps per request
- `robots.ts`: disallow high-cardinality routes (IDs, slugs, search params)

### API-only backends

- Bot Protection: ON
- AI Bots: ON
- Rate-limit high-cost endpoints
- Cache frequent read endpoints
- Keep expensive operations authenticated where possible

---

## 6) Non-Negotiables

- Never ship conflicting robots policies (pick one: `robots.ts` or `public/robots.txt`).
- Never expose unlimited crawl surface on ID-based dynamic routes by default.
- Never launch without basic bot protection on public projects.
- Monitor slope (rate of change), not just totals.
- Prefer staged rollout for security controls; monitor false positives.

---

## 7) Quick Copy Checklist (PR/Launch)

- [ ] Bot Protection ON (Vercel Dashboard)
- [ ] AI Bots ON (Vercel Dashboard)
- [ ] Security headers in `next.config.ts`
- [ ] Security headers mirrored in `vercel.json`
- [ ] `/_next/static/` cache header set to immutable
- [ ] `data-scroll-behavior="smooth"` on `<html>`
- [ ] Robots policy: single source, no conflicts
- [ ] Dynamic deep routes reviewed for crawl exposure
- [ ] ISR/revalidate set for server routes (if applicable)
- [ ] Expensive routes fetch only required data
- [ ] Media usage reviewed (sizes/priority/transform behavior)
- [ ] Safe image fallback pattern applied where needed (`docs/SAFE_IMAGE_REUSABLE_COMPONENT.md`)
- [ ] API responses minimized (no unnecessary fields, no duplicate calls)
- [ ] T+15m and T+1h observability checks completed after deploy
