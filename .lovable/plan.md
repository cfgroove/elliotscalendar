

## Add Archive Page for Deleted Leads

### Current behavior
When a user clicks "Close Lead" in the MarkDoneModal, the contact is permanently deleted from the database. There is no way to recover or review closed leads.

### Proposed changes

**1. Database migration — add `archived_at` column to `contacts` table**
- Add a nullable `timestamp with time zone` column `archived_at` (default `NULL`)
- When `NULL`, the contact is active; when set, the contact is archived
- Add an RLS policy so users can read their own archived contacts

**2. Update `useContacts` hook (`src/hooks/useContacts.tsx`)**
- Filter active contacts: add `.is('archived_at', null)` to the existing query
- Add a new `useArchivedContacts()` hook that fetches contacts where `archived_at` is not null
- Add a `useRestoreContact()` mutation that sets `archived_at` back to null
- Change `useDeleteContact` to soft-delete (set `archived_at = now()`) instead of hard-deleting

**3. Update MarkDoneModal (`src/components/MarkDoneModal.tsx`)**
- Change `handleClose` from `deleteContact.mutateAsync(id)` to `updateContact.mutateAsync({ id, archived_at: now() })`
- Update toast message to "Lead archived"
- Remove the `useDeleteContact` import (no longer needed here)

**4. New page: `src/pages/Archive.tsx`**
- Header: "Archived Leads"
- Search bar to filter archived contacts
- List of archived contacts showing name, phone, category, and archived date
- Each row has a "Restore" button that calls `useRestoreContact`
- Empty state when no archived contacts exist
- Includes `BottomNav`

**5. Update `src/components/BottomNav.tsx`**
- Add an "Archive" tab with the `Archive` icon from lucide-react after Contacts

**6. Update `src/App.tsx`**
- Add protected route `/archive` pointing to the Archive page

### Technical details

| File | Change |
|------|--------|
| Migration SQL | `ALTER TABLE contacts ADD COLUMN archived_at timestamptz DEFAULT NULL` |
| `src/hooks/useContacts.tsx` | Add `.is('archived_at', null)` filter; add `useArchivedContacts`, `useRestoreContact`; change delete to soft-delete |
| `src/components/MarkDoneModal.tsx` | Use update (set `archived_at`) instead of delete |
| `src/pages/Archive.tsx` | New page — archived contacts list with restore |
| `src/components/BottomNav.tsx` | Add Archive tab |
| `src/App.tsx` | Add `/archive` route |

The `types.ts` file will auto-update after the migration to include the new `archived_at` field.

