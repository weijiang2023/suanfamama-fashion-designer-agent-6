-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('designer', 'buyer', 'customer')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create collections table
CREATE TABLE IF NOT EXISTS public.collections (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    designer_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create news table
CREATE TABLE IF NOT EXISTS public.news (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    is_published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Enable insert for authenticated users only" ON public.users
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create policies for collections table
CREATE POLICY "Anyone can view published collections" ON public.collections
    FOR SELECT USING (true);

CREATE POLICY "Designers can insert their own collections" ON public.collections
    FOR INSERT WITH CHECK (auth.uid() = designer_id);

CREATE POLICY "Designers can update their own collections" ON public.collections
    FOR UPDATE USING (auth.uid() = designer_id);

CREATE POLICY "Designers can delete their own collections" ON public.collections
    FOR DELETE USING (auth.uid() = designer_id);

-- Create policies for news table
CREATE POLICY "Anyone can view published news" ON public.news
    FOR SELECT USING (is_published = true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_collections_designer_id ON public.collections(designer_id);
CREATE INDEX IF NOT EXISTS idx_collections_featured ON public.collections(is_featured);
CREATE INDEX IF NOT EXISTS idx_collections_created_at ON public.collections(created_at);
CREATE INDEX IF NOT EXISTS idx_news_published ON public.news(is_published);
CREATE INDEX IF NOT EXISTS idx_news_published_at ON public.news(published_at);

-- Insert some sample data
INSERT INTO public.news (title, content, image_url, is_published, published_at) VALUES
('Fashion Week 2024 Highlights', 'Discover the most stunning collections from this year''s fashion week. From avant-garde designs to sustainable fashion, this year''s shows have been truly spectacular.', 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400', true, NOW()),
('Sustainable Fashion Trends', 'The fashion industry is embracing sustainability like never before. Learn about the latest eco-friendly materials and ethical production methods.', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400', true, NOW() - INTERVAL '1 day'),
('Digital Fashion Revolution', 'Virtual fashion shows and digital clothing are changing the industry. Explore how technology is reshaping fashion design and retail.', 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400', true, NOW() - INTERVAL '2 days');