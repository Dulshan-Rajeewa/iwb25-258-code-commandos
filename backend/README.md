# MediFind Backend

A Ballerina-based backend API for the MediFind medicine finder application.

## Features

- **Medicine Search**: Search for medicines by name and location
- **Pharmacy Management**: Register and manage pharmacy profiles
- **User Authentication**: Login and registration for users and pharmacies
- **Inventory Management**: Add, update, and delete medicines
- **Location-based Search**: Find medicines near specific locations

## Prerequisites

- Ballerina 2201.8.0 or later
- Java 11 or later

## Installation

1. Clone the repository
2. Navigate to the backend directory
3. Run the application

```bash
cd backend/medi_find_backend
bal run
```

## API Endpoints

### Health Check
- **GET** `/api/v1/health` - Check if the service is running

### Authentication
- **POST** `/api/v1/auth/pharmacy/login` - Pharmacy login
- **POST** `/api/v1/auth/pharmacy/register` - Pharmacy registration
- **POST** `/api/v1/auth/user/login` - User login
- **POST** `/api/v1/auth/user/register` - User registration
- **POST** `/api/v1/auth/logout` - Logout

### Medicines
- **GET** `/api/v1/medicines` - Get all medicines
- **POST** `/api/v1/medicines` - Add new medicine
- **PUT** `/api/v1/medicines/{id}` - Update medicine
- **DELETE** `/api/v1/medicines/{id}` - Delete medicine

### Search
- **POST** `/api/v1/search` - Search medicines by name and location

### Pharmacies
- **GET** `/api/v1/pharmacies` - Get all pharmacies
- **GET** `/api/v1/pharmacies/{id}` - Get pharmacy by ID
- **GET** `/api/v1/pharmacies/{id}/medicines` - Get medicines by pharmacy

## Sample Data

The application comes with sample data including:
- 2 sample pharmacies
- 3 sample medicines
- 1 sample user

## Request/Response Examples

### Search Medicines
```bash
curl -X POST http://localhost:9090/api/v1/search \
  -H "Content-Type: application/json" \
  -d '{
    "medicineName": "Paracetamol",
    "location": "New York"
  }'
```

### Pharmacy Login
```bash
curl -X POST http://localhost:9090/api/v1/auth/pharmacy/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "city@pharmacy.com",
    "password": "password123"
  }'
```

### Add Medicine
```bash
curl -X POST http://localhost:9090/api/v1/medicines \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Amoxicillin",
    "description": "Antibiotic medication",
    "category": "Antibiotics",
    "price": 12.99,
    "stockQuantity": 50,
    "pharmacyId": "pharm_001",
    "pharmacyName": "City Pharmacy",
    "location": "New York, NY",
    "imageUrl": "https://example.com/amoxicillin.jpg"
  }'
```

## Data Models

### Medicine
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "category": "string",
  "price": "decimal",
  "stockQuantity": "int",
  "pharmacyId": "string",
  "pharmacyName": "string",
  "location": "string",
  "imageUrl": "string",
  "isAvailable": "boolean"
}
```

### Pharmacy
```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "phone": "string",
  "license": "string",
  "address": "string",
  "city": "string",
  "province": "string",
  "country": "string",
  "latitude": "decimal",
  "longitude": "decimal",
  "imageUrl": "string",
  "isVerified": "boolean"
}
```

## Development

### Running in Development Mode
```bash
bal run --debug
```

### Building the Application
```bash
bal build
```

### Running Tests
```bash
bal test
```

## Configuration

The application runs on port 9090 by default. Database and external service credentials are read from `configurable` variables in `main.bal` and can be set via environment variables using Ballerina's configuration mechanism.

Important configurable names to set (examples shown as env vars for Windows `cmd.exe`):

```
set dbHost=your-supabase-host
set dbPort=5432
set dbName=postgres
set dbUsername=postgres
set dbPassword=yourpassword
set jwtSecret=your_jwt_secret
set googleClientId=...
set googleClientSecret=...
set googleRedirectUri=http://localhost:9090/api/v1/auth/google/callback
set pineconeApiKey=...
set pineconeEnvironment=...
set pineconeIndexName=...
```

## Security Notes

- This project now uses Postgres (Supabase) for persistent storage. Keep credentials secret and use environment variables in production.
- JWT secrets must be strong and rotated regularly.
- Implement production-grade password hashing (bcrypt/argon2) before storing passwords.

## Next Steps & Database Migration

1. Create the required tables in your Postgres/Supabase database. Example SQL:

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE,
  password_hash TEXT,
  google_id TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE pharmacies (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE,
  password_hash TEXT,
  phone TEXT,
  license TEXT,
  address TEXT,
  city TEXT,
  province TEXT,
  country TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  image_url TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE medicines (
  id TEXT PRIMARY KEY,
  name TEXT,
  description TEXT,
  price NUMERIC,
  stock_quantity INT,
  pharmacy_id TEXT REFERENCES pharmacies(id),
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  category_id TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE user_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  pharmacy_id TEXT,
  token_hash TEXT,
  user_type TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE oauth_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  provider TEXT,
  refresh_token TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

2. Start the backend with environment variables set (example above).
3. Configure Pinecone if you plan to use vector search and set `pineconeApiKey`, `pineconeEnvironment`, and `pineconeIndexName`.
4. Use the Google OAuth endpoints (`/api/v1/auth/google` and `/api/v1/auth/google/callback`) to enable Google sign-in.

## License

Apache License 2.0