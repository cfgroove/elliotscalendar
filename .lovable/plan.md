

## Root cause hypothesis (high confidence)

- Signup and signin succeed → backend, DNS, CORS, and the published domain are all healthy
- Zero `/recover` entries in auth logs → reset requests are not reaching the backend
- You've triggered many resets today → almost certainly hitting Supabase's per-IP recover rate limit
- The screenshot still shows the old "preview-only" copy, which is misleading regardless

## Plan

### 1. Confirm rate limiting is the cause
Trigger one reset on the live site after the UI fix and check auth logs for either a `/recover 429` entry or still nothing. This tells us definitively whether it's rate limit vs. true network failure.

### 2. Fix the misleading error UI on the reset path
Update `src/pages/Auth.tsx` so when a reset request fails:
- A `429` / "rate limit" / "over_email_send_rate_limit" response shows: *"Too many reset requests. Please wait ~1 hour and try again, or sign in with your existing password."*
- A true fetch failure shows the real error, not the preview blurb
- Remove the remaining "preview-only" wording entirely from the live experience

### 3. Verify reset actually works once rate limit clears
- Wait out the throttle (or test from a different IP / mobile data)
- Trigger reset for `chase@cfgroove.com`
- Confirm `/recover 200` appears in auth logs
- Confirm email arrives and reset link lands on `/reset-password` on the live domain

### 4. Stop wasting reset attempts during debugging
You're already logged in as `chaseloganfrancis@gmail.com`. We do NOT need to keep firing reset emails to verify the flow — one clean test after the throttle clears is enough.

## Files to touch
- `src/pages/Auth.tsx` — better error mapping for `/recover` failures (rate limit, real network, real backend error)

## Out of scope
- No backend migrations (backend is healthy — signup/signin prove it)
- No Resend / custom email templates (default emails work; you got one earlier)
- No new pages

## Expected outcome
- You'll see an honest error if you're rate limited instead of a fake "preview" warning
- Once the throttle window passes, reset emails will send normally and land on the correct page
- We stop chasing a backend ghost — the backend is fine

