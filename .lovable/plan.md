

## Add Click-to-Call and Click-to-Text Buttons

### What changes

Update the `TaskCard` component in `src/pages/Index.tsx` and the contact detail view in `src/components/ContactDetailSheet.tsx` to include both a call button and a text/SMS button when a phone number is present.

### Implementation

**File: `src/pages/Index.tsx` — `TaskCard` component**

- Replace the single `tel:` phone button with two side-by-side buttons:
  - **Call** button: `<a href="tel:{phone}">` with `Phone` icon (existing)
  - **Text** button: `<a href="sms:{phone}">` with `MessageSquare` icon (from lucide-react)
- Both buttons use the same styling as the current phone button (`h-10 w-10 rounded-xl bg-secondary`)
- Only rendered when `contact.phone` exists

**File: `src/components/ContactDetailSheet.tsx` — read-only view**

- Replace the single phone link with two buttons side by side:
  - **Call**: `<a href="tel:{phone}">` with Phone icon and "Call" label
  - **Text**: `<a href="sms:{phone}">` with MessageSquare icon and "Text" label
- Styled as a horizontal row of two equally-sized rounded-xl buttons within the existing `bg-secondary` section

### Technical notes
- `sms:` URI scheme opens native SMS app on both iOS and Android
- `tel:` URI scheme opens native dialer (already working)
- `MessageSquare` icon is available in lucide-react (already installed)
- No database or backend changes needed

