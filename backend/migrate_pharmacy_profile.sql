-- Migration script to add profile_image column to pharmacies table
-- Run this in your Supabase SQL editor

-- Add profile_image column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'pharmacies' AND column_name = 'profile_image') THEN
        ALTER TABLE pharmacies ADD COLUMN profile_image TEXT;
    END IF;
END $$;

-- Add description column if it doesn't exist  
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'pharmacies' AND column_name = 'description') THEN
        ALTER TABLE pharmacies ADD COLUMN description TEXT;
    END IF;
END $$;

-- Add address column if it doesn't exist (separate from location for better structure)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'pharmacies' AND column_name = 'address') THEN
        ALTER TABLE pharmacies ADD COLUMN address TEXT;
    END IF;
END $$;

-- Update the demo pharmacy with sample profile image URL
UPDATE pharmacies 
SET profile_image = 'https://via.placeholder.com/150/0066cc/ffffff?text=DP',
    description = 'Your trusted neighborhood pharmacy providing quality healthcare services.',
    address = '123 Main Street, Colombo 07, Sri Lanka'
WHERE id = 'demo-pharmacy-id';

-- Verify the table structure
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'pharmacies' 
ORDER BY ordinal_position;
