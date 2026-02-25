

## Dashboard Tabs: Daily, Weekly, Monthly

### What changes
Refactor the Dashboard (`src/pages/Index.tsx`) to include three tabs — **Daily**, **Weekly**, and **Monthly** — using the existing Radix Tabs component. Each tab filters contacts by their `next_action_date` relative to the current date.

### Tab definitions

- **Daily** (default): Shows contacts due today + overdue (current behavior). Groups into "Overdue" and "Today" sections.
- **Weekly**: Shows contacts due within the next 7 days (excluding today/overdue). Groups by day (e.g., "Wednesday, Feb 26", "Thursday, Feb 27").
- **Monthly**: Shows contacts due within the next 30 days (excluding the current week). Groups by week (e.g., "Mar 3–9", "Mar 10–16").

### Summary line
The greeting subtitle updates per tab:
- Daily: "You have 3 actions today."
- Weekly: "You have 8 actions this week."
- Monthly: "You have 15 actions this month."

### Implementation details

1. **Add Tabs UI** below the header using `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` from the existing `@/components/ui/tabs`.

2. **Filter logic** using `date-fns` helpers (`isThisWeek`, `addDays`, `addMonths`, `startOfWeek`, `endOfWeek`, `isSameDay`, `isWithinInterval`):
   - `dailyTasks`: `next_action_date` is today or before today (existing logic, unchanged).
   - `weeklyTasks`: `next_action_date` is between tomorrow and end of this week (7 days out), sorted by date, grouped by day.
   - `monthlyTasks`: `next_action_date` is between next week and 30 days out, sorted by date, grouped by week.

3. **Each tab's content** reuses the existing `TaskCard` component. Sections are labeled with date group headers (same styling as "Overdue" / "Today" headers).

4. **Empty states** per tab ("No actions this week", "No actions this month").

### Technical notes
- No database changes needed — all filtering is client-side on existing `contacts` data.
- `date-fns` is already installed and provides all necessary date utilities.
- Tabs component already exists at `src/components/ui/tabs.tsx`.

