

## Super Admin View at `/admin`

### What changes

Add a role-based admin system and a new `/admin` page where you (the super admin) can see all registered users, their profile info, signup date, and contact counts.

### Database changes (3 migrations)

**1. Create `user_roles` table with `app_role` enum**

```sql
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
```

**2. Create `has_role` security definer function + RLS policies**

```sql
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Admins can read all roles; users can read their own
CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());
```

**3. Grant your account the admin role + allow admins to read all profiles**

```sql
-- Make Chase Francis (your account) an admin
INSERT INTO public.user_roles (user_id, role)
VALUES ('31a252b4-2018-47ae-a83c-6717b6b8036e', 'admin');

-- Allow admins to view all profiles (existing policy only allows own)
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to view all contacts (for contact count)
CREATE POLICY "Admins can view all contacts"
  ON public.contacts FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
```

### New edge function: `admin-users`

An edge function that uses the service role key to list users from `auth.users` (email, created_at, last_sign_in_at) and joins with profiles for display names and contacts for counts. This is necessary because `auth.users` is not queryable from the client SDK.

- Validates the calling user has the `admin` role before returning data
- Returns: `{ id, email, display_name, created_at, last_sign_in_at, contact_count }`

### New files

**`src/pages/Admin.tsx`**
- Protected page at `/admin` that checks the user's role
- Calls the `admin-users` edge function
- Displays a table with columns: Name, Email, Signed Up, Last Active, Contacts
- Shows a "not authorized" message if the user is not an admin
- Clean table design matching the app's dark theme

**`src/hooks/useAdminUsers.tsx`**
- React Query hook that calls the `admin-users` edge function
- Returns loading/error/data states

### Updated files

**`src/App.tsx`**
- Add route: `<Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />`

### Security model

- Admin check happens server-side in the edge function using the service role key
- The `has_role` function is `SECURITY DEFINER` to avoid RLS recursion
- Regular users cannot access the admin data even if they navigate to `/admin`
- The `user_roles` table is protected by RLS

