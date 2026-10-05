-- REVIEWS TABLE
CREATE TABLE reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  item_id UUID, -- This can refer to a product or service ID
  item_type TEXT,
  user_id UUID REFERENCES auth.users(id),
  user_name TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT
);

-- FEEDBACK TABLE (General site feedback)
CREATE TABLE feedback (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  user_name TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  status TEXT DEFAULT 'pending' -- for approval
);

-- ENABLE RLS
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- POLICIES FOR FEEDBACK
CREATE POLICY "Anyone can view approved feedback" ON feedback
  FOR SELECT USING (status = 'approved');

CREATE POLICY "Authenticated users can submit feedback" ON feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all feedback" ON feedback
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- INVOICES TABLE
CREATE TABLE invoices (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'paid',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ORDERS TABLE
DROP TABLE IF EXISTS orders CASCADE;
CREATE TABLE orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  "userId" UUID REFERENCES auth.users(id),
  "userName" TEXT,
  "userEmail" TEXT,
  total NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending',
  items JSONB DEFAULT '[]'::jsonb,
  "paymentStatus" TEXT DEFAULT 'unpaid',
  "paymentMethod" TEXT,
  address TEXT,
  phone TEXT,
  notes TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  is_custom_bundle BOOLEAN DEFAULT false
);

-- RE-LINK REVIEWS AND INVOICES IF NEEDED (already handled by cascade if they were pointing to old orders)
-- Actually, let's keep the order of creation safe

-- ENABLE RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- POLICIES FOR ORDERS
CREATE POLICY "Users can view their own orders" ON orders
  FOR SELECT USING (auth.uid() = "userId");

CREATE POLICY "Users can create their own orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = "userId");

CREATE POLICY "Admins can view all orders" ON orders
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- POLICIES FOR REVIEWS
CREATE POLICY "Anyone can view reviews" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create reviews" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- POLICIES FOR INVOICES
CREATE POLICY "Users can view their own invoices" ON invoices
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all invoices" ON invoices
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Drop NOT NULL constraints on product_variants columns for size-only or color-only products
ALTER TABLE public.product_variants ALTER COLUMN color_name DROP NOT NULL;
ALTER TABLE public.product_variants ALTER COLUMN size DROP NOT NULL;

