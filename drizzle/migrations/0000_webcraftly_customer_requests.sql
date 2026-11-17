CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL DEFAULT '' CHECK (char_length(display_name) <= 120),
  phone text NOT NULL DEFAULT '' CHECK (char_length(phone) <= 40),
  business_name text NOT NULL DEFAULT '' CHECK (char_length(business_name) <= 160),
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TYPE public.webcraftly_role AS ENUM ('admin', 'manager');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.webcraftly_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.service_inquiries (
  id uuid PRIMARY KEY,
  user_id uuid,
  inquiry_type text NOT NULL DEFAULT 'quote' CHECK (inquiry_type IN ('quote', 'cart')),
  full_name text NOT NULL CHECK (char_length(btrim(full_name)) BETWEEN 1 AND 120),
  email text NOT NULL CHECK (char_length(email) <= 255),
  phone text NOT NULL DEFAULT '' CHECK (char_length(phone) <= 40),
  business_name text NOT NULL DEFAULT '' CHECK (char_length(business_name) <= 160),
  service_name text NOT NULL DEFAULT '' CHECK (char_length(service_name) <= 160),
  budget text NOT NULL DEFAULT '' CHECK (char_length(budget) <= 80),
  timeline text NOT NULL DEFAULT '' CHECK (char_length(timeline) <= 120),
  reference_url text NOT NULL DEFAULT '' CHECK (char_length(reference_url) <= 2000),
  project_description text NOT NULL CHECK (char_length(btrim(project_description)) BETWEEN 1 AND 10000),
  special_instructions text NOT NULL DEFAULT '' CHECK (char_length(special_instructions) <= 5000),
  cart_snapshot jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(cart_snapshot) = 'array'),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'under_review', 'completed', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.service_inquiries TO anon;
GRANT SELECT, INSERT, UPDATE ON public.service_inquiries TO authenticated;
GRANT ALL ON public.service_inquiries TO service_role;
ALTER TABLE public.service_inquiries ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_webcraftly_role(_user_id uuid, _role public.webcraftly_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT _user_id = auth.uid() AND EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  );
$$;
REVOKE ALL ON FUNCTION public.has_webcraftly_role(uuid, public.webcraftly_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_webcraftly_role(uuid, public.webcraftly_role) TO authenticated;

CREATE POLICY "Customers view their own profile" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "Customers create their own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "Customers update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE POLICY "Customers read their own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Administrators assign roles" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (public.has_webcraftly_role(auth.uid(), 'admin'::public.webcraftly_role));
CREATE POLICY "Administrators update roles" ON public.user_roles FOR UPDATE TO authenticated USING (public.has_webcraftly_role(auth.uid(), 'admin'::public.webcraftly_role)) WITH CHECK (public.has_webcraftly_role(auth.uid(), 'admin'::public.webcraftly_role));
CREATE POLICY "Administrators remove roles" ON public.user_roles FOR DELETE TO authenticated USING (public.has_webcraftly_role(auth.uid(), 'admin'::public.webcraftly_role));

CREATE POLICY "Guests submit quote requests" ON public.service_inquiries FOR INSERT TO anon WITH CHECK (user_id IS NULL);
CREATE POLICY "Customers submit their own requests" ON public.service_inquiries FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Customers view their own requests" ON public.service_inquiries FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Administrators review all requests" ON public.service_inquiries FOR SELECT TO authenticated USING (public.has_webcraftly_role(auth.uid(), 'admin'::public.webcraftly_role));
CREATE POLICY "Administrators update request status" ON public.service_inquiries FOR UPDATE TO authenticated USING (public.has_webcraftly_role(auth.uid(), 'admin'::public.webcraftly_role)) WITH CHECK (public.has_webcraftly_role(auth.uid(), 'admin'::public.webcraftly_role));

CREATE OR REPLACE FUNCTION public.handle_new_webcraftly_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', ''))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.handle_new_webcraftly_profile() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER on_auth_user_created_webcraftly_profile
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_webcraftly_profile();

CREATE OR REPLACE FUNCTION public.set_webcraftly_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
CREATE TRIGGER update_webcraftly_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_webcraftly_updated_at();
CREATE TRIGGER update_webcraftly_inquiries_updated_at
BEFORE UPDATE ON public.service_inquiries
FOR EACH ROW EXECUTE FUNCTION public.set_webcraftly_updated_at();