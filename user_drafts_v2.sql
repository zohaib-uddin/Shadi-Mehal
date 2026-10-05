-- SCHEMA FOR USER DRAFTS V2
-- Matches the requested structure exactly

CREATE TABLE IF NOT EXISTS public.user_drafts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('cart', 'bundle')),
    items JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.user_drafts ENABLE ROW LEVEL SECURITY;

-- Allow users to manage their own drafts
CREATE POLICY "Users can manage their own drafts v2"
ON public.user_drafts
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Ensure there is a unique constraint if we want one draft per user per type
-- This prevents duplicates
DELETE FROM public.user_drafts a USING public.user_drafts b WHERE a.id < b.id AND a.user_id = b.user_id AND a.type = b.type;
ALTER TABLE public.user_drafts DROP CONSTRAINT IF EXISTS unique_user_draft_type;
ALTER TABLE public.user_drafts ADD CONSTRAINT unique_user_draft_type UNIQUE (user_id, type);
