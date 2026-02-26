

## Add Contacts Tab to Bottom Navigation

### Changes

**1. New page: `src/pages/Contacts.tsx`**
- Full list of all contacts for the logged-in user, sorted alphabetically by name
- Search bar at top (same style as Dashboard)
- Each contact row shows: name, phone, category badge, and next action date
- Tapping a row opens the existing `ContactDetailSheet` (reuse)
- FAB button to add new contact (reuse `AddContactModal`)
- Includes `BottomNav` at bottom
- Empty state when no contacts exist

**2. Update `src/components/BottomNav.tsx`**
- Add a "Contacts" tab with the `Users` icon from lucide-react
- Position it between Pipeline and Calendar
- Path: `/contacts`

**3. Update `src/App.tsx`**
- Add route `/contacts` pointing to the new `Contacts` page, wrapped in `ProtectedRoute`

### Technical details

| File | Change |
|------|--------|
| `src/pages/Contacts.tsx` | New file — contact list page with search, alphabetical sort, detail sheet |
| `src/components/BottomNav.tsx` | Add `{ path: '/contacts', icon: Users, label: 'Contacts' }` tab |
| `src/App.tsx` | Add `<Route path="/contacts">` with lazy import |

- Reuses `useContacts()` hook for data fetching (already returns all user contacts)
- Reuses `ContactDetailSheet` and `AddContactModal` components
- No database or dependency changes needed

