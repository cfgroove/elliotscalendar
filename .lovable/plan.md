

## Add Swipe-to-Dismiss to Mark Done Modal

### Approach

Convert the `MarkDoneModal` from a `Dialog` (centered modal) to a `Drawer` (bottom sheet) — the same component already used by `ContactDetailSheet`. The `Drawer` component (powered by `vaul`, already installed) natively supports swipe-down-to-dismiss with a drag handle, giving the exact native mobile feel without any custom touch event handling.

### Changes (single file: `src/components/MarkDoneModal.tsx`)

1. Replace `Dialog`/`DialogContent`/`DialogHeader`/`DialogTitle` imports with `Drawer`/`DrawerContent`/`DrawerHeader`/`DrawerTitle` from `@/components/ui/drawer`
2. Swap JSX from `<Dialog>` → `<Drawer>` and `<DialogContent>` → `<DrawerContent>`
3. Apply matching styles from `ContactDetailSheet`: `rounded-t-3xl border-border bg-card max-h-[85vh]`
4. Content wraps in a scrollable `div` with `px-4 pb-8 overflow-y-auto`
5. The `DrawerContent` automatically renders a drag handle at the top — users swipe down to dismiss

### Why this approach
- `vaul` Drawer already handles touch gestures (swipe velocity, snap points, dismiss threshold) out of the box
- No custom `onTouchStart`/`onTouchMove` code needed
- Consistent with the `ContactDetailSheet` which already uses this pattern
- No new dependencies — `vaul` is already installed

### Technical details
- Single file change: `src/components/MarkDoneModal.tsx`
- Import swap only — all form logic, state, and handlers remain identical
- No database or dependency changes

