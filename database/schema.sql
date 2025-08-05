-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret-here';

-- Create tables for the fashion designer platform

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'designer', 'buyer', 'admin')),
    bio TEXT,
    website TEXT,
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Collections table
CREATE TABLE IF NOT EXISTS public.collections (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    designer_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    designer_name TEXT NOT NULL,
    is_featured BOOLEAN DEFAULT FALSE,
    is_published BOOLEAN DEFAULT TRUE,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Featured collections view (for landing page)
CREATE TABLE IF NOT EXISTS public.featured_collections (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    designer TEXT NOT NULL,
    is_featured BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- News items table
CREATE TABLE IF NOT EXISTS public.news_items (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    author_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    author_name TEXT,
    is_published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Designs table (individual designs within collections)
CREATE TABLE IF NOT EXISTS public.designs (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    collection_id INTEGER REFERENCES public.collections(id) ON DELETE CASCADE,
    designer_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    ai_generated BOOLEAN DEFAULT FALSE,
    design_data JSONB, -- Store AI design parameters
    likes_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User interactions table (likes, saves, etc.)
CREATE TABLE IF NOT EXISTS public.user_interactions (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    target_type TEXT NOT NULL CHECK (target_type IN ('collection', 'design')),
    target_id INTEGER NOT NULL,
    interaction_type TEXT NOT NULL CHECK (interaction_type IN ('like', 'save', 'view')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, target_type, target_id, interaction_type)
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.featured_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_interactions ENABLE ROW LEVEL SECURITY;

-- Create policies

-- Users policies
CREATE POLICY "Users can view all profiles" ON public.users
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Collections policies
CREATE POLICY "Anyone can view published collections" ON public.collections
    FOR SELECT USING (is_published = true);

CREATE POLICY "Designers can manage own collections" ON public.collections
    FOR ALL USING (auth.uid() = designer_id);

-- Featured collections policies (public read access)
CREATE POLICY "Anyone can view featured collections" ON public.featured_collections
    FOR SELECT USING (true);

-- News policies
CREATE POLICY "Anyone can view published news" ON public.news_items
    FOR SELECT USING (is_published = true);

-- Designs policies
CREATE POLICY "Anyone can view designs from published collections" ON public.designs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.collections 
            WHERE collections.id = designs.collection_id 
            AND collections.is_published = true
        )
    );

CREATE POLICY "Designers can manage own designs" ON public.designs
    FOR ALL USING (auth.uid() = designer_id);

-- User interactions policies
CREATE POLICY "Users can manage own interactions" ON public.user_interactions
    FOR ALL USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_collections_designer_id ON public.collections(designer_id);
CREATE INDEX IF NOT EXISTS idx_collections_featured ON public.collections(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_collections_published ON public.collections(is_published) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_designs_collection_id ON public.designs(collection_id);
CREATE INDEX IF NOT EXISTS idx_designs_designer_id ON public.designs(designer_id);
CREATE INDEX IF NOT EXISTS idx_news_published ON public.news_items(is_published, published_at) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_user_interactions_user_id ON public.user_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_target ON public.user_interactions(target_type, target_id);

-- Create functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updating timestamps
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_collections_updated_at BEFORE UPDATE ON public.collections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_news_items_updated_at BEFORE UPDATE ON public.news_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_designs_updated_at BEFORE UPDATE ON public.designs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();