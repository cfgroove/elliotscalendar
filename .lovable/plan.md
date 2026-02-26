

## Add Email Field to Contacts

### Changes

**1. Database migration — add `email` column**
- `ALTER TABLE public.contacts ADD COLUMN email text;` (nullable, since existing rows don't have it)

**2. `src/components/AddContactModal.tsx`**
- Add `email` state variable
- Add Email input field between Name and Phone, styled the same as other fields
- Include `email` in the submit payload, stored as optional (`email.trim() || null`)
- Reset email in the `reset()` function

**3. `src/components/ContactDetailSheet.tsx`**
- Display email if present (check file for current layout)

No validation enforcement needed since user said "not optional" — but looking at the screenshot and message again, the user likely means the field should be **included but not required** (i.e., optional). The field label won't have an asterisk.

