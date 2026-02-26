

## Fix: Deploy the send-feedback edge function

The `send-feedback` edge function code exists but was never deployed. The network logs show "Failed to fetch" errors, and there are zero function logs, confirming the function isn't live.

### Action
- Deploy `supabase/functions/send-feedback` — this is the only change needed. The code and RESEND_API_KEY secret are already in place.

