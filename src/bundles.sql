-- Drop the existing wholesale_requests table as we no longer need it.
DROP TABLE IF EXISTS wholesale_requests;

-- Create the new bundles table for Wholesale Bundles feature
CREATE TABLE bundles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL, -- 'premade' (admin) or 'custom' (user)
  price NUMERIC NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  created_by UUID, -- Can be admin or user
  status TEXT DEFAULT 'active',
  img TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE bundles ENABLE ROW LEVEL SECURITY;

-- If you are not using strict RLS, these policies allow frontend and admin to freely use bundles:
CREATE POLICY "Enable read access for all users" ON bundles FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON bundles FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON bundles FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON bundles FOR DELETE USING (true);
