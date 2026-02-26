

## Redesign the Task "Done" Button for Better Clarity

### Problem
The current check button is a filled purple square with a checkmark already visible. This makes it look like the task is already completed, not something to click. Users don't realize it's interactive.

### Changes (single file: `src/pages/Index.tsx`)

**1. Replace the filled check icon with an empty circle outline**
- Swap the `Check` icon for a `Circle` icon (from lucide-react) to signal "not yet done"
- Add a clear 2px border ring in the primary/warning color
- Remove the background fill — use `border-2 border-primary` instead of `bg-primary/10`
- On hover, show the `Check` icon inside the circle as a preview of what clicking does

**2. Add a subtle pulsing animation to draw attention**
- Apply an `animate-pulse` style to the circle button so it gently pulses
- Use a soft glow ring (`ring-2 ring-primary/30`) that pulses to suggest interactivity
- The pulse stops on hover (replaced by the check preview)

**3. Updated button markup**

Current:
```
bg-primary/10 text-primary → filled square with checkmark
```

New:
```
border-2 border-primary rounded-full → empty circle outline
animate-pulse on the ring/glow
hover: show Check icon + stop pulse
```

### Technical details

| Detail | Value |
|--------|-------|
| File | `src/pages/Index.tsx` (TaskCard function, lines 263-289) |
| Icon change | `Check` → `Circle` (default), `Check` on hover via group-hover |
| Shape | `rounded-xl` → `rounded-full` for circle feel |
| Animation | Tailwind `animate-pulse` on a ring shadow, stops on hover |
| Overdue variant | `border-warning` with warning-colored pulse glow |

No new dependencies — `Circle` is already available in lucide-react, `animate-pulse` is built into Tailwind.

