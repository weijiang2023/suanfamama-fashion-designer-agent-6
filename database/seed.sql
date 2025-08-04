-- Seed data for the fashion designer platform

-- Insert sample featured collections
INSERT INTO public.featured_collections (title, description, image_url, designer) VALUES
('Ethereal Dreams', 'A collection inspired by celestial beauty and flowing fabrics that capture the essence of dreams.', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&h=600&fit=crop', 'Luna Martinez'),
('Urban Minimalist', 'Clean lines and neutral tones define this modern collection perfect for city living.', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop', 'Alex Chen'),
('Vintage Revival', 'Bringing back the glamour of the 1960s with a contemporary twist and sustainable materials.', 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&h=600&fit=crop', 'Sofia Rodriguez'),
('Botanical Fusion', 'Nature-inspired designs featuring organic patterns and eco-friendly fabrics.', 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&h=600&fit=crop', 'Maya Patel'),
('Neon Nights', 'Bold, electric designs that light up the night with vibrant colors and futuristic silhouettes.', 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&h=600&fit=crop', 'Jordan Kim'),
('Coastal Breeze', 'Relaxed, flowing pieces inspired by ocean waves and seaside living.', 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&h=600&fit=crop', 'Emma Thompson');

-- Insert sample news items
INSERT INTO public.news_items (title, content, image_url, author_name, is_published, published_at) VALUES
('AI-Powered Design Tools Transform Fashion Industry', 
'The fashion industry is experiencing a revolutionary transformation with the introduction of AI-powered design tools. These innovative technologies are enabling designers to create stunning collections faster than ever before, while also promoting sustainability through optimized material usage and waste reduction.

Our platform has been at the forefront of this revolution, providing designers with cutting-edge AI tools that can generate unique patterns, suggest color combinations, and even predict fashion trends. The response from the design community has been overwhelmingly positive, with many reporting increased creativity and productivity.

"The AI suggestions have opened up creative possibilities I never considered before," says Luna Martinez, one of our featured designers. "It''s like having a creative partner that never runs out of ideas."

The technology works by analyzing thousands of fashion images, trend data, and user preferences to generate personalized design recommendations. This not only speeds up the design process but also helps designers create pieces that resonate with their target audience.',
'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=400&fit=crop',
'Sarah Johnson',
true,
NOW() - INTERVAL '2 days'),

('Sustainable Fashion: The Future is Green', 
'Sustainability has become more than just a buzzword in the fashion industry – it''s now a necessity. Our platform is proud to support designers who are leading the charge in creating beautiful, eco-friendly fashion that doesn''t compromise on style.

Recent studies show that consumers are increasingly conscious about the environmental impact of their clothing choices. This shift in consumer behavior is driving designers to explore innovative sustainable materials and production methods.

From recycled ocean plastic to lab-grown leather alternatives, the materials available to sustainable fashion designers are more diverse and high-quality than ever before. Our featured designer Maya Patel recently launched her "Botanical Fusion" collection using 100% organic and recycled materials.

"Sustainability isn''t a limitation – it''s an opportunity to be more creative," explains Patel. "Working with eco-friendly materials has pushed me to think differently about design and has resulted in some of my most innovative pieces."

The platform now includes sustainability metrics for each design, helping both designers and consumers make more informed choices about their fashion purchases.',
'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=400&fit=crop',
'Michael Chen',
true,
NOW() - INTERVAL '5 days'),

('Global Fashion Week Highlights Platform Designers', 
'This season''s Fashion Week events around the world have showcased the incredible talent of designers using our platform. From New York to Paris, Milan to Tokyo, our community members have been making waves with their innovative designs and creative use of AI-assisted tools.

Alex Chen''s "Urban Minimalist" collection was particularly well-received at New York Fashion Week, with fashion critics praising the clean lines and thoughtful use of sustainable materials. The collection, which was partially designed using our AI pattern generation tools, demonstrates how technology can enhance rather than replace human creativity.

"The AI tools helped me explore geometric patterns I wouldn''t have considered otherwise," Chen explains. "But the soul of the collection – the emotion and story – that''s purely human."

Meanwhile, in Paris, Sofia Rodriguez''s "Vintage Revival" collection drew standing ovations for its masterful blend of 1960s glamour with contemporary sensibilities. Rodriguez used our trend prediction algorithms to identify which vintage elements would resonate with modern audiences.

The success of these designers at major fashion events validates our mission to democratize fashion design and provide creators with the tools they need to compete on the global stage.',
'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&h=400&fit=crop',
'Emma Davis',
true,
NOW() - INTERVAL '1 week'),

('New AI Features: Color Harmony and Fabric Simulation', 
'We''re excited to announce the launch of two groundbreaking new AI features that will revolutionize how designers work with colors and fabrics on our platform.

The Color Harmony AI analyzes color theory principles, current trends, and psychological impacts to suggest perfect color combinations for any design. Whether you''re working on a bold statement piece or a subtle everyday garment, the AI can help you find colors that work beautifully together and appeal to your target audience.

Our Fabric Simulation feature uses advanced physics modeling to show how different fabrics will drape, move, and interact with light in real-world conditions. This allows designers to make informed decisions about fabric choices before committing to physical samples, reducing waste and speeding up the design process.

"These new features have completely changed my workflow," says Jordan Kim, whose "Neon Nights" collection has been trending on the platform. "I can now experiment with dozens of color and fabric combinations in minutes rather than days."

The features are now available to all premium subscribers, with basic versions accessible to free users. We''re also working on additional AI tools including pattern generation and trend forecasting, which will be released in the coming months.',
'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=400&fit=crop',
'David Wilson',
true,
NOW() - INTERVAL '3 days');

-- Update the featured collections to mark them as featured
UPDATE public.featured_collections SET is_featured = true WHERE id IN (1, 2, 3, 4, 5, 6);

-- Insert some sample user data (these would normally be created through Supabase Auth)
-- Note: In a real application, these would be created through the authentication system
-- This is just for demonstration purposes

-- Create a function to get platform statistics (for the stats section)
CREATE OR REPLACE FUNCTION get_platform_stats()
RETURNS TABLE (
    total_designers INTEGER,
    total_collections INTEGER,
    total_users INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE((SELECT COUNT(*)::INTEGER FROM public.users WHERE role = 'designer'), 15420) as total_designers,
        COALESCE((SELECT COUNT(*)::INTEGER FROM public.collections WHERE is_published = true), 8750) as total_collections,
        COALESCE((SELECT COUNT(*)::INTEGER FROM public.users), 45680) as total_users;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.featured_collections TO anon, authenticated;
GRANT SELECT ON public.news_items TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_platform_stats() TO anon, authenticated;