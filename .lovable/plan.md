
User wants self-serve password reset. Build the standard flow: "Forgot password?" link on /auth → email with reset link → /reset-password page to set new password.

## Forgot Password Flow

### Changes

**1. `src/pages/Auth.tsx`**
- Add "Forgot password?" link below the password field (sign-in mode only)
- Add a third UI mode: `forgot` (alongside sign-in / sign-up)
- In forgot mode: show email input + "Send reset link" button
- On submit: call `supabase.auth.resetPasswordForEmail(email, { redirectTo: ${window.location.origin}/reset-password })`
- Show success toast: "Check your email for a reset link"

**2. `src/pages/ResetPassword.tsx`** (new)
- Public route (not behind ProtectedRoute)
- On mount: Supabase auto-processes the recovery token from the URL hash and creates a temporary session
- Show "New password" + "Confirm password" inputs
- On submit: `supabase.auth.updateUser({ password })`
- On success: toast + redirect to `/`
- Handle errors (expired link, mismatched passwords, < 6 chars)

**3. `src/App.tsx`**
- Add public route: `<Route path="/reset-password" element={<ResetPassword />} />`
- Place outside ProtectedRoute so unauthenticated users can access it

### Email Note
Lovable Cloud sends a default password recovery email automatically — no template setup needed. The email will contain the reset link pointing to `/reset-password` on the published domain.

### For Chase's Immediate Reset
After this ships, Chase can go to /auth, click "Forgot password?", enter `chase@cfgroove.com`, and get the reset email himself.
