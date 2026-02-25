

## Fix Add Lead Modal Mobile Overflow

### Problem
The `DialogContent` base component uses `fixed` positioning with `w-full max-w-lg`, and the modal applies `max-w-md mx-4`. With fixed positioning, `mx-4` margins don't constrain width — the modal renders at full `max-w-md` (448px) which overflows on screens narrower than ~480px.

### Fix (single line change in `src/components/AddContactModal.tsx`)

Change line 79 from:
```
max-w-md mx-4
```
to:
```
w-[calc(100%-2rem)] max-w-md
```

This explicitly sets the width to viewport minus 1rem padding on each side, then caps it at `max-w-md` on larger screens. The modal will always fit within the screen with comfortable side margins.

Also add `overflow-y-auto max-h-[85vh]` to the form content area so the modal doesn't overflow vertically on shorter screens either.

