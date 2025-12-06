-- Enable RLS (Row Level Security)
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Site Content Management
CREATE TABLE site_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  section TEXT NOT NULL,
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(section, key)
);

-- Access Codes
CREATE TABLE access_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  used_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- User Profiles
CREATE TABLE user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  access_code_id UUID REFERENCES access_codes(id),
  devices TEXT[] DEFAULT '{}',
  last_page INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  from_user_id UUID REFERENCES user_profiles(id),
  from_admin BOOLEAN DEFAULT FALSE,
  to_user_id UUID REFERENCES user_profiles(id),
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics
CREATE TABLE analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL CHECK (event_type IN ('page_view', 'access_code_use', 'product_click', 'share')),
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  external_link TEXT,
  price TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies

-- Site Content - Only authenticated users can read, admin can write
CREATE POLICY "Anyone can read site content" ON site_content FOR SELECT TO public USING (true);
CREATE POLICY "Only admin can modify site content" ON site_content FOR ALL TO authenticated USING (auth.email() = 'admin@infinitebloom.com');

-- Access Codes - Public can read for validation, admin can manage
CREATE POLICY "Anyone can read access codes for validation" ON access_codes FOR SELECT TO public USING (true);
CREATE POLICY "Only admin can manage access codes" ON access_codes FOR ALL TO authenticated USING (auth.email() = 'admin@infinitebloom.com');

-- User Profiles - Users can read/update their own, admin can read all
CREATE POLICY "Users can read their own profile" ON user_profiles FOR SELECT TO authenticated USING (email = auth.email());
CREATE POLICY "Users can update their own profile" ON user_profiles FOR UPDATE TO authenticated USING (email = auth.email());
CREATE POLICY "Admin can read all profiles" ON user_profiles FOR SELECT TO authenticated USING (auth.email() = 'admin@infinitebloom.com');
CREATE POLICY "Admin can manage all profiles" ON user_profiles FOR ALL TO authenticated USING (auth.email() = 'admin@infinitebloom.com');

-- Messages - Users can read/write their own messages, admin can read/write all
CREATE POLICY "Users can read their own messages" ON messages FOR SELECT TO authenticated USING (
  from_user_id IN (SELECT id FROM user_profiles WHERE email = auth.email()) OR
  to_user_id IN (SELECT id FROM user_profiles WHERE email = auth.email())
);
CREATE POLICY "Users can send messages" ON messages FOR INSERT TO authenticated USING (
  from_user_id IN (SELECT id FROM user_profiles WHERE email = auth.email())
);
CREATE POLICY "Admin can read all messages" ON messages FOR SELECT TO authenticated USING (auth.email() = 'admin@infinitebloom.com');
CREATE POLICY "Admin can manage all messages" ON messages FOR ALL TO authenticated USING (auth.email() = 'admin@infinitebloom.com');

-- Analytics - Public can insert (for tracking), admin can read all
CREATE POLICY "Anyone can insert analytics" ON analytics FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Only admin can read analytics" ON analytics FOR SELECT TO authenticated USING (auth.email() = 'admin@infinitebloom.com');

-- Products - Anyone can read, admin can manage
CREATE POLICY "Anyone can read products" ON products FOR SELECT TO public USING (is_active = true);
CREATE POLICY "Only admin can manage products" ON products FOR ALL TO authenticated USING (auth.email() = 'admin@infinitebloom.com');

-- Indexes for better performance
CREATE INDEX idx_site_content_section_key ON site_content(section, key);
CREATE INDEX idx_access_codes_code ON access_codes(code);
CREATE INDEX idx_access_codes_email ON access_codes(email);
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_messages_from_user ON messages(from_user_id);
CREATE INDEX idx_messages_to_user ON messages(to_user_id);
CREATE INDEX idx_analytics_event_type ON analytics(event_type);
CREATE INDEX idx_analytics_created_at ON analytics(created_at);
CREATE INDEX idx_products_order_index ON products(order_index);

-- Functions and Triggers

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default site content
INSERT INTO site_content (section, key, value) VALUES
('hero', 'title', '"Infinite Bloom"'),
('hero', 'subtitle', '"A digital flipbook experience that captures the essence of personal growth and reflection through poetry, audio, and interactive insights."'),
('hero', 'quote', '"Every ending is a new beginning, every bloom infinite in its possibility."'),
('hero', 'description', '"Infinite Bloom is an immersive digital experience combining poetry, audio narration, and personal reflections to create a unique journey of self-discovery."'),
('hero', 'mainImage', '"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=600&fit=crop"'),
('features', 'poemsCount', '"45"'),
('features', 'poemsDescription', '"Carefully curated poems that explore themes of growth, change, and self-discovery"'),
('features', 'audioCount', '"45"'),
('features', 'audioDescription', '"Professional audio narrations bringing each poem to life with emotion and clarity"'),
('features', 'insightsCount', '"143"'),
('features', 'insightsDescription', '"Personal reflections and insights that deepen your understanding of each piece"'),
('features', 'dynamicDescription', '"Responsive design that adapts to your reading preferences and device"')
ON CONFLICT (section, key) DO NOTHING;

-- Insert sample products
INSERT INTO products (name, description, image_url, external_link, price, order_index) VALUES
('Physical Book', 'Get the printed version of Infinite Bloom', 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop', 'https://example.com/buy-book', '$24.99', 1),
('Audio Collection', 'Complete audio narration collection', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=400&fit=crop', 'https://example.com/buy-audio', '$19.99', 2),
('Digital + Audio Bundle', 'Get both digital and audio versions', 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop', 'https://example.com/buy-bundle', '$39.99', 3)
ON CONFLICT DO NOTHING;