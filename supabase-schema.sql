-- ==========================================================================
-- GMSA HTU Database Setup Script for Supabase Postgres Database
-- ==========================================================================

-- 1. Create Students Table with Unique Index Number Constraint
CREATE TABLE IF NOT EXISTS public.students (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    full_name TEXT NOT NULL,
    index_number TEXT NOT NULL UNIQUE,
    programme_level TEXT NOT NULL CHECK (programme_level IN ('BTech', 'HND', 'Others')),
    programme TEXT NOT NULL,
    contact TEXT NOT NULL,
    hostel TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Index on index_number for fast lookup & case-insensitive uniqueness
CREATE UNIQUE INDEX IF NOT EXISTS idx_students_index_number 
ON public.students (LOWER(index_number));

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- 4. Create Public Policies (Allows students to insert & admins to read/delete)
CREATE POLICY "Allow public insert students" 
ON public.students FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public select students" 
ON public.students FOR SELECT 
USING (true);

CREATE POLICY "Allow admin delete students" 
ON public.students FOR DELETE 
USING (true);

-- 5. Create Slideshow Images Storage & Meta Table
CREATE TABLE IF NOT EXISTS public.slideshow (
    id SERIAL PRIMARY KEY,
    image_url TEXT NOT NULL,
    title TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Create Settings Table for Custom Logos & App Config
CREATE TABLE IF NOT EXISTS public.settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Enable Row Level Security & Add Policies for Slideshow & Settings
ALTER TABLE public.slideshow ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select slideshow" ON public.slideshow FOR SELECT USING (true);
CREATE POLICY "Allow public all slideshow" ON public.slideshow FOR ALL USING (true);

CREATE POLICY "Allow public select settings" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Allow public all settings" ON public.settings FOR ALL USING (true);

-- Pre-seed default slides
INSERT INTO public.slideshow (image_url, title) VALUES
('/public/slide1.jpg', 'Welcome to GMSA HTU'),
('/public/slide2.jpg', 'Annual GMSA Orientation'),
('/public/slide3.jpg', 'Weekly Da\'wah & Quranic Circles'),
('/public/slide4.jpg', 'Community Service & Outreach'),
('/public/slide5.jpg', 'Unity is Strength')
ON CONFLICT DO NOTHING;

