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

The application runs on port 9090 by default. You can modify the port in the `main.bal` file.

## Security Notes

- This is a development version with in-memory storage
- JWT tokens are simplified for demonstration
- In production, implement proper password hashing and database storage
- Use environment variables for sensitive data

## Next Steps

1. Integrate with a real database (MySQL, PostgreSQL)
2. Implement proper JWT authentication
3. Add password hashing
4. Add input validation
5. Implement rate limiting
6. Add logging and monitoring
7. Add unit tests
8. Implement CORS for frontend integration

## License

Apache License 2.0 