# plan.md (Updated)

## 1. Objectives
- **Deliver (completed):** A cinematic, single-page-feel Paramount International MUN website (React + FastAPI + MongoDB) with bold editorial dark theme, scroll-driven reveals, and a standout interactive committee showcase.
- **Deliver (completed):** A **working registration + referral + payment-QR flow** (no pricing shown anywhere) that persists registrations, validates referral codes server-side, and attempts transactional emails via **Resend**.
- **Deliver (completed):** A **password-protected admin panel** to manage registrations, committees/portfolios, and referral codes.
- **Deliver (completed):** A dedicated **/handbook** route (“The Delegate Diaries”) with persona-based content switching and motion.
- **Remaining (optional enhancements):** deepen the 3D committee interaction (full R3F card flip), add admin CSV export and additional admin UX tools, and replace “TBA” chair/EB/difficulty with final content when provided.

---

## 2. Implementation Steps

### Phase 1 — Core Integration POC (Resend email + registration write) ✅ COMPLETE
**Goal:** prove the only external dependency (email) + core workflow (registration submission) works end-to-end before building the full UI.

**User stories**
1. As an organizer, I want to receive an email when someone registers so I can track signups instantly.
2. As a delegate, I want a confirmation email after registering so I know my submission was received.
3. As a system, I must reject invalid referral codes so discounts can’t be faked.
4. As a developer, I want a minimal test script that verifies Resend works reliably.
5. As an organizer, I want registrations persisted even if email delivery fails.

**Steps (implemented)**
1. Added backend env vars: `RESEND_API_KEY`, `SENDER_EMAIL`, `ORGANIZER_EMAIL`.
2. Implemented a POC script to validate:
   - Referral validation math (₹2000 base, ₹500 off with valid code)
   - Mongo write/read
   - Resend send attempt for organizer + delegate
3. Confirmed Resend behavior in test mode:
   - **Known limitation:** Resend test-mode only delivers to the **account owner email** until a domain is verified.
   - The backend handles this gracefully (registration persists even if delegate delivery is blocked).

**Exit criteria (met)**
- A registration doc is created in Mongo.
- Backend attempts emails and returns success/failure clearly.
- Invalid referral codes rejected server-side.

---

### Phase 2 — V1 App Development (single-page site + registration flow) ✅ COMPLETE
**User stories**
1. As a visitor, I want a dramatic hero with countdown + CTAs so I immediately know what/when/where.
2. As a delegate, I want to explore committees and see live seat availability so I can choose wisely.
3. As a delegate, I want a guided 5-step registration flow so the form feels easy and modern.
4. As a delegate, I want the QR payment screen and clear no-refund policy so expectations are explicit.
5. As an organizer, I want all submissions visible in /admin so I can verify payments and manage availability.

**Backend (FastAPI + Mongo) — implemented**
1. Defined Mongo collections + seeding:
   - `committees` seeded with **5 committees** and agendas:
     - UNGA, AIPPM, WHO, UNCSW, UNHRC
   - Portfolios/rosters seeded:
     - UNGA: 60 countries (from matrix.xlsx)
     - AIPPM: 105 leaders (from matrix.xlsx)
     - WHO/UNCSW/UNHRC: standard roster (60 countries reused)
   - `referral_codes` seeded with default `PARAMOUNT500` (₹500 discount)
   - `registrations` stores full form payload, computed `fee` and `fee_tier`, payment status.
2. Implemented APIs:
   - `GET /api/committees` (includes open/total seat counts)
   - `GET /api/committees/{slug}`
   - `POST /api/referral/validate`
   - `POST /api/registrations` (validates terms, validates referral server-side, stores computed fee tier, triggers emails best-effort)
3. Emails via Resend:
   - Organizer notification email: full submission details
   - Delegate confirmation email: reference ID + fee info + no-refund policy
   - Best-effort sending with `email_status` persisted.
4. Admin auth + admin endpoints:
   - `/api/admin/login` returns JWT
   - Admin CRUD: registrations list/update, committees update, portfolio status updates, referral code CRUD.

**Frontend (React) — implemented**
1. Global design system applied:
   - Dark editorial palette (ink/navy) + brass accent
   - Fonts: **Instrument Serif + Inter + IBM Plex Mono**
   - Intentional motion (Framer Motion), respects prefers-reduced-motion.
