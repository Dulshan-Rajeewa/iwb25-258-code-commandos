-- Database Updates for Medicine Images
-- Run these queries in your Supabase SQL editor to add image support

-- 1. Add image_url column to existing medicines table
ALTER TABLE medicines ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 2. Create index for better performance on image_url searches
CREATE INDEX IF NOT EXISTS idx_medicines_image_url ON medicines(image_url);

-- 3. Update existing medicines with placeholder images (optional)
-- UPDATE medicines SET image_url = 'https://via.placeholder.com/300x200?text=Medicine' WHERE image_url IS NULL;

-- 4. Add constraint to ensure image_url is a valid URL (optional)
-- ALTER TABLE medicines ADD CONSTRAINT check_image_url CHECK (image_url ~ '^https?://.*');

-- 5. Create a view for medicines with images (optional)
CREATE OR REPLACE VIEW medicines_with_images AS
SELECT 
    m.*,
    p.name as pharmacy_name,
    p.phone as pharmacy_phone,
    p.address as pharmacy_address,
    p.license_number
FROM medicines m
JOIN pharmacies p ON m.pharmacy_id = p.id
WHERE m.image_url IS NOT NULL;

-- 6. Grant permissions (if using RLS)
-- ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Users can view medicines" ON medicines FOR SELECT USING (true);
-- CREATE POLICY "Pharmacies can manage their medicines" ON medicines FOR ALL USING (pharmacy_id = auth.uid());

-- Note: Run these queries in your Supabase SQL editor
-- The ALTER TABLE command will add the image_url column to existing tables
-- The index will improve performance for image-related queries
-- The view provides a convenient way to query medicines with pharmacy information
