

## Replace Logout Button with Profile Popover

### Changes

**1. `src/pages/Index.tsx`**
- Remove the LogOut icon button from the header
- Replace with an Avatar button (user's initials) that opens a Popover
- Popover contains:
  - User avatar with initials
  - Display name
  - Email address
  - Separator
  - "Log out" button with LogOut icon
- Uses `useAuth` to get `displayName`, `user.email`, and `signOut`
- Uses existing `Avatar`, `AvatarFallback`, `Popover`, `PopoverTrigger`, `PopoverContent` components

### UI Layout
```text
┌──────────────────────────────┐
│ Good morning, Chase.    [AC] │  ← Avatar with initials
│ You have 3 actions today.    │
└──────────────────────────────┘
                           ┌─────────────┐
                           │  [AC]       │
                           │  Chase      │
                           │  c@cf.com   │
                           │  ─────────  │
                           │  ⎡Log out⎤  │
                           └─────────────┘
```

