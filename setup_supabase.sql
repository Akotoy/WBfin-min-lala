-- 1. Create table for User Settings (API Tokens and Tax Rate)
CREATE TABLE public.user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create table for Product COGS (Cost of goods sold)
CREATE TABLE public.product_cogs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nm_id BIGINT NOT NULL,
  cost NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, nm_id)
);

-- 3. Enable Row Level Security (RLS) on both tables
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_cogs ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies for User Settings
-- Users can only read their own settings
CREATE POLICY "Users can view their own settings" 
ON public.user_settings FOR SELECT 
USING (auth.uid() = user_id);

-- Users can only insert their own settings
CREATE POLICY "Users can insert their own settings" 
ON public.user_settings FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can only update their own settings
CREATE POLICY "Users can update their own settings" 
ON public.user_settings FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 5. Create Policies for Product COGS
-- Users can only view their own COGS
CREATE POLICY "Users can view their own cogs" 
ON public.product_cogs FOR SELECT 
USING (auth.uid() = user_id);

-- Users can only insert their own COGS
CREATE POLICY "Users can insert their own cogs" 
ON public.product_cogs FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can only update their own COGS
CREATE POLICY "Users can update their own cogs" 
ON public.product_cogs FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
