
Root cause: this is not a Resend problem and not a missing page in your app. The reset email is being generated with the wrong redirect domain:

```text
redirect_to=https://58856d57-0ff3-4e6f-a4e6-61bf9a6564c4.lovableproject.com/reset-password
```

Your app does have `/reset-password`, but that link points to an internal preview/editor domain instead of the live site. That happens because the auth code currently uses:

```ts
redirectTo: `${window.location.origin}/reset-password`
emailRedirectTo: window.location.origin
```

When auth is triggered from the preview/editor, `window.location.origin` can become that internal `lovableproject.com` host, so the email sends a bad link.

## Plan

### 1. Replace origin-based auth redirects with a stable public URL
Update auth redirect generation so it uses the published app URL instead of `window.location.origin` when running in preview/editor.

Files to update:
- `src/pages/Auth.tsx`
- `src/hooks/useAuth.tsx`

Change:
- password reset redirect → use `https://elliotscalendar.lovable.app/reset-password`
- signup email redirect → use `https://elliotscalendar.lovable.app`

Implementation approach:
- add a small shared helper/constant for the app’s public auth base URL
- use that helper everywhere auth emails generate links
- optionally keep `window.location.origin` only when already on the published/custom domain

### 2. Harden the reset page for bad/expired links
Improve `src/pages/ResetPassword.tsx` so it does not just sit on “Verifying reset link...” forever if the token is invalid or missing.

Add:
- explicit invalid/expired-link state
- a clear message with a button back to `/auth`
- optional link to request a new reset email

### 3. Make auth errors more specific
Keep the inline auth error handling and make sure reset/login/signup failures show exact useful messages instead of vague failure states.

Files:
- `src/pages/Auth.tsx`
- possibly `src/pages/ResetPassword.tsx`

### 4. Verify backend redirect settings
Check the backend auth redirect configuration and ensure the published URL is allowed for:
- `https://elliotscalendar.lovable.app`
- `https://elliotscalendar.lovable.app/reset-password`

This is a safety check so the live redirect is accepted consistently.

### 5. Re-test the full auth flow on the published site
Test these flows against the published URL, not the preview:
- sign up
- login
- forgot password → email → reset page → set new password

## Why this should fix it

The broken page happens before your React app can do anything meaningful: the auth provider is redirecting the user to the wrong domain. Once the email link points to the published domain, the existing `/reset-password` route can load normally and process the recovery session.

## Technical details
Current relevant code:
- `src/pages/Auth.tsx` uses `resetPasswordForEmail(... { redirectTo: window.location.origin + '/reset-password' })`
- `src/hooks/useAuth.tsx` uses `signUp(... { emailRedirectTo: window.location.origin })`
- `src/App.tsx` already exposes `/reset-password` publicly, which is correct
- `src/pages/ResetPassword.tsx` already handles password update, but needs better invalid-link UX

## Expected outcome
After implementation:
- reset emails open the live reset page instead of a broken internal domain
- signup confirmation links also use the right app URL
- users can complete password reset successfully
- auth testing becomes reliable even if initiated from the editor/preview
