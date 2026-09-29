INSERT INTO public.user_roles (user_id, role)
SELECT id, 'owner'::public.app_role FROM auth.users WHERE email = 'chase@cfgroove.com'
ON CONFLICT (user_id, role) DO NOTHING;

CREATE OR REPLACE FUNCTION public.is_owner()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(auth.uid(), 'owner')
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'owner')
$$;

CREATE TABLE public.automation_settings (
  key text PRIMARY KEY,
  enabled boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);
GRANT SELECT, UPDATE ON public.automation_settings TO authenticated;
GRANT ALL ON public.automation_settings TO service_role;
ALTER TABLE public.automation_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read automation settings" ON public.automation_settings FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Owner updates automation settings" ON public.automation_settings FOR UPDATE TO authenticated USING (public.is_owner()) WITH CHECK (public.is_owner());

CREATE TABLE public.automation_run_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  automation_key text NOT NULL,
  ran_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL CHECK (status IN ('ok','skipped','error')),
  detail text
);
GRANT SELECT ON public.automation_run_log TO authenticated;
GRANT ALL ON public.automation_run_log TO service_role;
ALTER TABLE public.automation_run_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read automation run log" ON public.automation_run_log FOR SELECT TO authenticated USING (public.is_admin());
CREATE INDEX automation_run_log_key_ran_at ON public.automation_run_log (automation_key, ran_at DESC);

INSERT INTO public.automation_settings (key, enabled) VALUES ('master', true), ('db_backup', true)
ON CONFLICT (key) DO NOTHING;

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

CREATE OR REPLACE FUNCTION public.verify_cron_secret(_secret text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, vault AS $$
  SELECT _secret IS NOT NULL AND EXISTS (SELECT 1 FROM vault.decrypted_secrets WHERE name = 'cron_secret' AND decrypted_secret = _secret)
$$;
REVOKE EXECUTE ON FUNCTION public.verify_cron_secret(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.verify_cron_secret(text) TO service_role;