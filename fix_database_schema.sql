-- Fix Database Schema for Medicine Images
-- Run these queries in your Supabase SQL editor

-- 1. Check if image_url column exists in medicines table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'medicines' AND table_schema = 'public';

-- 2. Add image_url column if it doesn't exist
ALTER TABLE public.medicines 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 3. Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'medicines' AND table_schema = 'public';

-- 4. Create index for better performance on image_url searches
CREATE INDEX IF NOT EXISTS idx_medicines_image_url ON public.medicines(image_url);

-- 5. Update existing medicines with placeholder images (optional)
-- UPDATE public.medicines SET image_url = 'https://via.placeholder.com/300x200?text=Medicine' WHERE image_url IS NULL;

-- 6. Check table structure
\d public.medicines

-- 7. Test query to ensure medicines table is accessible
SELECT id, name, image_url FROM public.medicines LIMIT 5;

-- 8. If you need to add more columns that might be missing:
ALTER TABLE public.medicines 
ADD COLUMN IF NOT EXISTS manufacturer TEXT,
ADD COLUMN IF NOT EXISTS expiry_date TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'available';

-- 9. Verify all columns exist
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'medicines' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 10. Check if there are any constraint issues
SELECT conname, contype, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'public.medicines'::regclass;

-- Note: Run these queries one by one in your Supabase SQL editor
-- If you get any errors, the specific error message will help identify the issue
