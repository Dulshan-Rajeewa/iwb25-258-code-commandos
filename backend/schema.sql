-- Create pharmacies table
CREATE TABLE IF NOT EXISTS pharmacies (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    location TEXT,
    phone TEXT,
    license_number TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create medicines table
CREATE TABLE IF NOT EXISTS medicines (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'General',
    pharmacy_id TEXT NOT NULL REFERENCES pharmacies(id),
    stock INTEGER DEFAULT 0,
    status TEXT DEFAULT 'available',
    manufacturer TEXT,
    expiry_date TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    pharmacy_id TEXT NOT NULL REFERENCES pharmacies(id),
    token_hash TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at BIGINT NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_medicines_pharmacy_id ON medicines(pharmacy_id);
CREATE INDEX IF NOT EXISTS idx_medicines_name ON medicines(name);
CREATE INDEX IF NOT EXISTS idx_sessions_token_hash ON sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_sessions_pharmacy_id ON sessions(pharmacy_id);
CREATE INDEX IF NOT EXISTS idx_pharmacies_email ON pharmacies(email);

-- Insert sample data
INSERT INTO pharmacies (id, name, email, password, location, phone, license_number, created_at) 
VALUES ('demo-pharmacy-id', 'Demo Pharmacy', 'demo@pharmacy.com', 'demo123', 'Colombo, Sri Lanka', '+94123456789', 'PH001', NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO medicines (id, name, price, description, pharmacy_id, stock, created_at) VALUES
('med-001', 'Paracetamol', 25.00, 'Pain relief and fever reducer', 'demo-pharmacy-id', 100, NOW()),
('med-002', 'Amoxicillin', 120.50, 'Antibiotic for bacterial infections', 'demo-pharmacy-id', 50, NOW()),
('med-003', 'Omeprazole', 85.00, 'Proton pump inhibitor for acid reflux', 'demo-pharmacy-id', 75, NOW()),
('med-004', 'Aspirin', 15.00, 'Pain reliever and anti-inflammatory', 'demo-pharmacy-id', 200, NOW()),
('med-005', 'Ibuprofen', 35.00, 'Non-steroidal anti-inflammatory drug', 'demo-pharmacy-id', 150, NOW())
ON CONFLICT (id) DO NOTHING;
