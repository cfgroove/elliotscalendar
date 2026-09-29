CREATE OR REPLACE FUNCTION public.list_public_tables()
RETURNS SETOF text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT tablename::text FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename
$$;
REVOKE EXECUTE ON FUNCTION public.list_public_tables() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.list_public_tables() TO service_role;