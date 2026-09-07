CREATE TABLE IF NOT EXISTS public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text,
  status text NOT NULL DEFAULT 'pending',
  result_url text,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon can view tasks" ON public.tasks FOR SELECT USING (true);
