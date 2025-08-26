# Database Updates for Medicine Images

This document contains the SQL queries needed to update your existing Supabase database to support medicine images.

## Required Updates

### 1. Add image_url column to medicines table

Run this query in your Supabase SQL editor:

```sql
-- Add image_url column to existing medicines table
ALTER TABLE medicines ADD COLUMN IF NOT EXISTS image_url TEXT;
```

### 2. Create index for better performance

```sql
-- Create index for better performance on image_url searches
CREATE INDEX IF NOT EXISTS idx_medicines_image_url ON medicines(image_url);
```

### 3. Optional: Update existing medicines with placeholder images

```sql
-- Update existing medicines with placeholder images (optional)
UPDATE medicines 
SET image_url = 'https://via.placeholder.com/300x200?text=Medicine' 
WHERE image_url IS NULL;
```

### 4. Optional: Add URL validation constraint

```sql
-- Add constraint to ensure image_url is a valid URL (optional)
ALTER TABLE medicines 
ADD CONSTRAINT check_image_url 
CHECK (image_url ~ '^https?://.*');
```

### 5. Optional: Create a view for medicines with images

```sql
-- Create a view for medicines with images (optional)
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
```

## How to Apply Updates

1. **Open your Supabase dashboard**
2. **Go to the SQL Editor**
3. **Run the required queries in order:**
   - First run the ALTER TABLE command
   - Then run the CREATE INDEX command
   - Optionally run the other queries as needed

## What These Updates Do

- **`image_url` column**: Stores the URL or base64 data of medicine images
- **Index**: Improves performance when searching/filtering by image_url
- **Placeholder images**: Provides default images for existing medicines
- **URL validation**: Ensures image_url contains valid URLs (optional)
- **View**: Provides a convenient way to query medicines with pharmacy information

## Backend Integration

The backend has been updated to:
- Accept `imageUrl` field when creating/updating medicines
- Store the `image_url` in the database
- Return the `image_url` when fetching medicines
- Handle image uploads through the `/uploadMedicineImage` endpoint

## Frontend Integration

The frontend has been updated to:
- Display medicine images in the inventory table
- Show medicine images in search results
- Allow uploading images when adding/editing medicines
- Support both file uploads and URL inputs

## Testing

After applying the database updates:
1. Restart your backend server
2. Test adding a new medicine with an image
3. Test editing an existing medicine's image
4. Verify images appear in the inventory and search results

## Troubleshooting

If you encounter issues:
1. Check that the `image_url` column was added successfully
2. Verify the backend is running and can connect to Supabase
3. Check browser console for any JavaScript errors
4. Ensure your Supabase RLS policies allow the necessary operations
