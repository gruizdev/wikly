# Plan: Wikly Backend — Auth + Objectives Persistence

## Context
- React + TypeScript + Vite frontend, currently on GitHub Pages
- Data model: `Objective` with `id`, `title`, `icon`, `frequency`, `color`, `createdAt`, `completedDates[]`
- Auth: **magic link** + **Google OAuth** (both via Supabase)
- Backend: **custom Node.js/Express**
- Users: "a few" — low traffic
- Goal: private objectives per user

## Service Recommendations

### Recommended Stack (Option A — Supabase)
| Layer | Service | Free Tier | Cheap Paid |
|---|---|---|---|
| Database + Auth | Supabase | 500MB DB, 50K MAU, magic link + Google OAuth included | $25/month Pro |
| Backend hosting | Render | Free (sleeps after 15min) | $7/month (always-on) |
| **Total** | | **Free** | **~$32/month** |

### DIY Alternative (Option B — Neon + Resend)
| Layer | Service | Free Tier | Cheap Paid |
|---|---|---|---|
| Database | Neon (serverless PostgreSQL) | 0.5GB | $19/month |
| Email | Resend | 3,000 emails/month | $20/month |
| Backend hosting | Railway | $5 trial credit | $5/month |
| **Total** | | **Free** | **~$44/month** |

## Recommended Architecture
- Express app on Render/Railway
- Supabase as DB + Auth provider (handles magic link emails and Google OAuth)
- Frontend calls Express API with Supabase JWT in Authorization header
- Express validates JWT using Supabase public JWKS endpoint (middleware)
- Objectives stored in PostgreSQL table with `user_id` foreign key

## Implementation Phases

### Phase 1 — Supabase Setup
1. Create Supabase project, enable magic link auth (on by default)
2. Enable Google OAuth: create Google Cloud OAuth 2.0 client ID + secret → paste into Supabase Auth > Providers > Google
3. Create `objectives` table with a `user_id` column (UUID, references `auth.users`)

### Phase 2 — Express Backend
4. Init Node.js/Express + TypeScript project
5. JWT middleware: validate Supabase-issued JWT on every protected route (via Supabase JWKS)
6. Implement REST endpoints scoped to the authenticated user:
   - `GET /objectives`
   - `POST /objectives`
   - `PATCH /objectives/:id`
   - `DELETE /objectives/:id`
   - `POST /objectives/:id/complete`
7. Deploy to Render or Railway

### Phase 3 — Frontend Integration
8. Install `@supabase/supabase-js`, replace `ObjectivesContext` localStorage calls with API calls
9. Add Login page with two options:
   - Magic link: email input → Supabase sends email → user clicks link → session established
   - Google: "Sign in with Google" button → Supabase OAuth redirect → callback → session established
10. Shared post-auth handler: both flows converge at redirect URL, extract JWT, store it, redirect to Home
11. Protect routes (redirect to `/login` if no valid session)

## Decisions
- Auth: Magic link + Google OAuth via Supabase — both produce identical JWTs, Express middleware unchanged
- DB: PostgreSQL (Supabase) — fits relational data model
- Backend: Node.js/Express (custom, per user preference)
- Frontend stays on GitHub Pages (static)
