-- Pharmacy Settings Table
CREATE TABLE IF NOT EXISTS pharmacy_settings (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    pharmacy_id TEXT NOT NULL REFERENCES pharmacies(id) ON DELETE CASCADE,
    email_notifications BOOLEAN DEFAULT true,
    sms_notifications BOOLEAN DEFAULT false,
    opening_time TIME DEFAULT '09:00',
    closing_time TIME DEFAULT '21:00',
    notification_preferences JSONB DEFAULT '{}',
    business_hours JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one settings record per pharmacy
    UNIQUE(pharmacy_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_pharmacy_settings_pharmacy_id ON pharmacy_settings(pharmacy_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_pharmacy_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_pharmacy_settings_updated_at ON pharmacy_settings;
CREATE TRIGGER trigger_update_pharmacy_settings_updated_at
    BEFORE UPDATE ON pharmacy_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_pharmacy_settings_updated_at();

-- Insert some default settings for existing pharmacies (optional)
INSERT INTO pharmacy_settings (pharmacy_id, email_notifications, sms_notifications, opening_time, closing_time)
SELECT 
    id,
    true,
    false,
    '09:00'::TIME,
    '21:00'::TIME
FROM pharmacies 
WHERE id NOT IN (SELECT pharmacy_id FROM pharmacy_settings)
ON CONFLICT (pharmacy_id) DO NOTHING;
