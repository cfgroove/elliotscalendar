

## Feedback Widget with Resend Email

### Prerequisites
- Store `RESEND_API_KEY` as a backend secret (will prompt user)

### Changes

**1. Edge function: `supabase/functions/send-feedback/index.ts`**
- Accepts POST with `{ message, category?, userName?, userEmail? }`
- Sends email via Resend API to `chase@cfgroove.com`
- Subject: "App Feedback: {category}" 
- Body includes the message, user info, and timestamp
- CORS headers included

**2. New component: `src/components/FeedbackWidget.tsx`**
- Floating button (e.g. bottom-left, speech bubble icon) that opens a small dialog/drawer
- Fields: category selector (Bug, Feature Request, General), message textarea
- Auto-fills user name/email from auth context
- Submit calls the edge function, shows success toast
- Minimal, friendly UI — one-tap to open, type, send

**3. `src/pages/Index.tsx`**
- Add `<FeedbackWidget />` to the dashboard (or add it in App.tsx so it's available on all pages)

**4. `supabase/config.toml`**
- Add `[functions.send-feedback]` with `verify_jwt = false` (validate auth in code)

### Flow
User taps feedback icon → dialog opens → types message, picks category → hits Send → edge function emails it to chase@cfgroove.com via Resend → toast confirms "Feedback sent!"

