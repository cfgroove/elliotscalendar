

## Add Count Badges to Tab Triggers

### What changes
Add a small numeric badge next to each tab label (Daily, Weekly, Monthly) showing the count of actions in that time period.

### Implementation

**File: `src/pages/Index.tsx`**

Update the three `TabsTrigger` elements to include a count badge after the label text:

- **Daily tab**: Show `dailyTasks.length` 
- **Weekly tab**: Show `weeklyTasks.length`
- **Monthly tab**: Show `monthlyTasks.length`

Each badge is a small `<span>` with styles: `ml-1 min-w-5 h-5 rounded-full bg-primary-foreground/20 text-[10px] flex items-center justify-center` — only rendered when count > 0.

### Technical notes
- The task arrays (`dailyTasks`, `weeklyTasks`, `monthlyTasks`) are already computed via `useMemo` and available in scope — no new logic needed.
- Badge hides when count is 0 to keep the UI clean.
- Single file change, no dependencies.

