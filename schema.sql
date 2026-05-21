-- Create generations table
CREATE TABLE IF NOT EXISTS generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  prompt TEXT NOT NULL,
  response TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to read their own generations
-- This supports standard Supabase auth AND custom Clerk JWT integration
CREATE POLICY "Users can view their own generations" 
ON generations 
FOR SELECT 
TO public 
USING (
  auth.uid()::text = user_id 
  OR (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub') = user_id
);

-- Policy to allow users to insert their own generations
CREATE POLICY "Users can insert their own generations" 
ON generations 
FOR INSERT 
TO public 
WITH CHECK (
  auth.uid()::text = user_id 
  OR (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub') = user_id
);

-- Policy to allow users to delete their own generations
CREATE POLICY "Users can delete their own generations" 
ON generations 
FOR DELETE 
TO public 
USING (
  auth.uid()::text = user_id 
  OR (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub') = user_id
);

-- Create index for performance on user_id queries
CREATE INDEX IF NOT EXISTS generations_user_id_idx ON generations(user_id);
