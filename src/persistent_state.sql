-- PRO-LEVEL CART & BUNDLE SCHEMA
-- This schema moves away from monolithic JSONB to relational stability

-- 1. TRACKING TABLE for both Guests and Users
CREATE TABLE IF NOT EXISTS public.user_tracks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    guest_id UUID, -- LocalStorage UUID for guests
    event_name TEXT NOT NULL,
    url TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    user_agent TEXT,
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. BUNDLES TABLE (For custom and shared bundles)
CREATE TABLE IF NOT EXISTS public.user_bundles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    guest_id UUID,
    title TEXT NOT NULL,
    description TEXT,
    total_price DECIMAL(12,2) NOT NULL DEFAULT 0,
    is_custom BOOLEAN DEFAULT true,
    status TEXT DEFAULT 'active', -- active, archived, ordered
    img TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. BUNDLE ITEMS (Relational components of a bundle)
CREATE TABLE IF NOT EXISTS public.user_bundle_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bundle_id UUID REFERENCES public.user_bundles(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'product' or 'service'
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(12,2), -- Snapshot of price at time of bundling
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. CARTS TABLE
CREATE TABLE IF NOT EXISTS public.carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    guest_id UUID,
    status TEXT DEFAULT 'active', -- active, abandoned, converted
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT one_active_cart_per_user UNIQUE (user_id, status) WHERE (status = 'active')
);

-- 5. CART ITEMS (Links products, services, or bundles to a cart)
CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id UUID REFERENCES public.carts(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
    bundle_id UUID REFERENCES public.user_bundles(id) ON DELETE SET NULL,
    premade_bundle_id UUID REFERENCES public.bundles(id) ON DELETE SET NULL,
    type TEXT NOT NULL, -- 'product', 'service', 'bundle'
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS POLICIES

-- user_tracks
ALTER TABLE public.user_tracks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anonymous can insert tracks" ON public.user_tracks FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can see their own tracks" ON public.user_tracks FOR SELECT USING (auth.uid() = user_id);

-- user_bundles
ALTER TABLE public.user_bundles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own bundles" ON public.user_bundles FOR ALL USING (auth.uid() = user_id OR guest_id IS NOT NULL);

-- user_bundle_items
ALTER TABLE public.user_bundle_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their bundle items" ON public.user_bundle_items FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_bundles WHERE id = bundle_id AND (user_id = auth.uid() OR guest_id IS NOT NULL))
);

-- carts
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own cart" ON public.carts FOR ALL USING (auth.uid() = user_id OR guest_id IS NOT NULL);

-- cart_items
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own cart items" ON public.cart_items FOR ALL USING (
    EXISTS (SELECT 1 FROM public.carts WHERE id = cart_id AND (user_id = auth.uid() OR guest_id IS NOT NULL))
);

-- FUNCTIONS FOR UPDATING TIMESTAMPS
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_carts_updated_at BEFORE UPDATE ON public.carts FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_bundles_updated_at BEFORE UPDATE ON public.user_bundles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
