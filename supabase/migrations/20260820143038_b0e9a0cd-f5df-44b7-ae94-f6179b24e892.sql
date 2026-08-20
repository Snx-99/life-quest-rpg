REVOKE INSERT, UPDATE, DELETE ON public.user_roles FROM authenticated;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

DROP POLICY IF EXISTS "admins manage roles insert" ON public.user_roles;
DROP POLICY IF EXISTS "admins manage roles update" ON public.user_roles;
DROP POLICY IF EXISTS "admins manage roles delete" ON public.user_roles;

CREATE POLICY "admins manage roles insert" ON public.user_roles
FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin') AND user_id <> auth.uid());

CREATE POLICY "admins manage roles update" ON public.user_roles
FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin') AND user_id <> auth.uid())
WITH CHECK (public.has_role(auth.uid(), 'admin') AND user_id <> auth.uid());

CREATE POLICY "admins manage roles delete" ON public.user_roles
FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin') AND user_id <> auth.uid());