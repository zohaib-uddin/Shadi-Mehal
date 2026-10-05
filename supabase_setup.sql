-- SQL to setup user_drafts table for persistence
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.user_drafts (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    bundle_data JSONB DEFAULT '[]'::jsonb,
    cart_data JSONB DEFAULT '[]'::jsonb,
    is_building_bundle BOOLEAN DEFAULT false,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.user_drafts ENABLE ROW LEVEL SECURITY;

-- Allow users to manage their own drafts
CREATE POLICY "Users can manage their own drafts"
ON public.user_drafts
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Optional: ensure users table also exists and is partitioned
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    user_id UUID UNIQUE, -- Support both naming conventions
    name TEXT,
    email TEXT,
    role TEXT DEFAULT 'user',
    phone TEXT,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- FIXED: Support both 'profiles' and 'users' naming if referenced in other scripts
CREATE POLICY "Public profiles are viewable by everyone"
ON public.users FOR SELECT
TO public
USING (true);

CREATE POLICY "Users can update their own profile"
ON public.users FOR UPDATE
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
ON public.users FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- ADDED: RLS for core content tables to prevent "Empty Data" issue after login
-- These ensure that even when role changes to 'authenticated', data remains visible.

-- Products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products are viewable by everyone" ON public.products FOR SELECT TO public USING (true);
CREATE POLICY "Admins can manage products" ON public.products FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Services
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Services are viewable by everyone" ON public.services FOR SELECT TO public USING (true);
CREATE POLICY "Admins can manage services" ON public.services FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are viewable by everyone" ON public.categories FOR SELECT TO public USING (true);
CREATE POLICY "Admins can manage categories" ON public.categories FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Gallery
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Gallery viewable by everyone" ON public.gallery FOR SELECT TO public USING (true);
CREATE POLICY "Admins can manage gallery" ON public.gallery FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Drop NOT NULL constraints on product_variants columns for size-only or color-only products
ALTER TABLE public.product_variants ALTER COLUMN color_name DROP NOT NULL;
ALTER TABLE public.product_variants ALTER COLUMN size DROP NOT NULL;

