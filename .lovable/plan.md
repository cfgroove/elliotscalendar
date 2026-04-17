
The reset link toast fails because Supabase's `resetPasswordForEmail` is hitting an error. Most likely cause: the auth-email-hook is not deployed/configured, OR the redirect URL isn't allowlisted. But actually — the most common cause when password reset fails in a fresh Lovable Cloud project is that the user just doesn't get a useful error.

Let me check auth logs and the Auth.tsx code to confirm.

Looking at Auth.tsx, the call is:
```ts
supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${window.location.origin}/reset-password`,
})
```

This is correct. The toast error displays `err.message`. Without seeing the actual error message it's hard to be 100% sure, but the most likely culprits:

1. **Rate limit** — Supabase's default email rate limit is 2/hour for password resets. If user has been testing, they're throttled.
2. **No SMTP / email sender not configured** — Lovable Cloud projects use a default sender with strict limits. If the auth email hook isn't set up and the project has hit the default mailer limit, it errors.
3. **Redirect URL not in allowlist** — Supabase requires the redirect URL to match Site URL or Additional Redirect URLs.

## Fix: Surface the real error + ensure redirect works

### Step 1: Better error visibility
Update the catch in `Auth.tsx` to log the full error to console so we can see the actual Supabase message, not just a generic toast.

### Step 2: Most likely root cause — Site URL / Redirect allowlist
Lovable Cloud auto-configures the Site URL, but the published domain (`elliotscalendar.lovable.app`) and `/reset-password` path need to be allowed. I'll verify and update auth config via the Cloud auth configuration tool to add the redirect URL explicitly.

### Step 3: If it's a rate limit
Tell user to wait an hour, or set up branded auth emails (which uses the queue system and bypasses the default mailer rate limit). Recommend setting up Lovable auth email templates as the proper long-term fix.

### Plan of action

1. Add `console.error(err)` in the Auth.tsx catch block so the real error shows in the browser console.
2. Configure auth redirect URLs to include the published domain's `/reset-password` path.
3. Ask the user to retry and share the console error if it still fails.
4. If it's a rate-limit issue, offer to set up branded auth emails to remove the limit.

This is a small, surgical fix — no major refactor needed.
