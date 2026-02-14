
-- Create roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'student');

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- User roles table (separate from profiles per security requirements)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'student',
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Helper function to check role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
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

-- Programs table
CREATE TABLE public.programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  duration TEXT DEFAULT '',
  level TEXT DEFAULT 'Beginner',
  price NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;

-- Enrollments table
CREATE TABLE public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active',
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, program_id)
);
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- Tasks table
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  program_id UUID REFERENCES public.programs(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending',
  due_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Payments table
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  program_id UUID REFERENCES public.programs(id) ON DELETE SET NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  method TEXT DEFAULT 'simulation',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Resume analyses table (text-based, no file storage needed for MVP)
CREATE TABLE public.resume_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resume_text TEXT NOT NULL DEFAULT '',
  job_description TEXT NOT NULL DEFAULT '',
  extracted_skills JSONB DEFAULT '[]',
  matched_skills JSONB DEFAULT '[]',
  match_score NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.resume_analyses ENABLE ROW LEVEL SECURITY;

-- Trigger to create profile + assign student role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), NEW.email);
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'student');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies

-- Profiles: users see own, admins see all
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY "System can insert profiles" ON public.profiles FOR INSERT WITH CHECK (true);

-- User roles: viewable by own user or admin
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Only admins can manage roles" ON public.user_roles FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Only admins can update roles" ON public.user_roles FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Only admins can delete roles" ON public.user_roles FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Programs: everyone can read, admins can write
CREATE POLICY "Anyone can view programs" ON public.programs FOR SELECT USING (true);
CREATE POLICY "Admins can insert programs" ON public.programs FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update programs" ON public.programs FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete programs" ON public.programs FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Enrollments: own or admin
CREATE POLICY "Users can view own enrollments" ON public.enrollments FOR SELECT USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can enroll themselves" ON public.enrollments FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own enrollments" ON public.enrollments FOR UPDATE USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can delete own enrollments" ON public.enrollments FOR DELETE USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- Tasks: own or admin
CREATE POLICY "Users can view own tasks" ON public.tasks FOR SELECT USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can create own tasks" ON public.tasks FOR INSERT WITH CHECK (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can update own tasks" ON public.tasks FOR UPDATE USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can delete own tasks" ON public.tasks FOR DELETE USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- Payments: own or admin
CREATE POLICY "Users can view own payments" ON public.payments FOR SELECT USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can create own payments" ON public.payments FOR INSERT WITH CHECK (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update payments" ON public.payments FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- Resume analyses: own or admin
CREATE POLICY "Users can view own analyses" ON public.resume_analyses FOR SELECT USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can create own analyses" ON public.resume_analyses FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own analyses" ON public.resume_analyses FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own analyses" ON public.resume_analyses FOR DELETE USING (user_id = auth.uid());

-- Seed sample programs
INSERT INTO public.programs (name, description, duration, level, price) VALUES
  ('Full Stack Web Development', 'Master modern web development with React, Node.js, and cloud deployment.', '12 weeks', 'Intermediate', 499),
  ('Data Science Fundamentals', 'Learn Python, statistics, and machine learning basics.', '8 weeks', 'Beginner', 399),
  ('Cloud Architecture', 'Design and deploy scalable cloud solutions on AWS and GCP.', '10 weeks', 'Advanced', 599),
  ('UI/UX Design Bootcamp', 'Create stunning user interfaces with Figma and design thinking.', '6 weeks', 'Beginner', 299),
  ('DevOps Engineering', 'CI/CD pipelines, containerization, and infrastructure as code.', '10 weeks', 'Intermediate', 549);
