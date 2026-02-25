

## Add Search/Filter Bar to Dashboard

### What changes
Add a search input at the top of the dashboard (below the greeting, above the tabs) that filters contacts by name across all three tabs in real-time.

### Implementation

**File: `src/pages/Index.tsx`**

1. Add a `searchQuery` state (`useState('')`).
2. Place a search input with a magnifying glass icon between the header and tabs — styled with rounded-xl, bg-secondary, matching the dark theme.
3. Filter all three task lists (`dailyTasks`, `weeklyTasks`, `monthlyTasks`) by checking if `contact.name.toLowerCase()` includes the search query. The filter applies on top of the existing date-based filtering.
4. When the search field is non-empty, show a small "×" clear button inside the input.

### UI details
- Input uses `Search` icon from lucide-react (already imported pattern in the project).
- Matches existing design: `bg-secondary`, `rounded-xl`, `text-sm`, placeholder "Search contacts...".
- Filtering is instant (no debounce needed for this data size).

### No other files change
- No database changes.
- No new components needed — just a simple input + filter logic in `Index.tsx`.

