
-- 1. Create categories table
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL, -- 'product', 'service', or 'both'
  img TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add category_id to products and services
ALTER TABLE products ADD COLUMN category_id UUID REFERENCES categories(id);
ALTER TABLE services ADD COLUMN category_id UUID REFERENCES categories(id);

-- Optional: Migrate existing string-based categories if any (or just keep them as secondary)
-- For now, we'll use the new category_id for dynamic functionality.

-- 3. Create reviews table
CREATE TABLE reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID NOT NULL, -- product or service id
  item_type TEXT NOT NULL, -- 'product' or 'service'
  user_id UUID REFERENCES auth.users(id),
  user_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- 5. Policies
CREATE POLICY "Enable read access for all users" ON categories FOR SELECT USING (true);
CREATE POLICY "Enable insert access for admins" ON categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for admins" ON categories FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for admins" ON categories FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON reviews FOR SELECT USING (true);
CREATE POLICY "Enable insert access for authenticated users" ON reviews FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Enable delete access for owners or admins" ON reviews FOR DELETE USING (auth.uid() = user_id);

-- 6. Gallery update (if not already enabled)
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON gallery FOR SELECT USING (true);
CREATE POLICY "Enable all access for admins" ON gallery FOR ALL USING (true);

-- Drop NOT NULL constraints on product_variants columns for size-only or color-only products
ALTER TABLE public.product_variants ALTER COLUMN color_name DROP NOT NULL;
ALTER TABLE public.product_variants ALTER COLUMN size DROP NOT NULL;

