

## Pipeline Page Redesign

### The Problem

The current pipeline uses a horizontal Kanban-style layout with 4 fixed-width (260px) columns that scroll horizontally. On mobile (which this app is clearly designed for), this creates several issues:

- You can only see ~1.3 columns at a time, making drag-and-drop nearly impossible
- HTML5 drag-and-drop (`draggable` / `onDrop`) does not work on mobile touch devices at all
- Horizontal scrolling while trying to drag is a broken UX pattern on small screens
- The "Drop leads here" empty states are barely visible

### Proposed Redesign: Tab-based Pipeline with Swipe-to-Move

Replace the horizontal columns with a **tabbed view** (one category per tab) and use **action buttons or swipe gestures** to move contacts between stages.

```text
┌─────────────────────────────┐
│ Pipeline          1 total   │
│                             │
│ ┌─────┬─────┬─────┬──────┐  │
│ │Warm │Call │Ready│Follow│  │
│ │ (1) │ (0) │ (0) │  (0) │  │
│ └─────┴─────┴─────┴──────┘  │
│                             │
│ ┌───────────────────────┐   │
│ │ John 1            ▸ ▸ │   │
│ │ follow up call        │   │
│ │ Mar 11          ☎ 💬  │   │
│ └───────────────────────┘   │
│                             │
│   Empty? "No leads here"   │
│                             │
│              [+]            │
│ ┌───┬───┬───┐               │
│ │ 🏠│ ▦ │ 📅│               │
│ └───┴───┴───┘               │
└─────────────────────────────┘
```

### Implementation Details

**File: `src/pages/Pipeline.tsx`** (full rewrite)

1. **Replace horizontal columns with `Tabs` component** using the existing Radix `Tabs` / `TabsList` / `TabsTrigger` / `TabsContent` from `src/components/ui/tabs.tsx`
   - One tab per category: "Warm Lead", "Call Soon", "Ready to Inspect", "Monthly Follow Up"
   - Each tab trigger shows a count badge (same pattern as Dashboard)
   - Shortened labels for mobile: "Warm", "Call", "Ready", "Follow Up"

2. **Remove HTML5 drag-and-drop entirely** (does not work on mobile)

3. **Add move-forward / move-back buttons on each card**
   - Small chevron buttons (`ChevronLeft` / `ChevronRight` from lucide) on each contact card
   - Tapping moves the contact to the adjacent category in the pipeline order
   - Visual feedback via toast (already in place)

4. **Add call/text quick-action buttons on cards** (phone and message icons) for contacts with phone numbers, consistent with the Dashboard cards

5. **Better empty state** — centered message with a prompt to add a lead

### What stays the same
- The `+` FAB button and `AddContactModal`
- `ContactDetailSheet` for viewing/editing details on card tap
- `BottomNav`
- All data hooks (`useContacts`, `useUpdateContact`)

### Technical notes
- Single file change: `src/pages/Pipeline.tsx`
- No new dependencies — uses existing `Tabs` UI component and lucide icons
- No database changes
- The tab-based approach works perfectly on both mobile and desktop

