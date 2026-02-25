

## LeadPilot — Personal Client Management & Scheduling App

A mobile-first, minimalist CRM alternative for salespeople and business owners to track leads and manage follow-ups. Dark theme with off-black/off-white palette, rounded corners, and a mix of serif headings + sans-serif body text — inspired by the crypto app design you shared.

---

### 🔐 Authentication
- Email/password login & signup via Supabase Auth
- Clean, minimal auth page matching the dark theme
- Profile auto-created on signup (stores user's display name for the greeting)

### 🗄️ Database (Supabase)
- **profiles** table: `id`, `display_name` (linked to auth.users)
- **contacts** table: `id`, `user_id`, `name`, `phone`, `notes`, `category` (enum: Warm Lead, Call Soon, Ready to Inspect, Monthly Follow Up), `next_action_date`, `next_action_task`, `created_at`, `updated_at`
- Row-Level Security so each user only sees their own data

---

### 📱 Three Core Views

#### 1. Daily Assistant Dashboard (Home)
- Dynamic greeting: *"Good morning, Alex. Here's your agenda for today."*
- Filtered list of contacts where `next_action_date` ≤ today (overdue items highlighted)
- Each card shows: **task** → **name** → **phone** → **notes preview**
- "Mark Done" action on each card → prompts to either archive or set new follow-up date & category
- Floating "＋ Add Lead" button

#### 2. Pipeline / Kanban Board
- Four columns: Warm Lead · Call Soon · Ready to Inspect · Monthly Follow Up
- Drag-and-drop contact cards between columns (updates category in DB)
- Cards show name, next action date, and task preview
- Tap card to view/edit full details

#### 3. Master Calendar
- Monthly calendar view with dots/indicators on dates that have scheduled actions
- Clicking a date shows list of contacts with actions on that day
- Tap a contact to open detail/edit modal

---

### ⚡ Key Interactions

- **Quick Add Modal**: Name, Phone, Notes, Category dropdown, Date picker (with presets like "Tomorrow", "Next Week", "3 Months"), and Next Action Task
- **Action Completion Flow**: Mark task done → modal asks: "Set next follow-up?" → pick new date, category & task, or close the loop
- **Contact Detail Sheet**: Bottom sheet (mobile) showing full contact info with edit capability

---

### 🎨 Design Direction
- **Dark theme** with off-black backgrounds (`#1A1A1A`, `#0D0D0D`) and off-white text (`#F5F5F5`)
- **Rounded corners** everywhere (cards, buttons, inputs)
- **Serif font** for headings/greetings, **sans-serif** for body/data
- Subtle accent color (soft purple or teal) for active states and CTAs
- Bottom navigation bar (mobile-first): Dashboard · Pipeline · Calendar
- Smooth transitions and micro-interactions

