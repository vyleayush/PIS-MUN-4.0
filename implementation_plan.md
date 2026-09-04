# Admin Panel Fix Plan

## Issues Found

### 1. Stale Data (Main Issue)
- `loadAll()` only runs **once** on mount — no auto-refresh, no refresh button
- After actions like status change, the UI updates optimistically via `setRegs()`, but on page reload it shows fresh data from DB (correct). The "stale" issue the user experiences is likely the **browser caching old API responses**.
- No `Cache-Control: no-cache` on admin API routes → browser may cache GET responses

### 2. `adminUpdateRegistration` Response Bug
- `api.js` returns the raw axios `.data` which is `{ ok: true, registration: {...}, ...spreadFields }`
- In `AdminDashboard`, the result is used as `updated` directly in `setRegs(prev => prev.map(x => x.id === reg.id ? updated : x))` — this sets the registration to the whole response object (with `ok: true` field) instead of the clean registration object.
- **Fix**: Extract `updated.registration ?? updated` for the registration record.

### 3. No Manual Refresh Button
- Admins have no way to refresh data without reloading the whole page.
- **Fix**: Add a Refresh button that calls `loadAll()`.

### 4. No Loading Indicator During Actions
- Status changes (verify/reject) have no loading state — user can click multiple times
- **Fix**: Add per-button loading state for status changes.

### 5. Cache-Control Headers Missing on Backend
- Admin GET endpoints serve without `Cache-Control: no-store` — browsers cache them
- **Fix**: Add no-cache headers to all `/api/admin/*` GET responses.

### 6. CSV Export Links Missing Auth
- The CSV `<a href>` links use direct URL without the admin token in headers
- **Fix**: Convert CSV downloads to use axios with blob download or pass token as query param.

### 7. NoteEditor Stale State
- `NoteEditor` initializes state from `reg.admin_note` and uses `useEffect` to reset when `reg.id` or `reg.admin_note` changes — this is mostly correct, but can be flaky with React strict mode double-renders.

## Proposed Changes

### Frontend: `AdminDashboard.js`
- Fix `adminUpdateRegistration` response extraction (use `updated.registration ?? updated`)  
- Add Refresh button with loading spinner
- Add per-action loading state on status buttons
- Debounce the search input to avoid lag on large lists

### Backend: `server.js`
- Add `Cache-Control: no-store` header to all `/api/admin/*` GET routes
- Fix: `/api/admin/stats`, `/api/admin/registrations`, `/api/admin/committees`, `/api/admin/referral-codes`

### API lib: `api.js`
- Fix CSV download function to use axios blob download (or pass token as query param) — low priority since backend doesn't require auth on those routes currently.
