

## Mobile Overflow Audit

After reviewing all pages and modals, here are the issues found:

### Issue 1: MarkDoneModal — same overflow bug as AddContactModal had
**File:** `src/components/MarkDoneModal.tsx`, line 62
- Uses `max-w-md mx-4` on `DialogContent` — identical to the bug we just fixed on AddContactModal
- Fix: change to `w-[calc(100%-2rem)] max-w-md` (same pattern)

### Issue 2: Admin page table overflows on mobile
**File:** `src/pages/Admin.tsx`, line 56
- A 5-column `Table` (Name, Email, Signed Up, Last Active, Contacts) renders at full width with no horizontal scroll wrapper
- On mobile, columns get crushed or overflow off-screen
- Fix: wrap the `Table` in a `div` with `overflow-x-auto` so it scrolls horizontally, and add `min-w-[600px]` to the table itself to keep columns readable

### Everything else is fine
- **Dashboard (Index.tsx):** Uses `px-5`, `w-full`, text truncation — no overflow
- **Pipeline.tsx:** Tab labels are short ("Warm", "Call", etc.) — fits in `grid-cols-4`
- **CalendarView.tsx:** Calendar centered with `px-5` — fits
- **Auth.tsx:** `max-w-sm` with `px-4` — fits
- **ContactDetailSheet:** Uses `Drawer` (bottom sheet) — naturally full-width
- **BottomNav:** `fixed bottom-0 left-0 right-0` — fine
- **AddContactModal:** Already fixed with `w-[calc(100%-2rem)]`

### Changes summary
| File | Change |
|------|--------|
| `MarkDoneModal.tsx` | `mx-4` → `w-[calc(100%-2rem)]` on DialogContent |
| `Admin.tsx` | Wrap Table in `overflow-x-auto` container |

Two small edits, no new dependencies, no database changes.

