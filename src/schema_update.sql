-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('product', 'service', 'both')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Update products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id);
ALTER TABLE products ADD COLUMN IF NOT EXISTS features TEXT[];
ALTER TABLE products ADD COLUMN IF NOT EXISTS specifications JSONB;

-- Update services table
ALTER TABLE services ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id);
ALTER TABLE services ADD COLUMN IF NOT EXISTS features TEXT[];
ALTER TABLE services ADD COLUMN IF NOT EXISTS duration TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS vendor_id UUID REFERENCES users(id);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    item_id UUID NOT NULL, -- Can be product_id or service_id
    user_id UUID REFERENCES auth.users(id),
    user_name TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are viewable by everyone" ON categories FOR SELECT TO public USING (true);
CREATE POLICY "Admins can manage categories" ON categories FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- RLS for reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reviews are viewable by everyone" ON reviews FOR SELECT TO public USING (status = 'approved');
CREATE POLICY "Users can add reviews" ON reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage reviews" ON reviews FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Service Requests table
CREATE TABLE IF NOT EXISTS service_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_name TEXT NOT NULL,
  user_phone TEXT NOT NULL,
  service_id UUID REFERENCES services(id),
  service_name TEXT NOT NULL,
  event_type TEXT NOT NULL,
  location TEXT NOT NULL,
  event_date DATE NOT NULL,
  guests_count INTEGER NOT NULL,
  estimated_price NUMERIC NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for service_requests
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service requests can be created by anyone" ON service_requests FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Admins can view and manage service requests" ON service_requests FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Multi-image Gallery Support
ALTER TABLE products ADD COLUMN IF NOT EXISTS gallery TEXT[] DEFAULT '{}';
ALTER TABLE services ADD COLUMN IF NOT EXISTS gallery TEXT[] DEFAULT '{}';
ALTER TABLE deals ADD COLUMN IF NOT EXISTS gallery TEXT[] DEFAULT '{}';

-- Drop NOT NULL constraints on product_variants columns for size-only or color-only products
ALTER TABLE public.product_variants ALTER COLUMN color_name DROP NOT NULL;
ALTER TABLE public.product_variants ALTER COLUMN size DROP NOT NULL;

