-- 1. TABLES: Create the world foundations
CREATE TABLE IF NOT EXISTS subjects (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#ffaa00',
  icon TEXT DEFAULT 'book',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Update Profiles to include last_seen
CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  last_seen TIMESTAMPTZ DEFAULT now()
);

-- Add last_seen column if it doesn't exist (idempotent)
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='last_seen') THEN
    ALTER TABLE profiles ADD COLUMN last_seen TIMESTAMPTZ DEFAULT now();
  END IF;
END $$;

-- 2. SCHEMA UPDATES: Add Priority and Subject links to Tasks
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tasks' AND column_name='subject_id') THEN
    ALTER TABLE tasks ADD COLUMN subject_id uuid REFERENCES subjects(id) ON DELETE SET NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tasks' AND column_name='priority') THEN
    ALTER TABLE tasks ADD COLUMN priority INTEGER DEFAULT 1 CHECK (priority >= 1 AND priority <= 5);
  END IF;
END $$;

-- 3. SECURITY: Enable RLS
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- Note: Tasks table created elsewhere or assumed existing, enable RLS if needed
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- 4. POLICIES: Who can see what (The "Rules of the Realm")
DROP POLICY IF EXISTS "Users can view their own subjects" ON subjects;
CREATE POLICY "Users can view their own subjects" ON subjects FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own subjects" ON subjects;
CREATE POLICY "Users can insert their own subjects" ON subjects FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own subjects" ON subjects;
CREATE POLICY "Users can delete their own subjects" ON subjects FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);

-- Allow users to update their own last_seen
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- 5. AUTOMATION: The "New Player Spawn" Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, last_seen)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'username', 'New Crafter'), now());
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 6. MULTIPLAYER: The Leaderboard View
CREATE OR REPLACE VIEW public.leaderboard AS
  SELECT 
    p.username,
    p.id as user_id,
    p.last_seen,
    COUNT(t.id) FILTER (WHERE t.is_complete = true) as total_completed,
    COALESCE(SUM(t.priority * 100) FILTER (WHERE t.is_complete = true), 0) as total_xp
  FROM public.profiles p
  LEFT JOIN public.tasks t ON p.id = t.user_id
  GROUP BY p.id, p.username, p.last_seen
  ORDER BY total_xp DESC;

GRANT SELECT ON public.leaderboard TO authenticated;
GRANT SELECT ON public.leaderboard TO anon;