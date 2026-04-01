-- SQL Schema for Social Media Scheduler

-- 1. Create a table for Posts
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  caption TEXT,
  media_url TEXT,
  scheduled_at TIMESTAMPTZ NOT NULL,
  platforms TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'posted', 'failed')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for posts
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Post Policies
DROP POLICY IF EXISTS "Users can insert their own posts" ON public.posts;
CREATE POLICY "Users can insert their own posts" ON public.posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own posts" ON public.posts;
CREATE POLICY "Users can view their own posts" ON public.posts
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own posts" ON public.posts;
CREATE POLICY "Users can update their own posts" ON public.posts
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own posts" ON public.posts;
CREATE POLICY "Users can delete their own posts" ON public.posts
  FOR DELETE USING (auth.uid() = user_id);

-- 2. Create a table for Social Media Connections
CREATE TABLE IF NOT EXISTS public.user_connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('facebook', 'tiktok', 'youtube')),
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ,
  account_name TEXT,
  account_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, platform)
);

-- Enable RLS for user_connections
ALTER TABLE public.user_connections ENABLE ROW LEVEL SECURITY;

-- Connection Policies
DROP POLICY IF EXISTS "Users can manage their own connections" ON public.user_connections;
CREATE POLICY "Users can manage their own connections" ON public.user_connections
  FOR ALL USING (auth.uid() = user_id);

-- 3. Create a table for Developer API Settings (Credentials)
CREATE TABLE IF NOT EXISTS public.api_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('facebook', 'tiktok', 'youtube')),
  client_id TEXT NOT NULL,
  client_secret TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, platform)
);

-- Enable RLS for api_settings
ALTER TABLE public.api_settings ENABLE ROW LEVEL SECURITY;

-- API Settings Policies
DROP POLICY IF EXISTS "Users can manage their own API settings" ON public.api_settings;
CREATE POLICY "Users can manage their own API settings" ON public.api_settings
  FOR ALL USING (auth.uid() = user_id);

-- 4. Storage Bucket for Media
-- (Note: You also need to create a bucket named 'media' manually in the Supabase Dashboard)
-- Or run this in SQL Editor if your Supabase version supports it:
-- INSERT INTO storage.buckets (id, name) VALUES ('media', 'media');
