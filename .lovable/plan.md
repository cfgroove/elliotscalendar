

## Redesign Add Lead Form

### What's changing

Restructure the `AddContactModal` to match the reference screenshot layout: sectioned form with contact info at top, then a visually separated "Next Interaction" section with date pill buttons inline (not hidden in a popover), and Cancel/Save buttons at the bottom.

### Layout (single file: `src/components/AddContactModal.tsx`)

**Section 1 — Contact Info**
- Name (required)
- Phone
- Category (Pipeline Stage) — full-width select instead of half-width
- Notes textarea

**Section 2 — "Next Interaction" header** (styled in primary/accent color like the screenshot's red header)
- Next Action Task input
- Next Action Date as **inline pill buttons** (Today, Tomorrow, Next Week, Next Month, Custom)
  - "Custom" opens calendar popover
  - Selected pill gets outlined/highlighted in primary color
  - No more hidden-in-popover date presets

**Footer — two buttons side by side**
- Cancel (ghost/outline) and Save Lead (primary)
- Replaces the current single full-width "Add Lead" button

### Specific changes

1. **Remove** the `Popover`/`Calendar` date picker combo and the `CalendarIcon` import
2. **Replace** with inline pill buttons using the existing `Button` component with conditional border styling
3. **Add** a "Today" preset and rename "2 Weeks"/"3 Months" to "Next Month" and add "Custom" that opens a `Popover` with `Calendar`
4. **Reorder** fields: Name → Phone → Category (full width) → Notes → section divider → Task → Date pills
5. **Add** "Next Interaction" section heading styled with `text-primary font-semibold`
6. **Replace** single submit button with Cancel + Save Lead side by side
7. **Switch** from `Dialog` to `Drawer` (bottom sheet) for mobile-first UX, matching the `ContactDetailSheet` pattern — or keep `Dialog` but use the same full-width approach. Will keep `Dialog` since the reference shows a modal-style form.

### Technical notes
- Single file change: `src/components/AddContactModal.tsx`
- No new dependencies
- No database changes
- All existing form logic and hooks stay the same

