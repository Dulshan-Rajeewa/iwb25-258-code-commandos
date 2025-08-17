-- Migration script to add missing columns to existing medicines table
-- Run this in your Supabase SQL editor to add the missing columns

-- Add category column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'medicines' AND column_name = 'category') THEN
        ALTER TABLE medicines ADD COLUMN category TEXT DEFAULT 'General';
    END IF;
END $$;

-- Add status column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'medicines' AND column_name = 'status') THEN
        ALTER TABLE medicines ADD COLUMN status TEXT DEFAULT 'available';
    END IF;
END $$;

-- Add manufacturer column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'medicines' AND column_name = 'manufacturer') THEN
        ALTER TABLE medicines ADD COLUMN manufacturer TEXT;
    END IF;
END $$;

-- Add expiry_date column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'medicines' AND column_name = 'expiry_date') THEN
        ALTER TABLE medicines ADD COLUMN expiry_date TEXT;
    END IF;
END $$;

-- Verify the table structure
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'medicines' 
ORDER BY ordinal_position;