2. Main single-page site sections implemented:
   - Hero with animated photo-cycle background (Ken Burns + crossfade), scrim + subtle grain
   - Countdown to **9 Oct 2026** with non-zero “live state” behavior on/after event
   - About + stats strip
   - Gallery bento grid + lightbox
   - Committees grid with live seats + detail modal
   - Schedule accordion
   - FAQ accordion (no ID-upload references; includes refund policy + kit info)
   - Registration CTA
   - Footer
3. Committees “wow moment” implemented:
   - R3F wireframe backdrop
   - Framer Motion morph + flip-styled modal detail panel
   - Live open seats pulled from backend
4. Registration wizard implemented (5-step structure, **no pricing shown**):
   - Step 1: Personal Information
   - Step 2: Institution + experience level + optional details
   - Step 3: Committee preference 1 (+ optional portfolio)
   - Step 4: Committee preference 2 (+ optional portfolio)
   - Step 5: Reference code + terms checkbox
   - “Proceed to Payment” reveals the UPI QR screen
   - “I’ve paid — Submit” submits registration, shows success with reference ID
5. /handbook route implemented:
   - “The Delegate Diaries” paper-mode experience with persona pill tabs + animated content swaps.
6. /admin routes implemented:
   - /admin/login (email + password)
   - /admin dashboard: registrations status flip, committees/portfolio editor, referral code CRUD.

**End of Phase 2 testing (completed)**
- Comprehensive test pass completed:
  - Backend: **23/23 tests passed**
  - Frontend: all major flows passed (home, committees modal, registration wizard E2E, handbook tabs, admin login/dashboard)
  - Zero bugs reported.

---

### Phase 3 — Hardening + UX polish + 3D upgrade (Optional / Next Iteration)
**User stories**
1. As a visitor, I want the committee interaction to feel even more “wow” while remaining smooth on mobile.
2. As a delegate, I want resilient form behavior (save progress, clearer edge-case messaging).
3. As an organizer, I want better admin tooling (CSV export, more filters/search) for scale.
4. As an organizer, I want chair/EB/difficulty content editable and reflected everywhere.

**Steps (optional improvements)**
1. **Upgrade committee cards to full R3F card flip** (front/back) with fallback retained:
   - Maintain accessibility and prefers-reduced-motion behavior.
2. Performance hardening:
   - Better image preloading strategy, lazy-load gallery assets, reduce WebGL on low-end devices.
3. Registration UX resilience:
   - Persist draft across steps (localStorage)
   - Additional validation and recovery states.
4. Admin improvements:
   - CSV export for registrations
   - Filters by committee / payment status
   - Faster table rendering for larger volumes.
5. Content finalization:
   - Replace committee chair/EB/difficulty from “TBA” with final values once provided.
6. Resend production readiness:
   - Verify a domain + update `SENDER_EMAIL` to enable sending to all delegates.

**End of Phase 3 testing (if executed)**
- E2E regression pass + mobile responsiveness + reduced-motion checks.

---

## 3. Next Actions
1. **Production email enablement:** Verify a sending domain in Resend and switch `SENDER_EMAIL` to the verified domain so delegate confirmations deliver to all recipients.
2. **Populate committee metadata:** Update chair/EB/difficulty for each committee via /admin.
3. **Optional enhancements:** implement full R3F committee flip, admin CSV export, additional admin filters.

---

## 4. Success Criteria
✅ Completed criteria:
- Site renders with required sections, cinematic motion, and accessible reduced-motion behavior.
- Countdown behaves correctly on/after 9 Oct 2026 (non-zero live state).
- Committees show correct agendas and live seat counts from backend.
- Registration flow matches exact 5-step spec; **no ID upload**; **no visible pricing**; UPI QR payment screen shown.
- Referral code validation is server-side via `referral_codes` collection; fee tier stored in DB.
- Registration creates DB record + triggers organizer + delegate email attempts via Resend; failures are logged and don’t block registration.
- Admin login works and allows updating registration/payment status and portfolio availability.
- /handbook route works with persona tabs + animated content swap.

➡️ Optional/next success criteria:
- Resend domain verified and delegate emails deliver universally.
- Full R3F committee card flip shipped with fallback.
- Admin CSV export and enhanced filtering shipped.
