# MediFind - Complete Setup Guide

This guide will help you set up the complete MediFind application with both the React frontend and Ballerina backend.

## 🏗️ Project Structure

```
medi-find-go-main/
├── src/                    # React Frontend
│   ├── components/
│   ├── pages/
│   ├── lib/
│   └── ...
├── backend/                # Ballerina Backend
│   └── medi_find_backend/
│       ├── main.bal
│       ├── Ballerina.toml
│       └── README.md
└── ...
```

## 🚀 Quick Start

### Step 1: Start the Backend

1. Navigate to the backend directory:
```bash
cd backend/medi_find_backend
```

2. Run the Ballerina backend:
```bash
bal run
```

You should see output like:
```
MediFind Backend started on port 9090
Sample data loaded successfully
```

### Step 2: Start the Frontend

1. Open a new terminal and navigate to the project root:
```bash
cd /path/to/medi-find-go-main
```

2. Install dependencies (if not already done):
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## 🔧 Backend Features

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/health` | Health check |
| POST | `/api/v1/search` | Search medicines |
| GET | `/api/v1/medicines` | Get all medicines |
| POST | `/api/v1/medicines` | Add medicine |
| PUT | `/api/v1/medicines/{id}` | Update medicine |
| DELETE | `/api/v1/medicines/{id}` | Delete medicine |
| POST | `/api/v1/auth/pharmacy/login` | Pharmacy login |
| POST | `/api/v1/auth/pharmacy/register` | Pharmacy registration |
| POST | `/api/v1/auth/user/login` | User login |
| POST | `/api/v1/auth/user/register` | User registration |
| GET | `/api/v1/pharmacies` | Get all pharmacies |
| GET | `/api/v1/pharmacies/{id}` | Get pharmacy by ID |

### Sample Data

The backend comes with pre-loaded sample data:

**Pharmacies:**
- City Pharmacy (New York)
- Health Plus Pharmacy (Los Angeles)

**Medicines:**
- Paracetamol (Pain Relief)
- Aspirin (Pain Relief)
- Ibuprofen (Pain Relief)

**Users:**
- John Doe (john@example.com)

## 🧪 Testing the API

### Using the Test Script

1. Navigate to the backend directory:
```bash
cd backend/medi_find_backend
```

2. Run the test script:
```bash
test_api.bat
```

### Manual Testing with curl

```bash
# Health check
curl http://localhost:9090/api/v1/health

# Search medicines
curl -X POST http://localhost:9090/api/v1/search \
  -H "Content-Type: application/json" \
  -d '{"medicineName":"Paracetamol","location":"New York"}'

# Pharmacy login
curl -X POST http://localhost:9090/api/v1/auth/pharmacy/login \
  -H "Content-Type: application/json" \
  -d '{"email":"city@pharmacy.com","password":"password123"}'

# Get all medicines
curl http://localhost:9090/api/v1/medicines
```

## 🔗 Frontend Integration

The frontend is already configured to connect to the backend through the `src/lib/api.ts` file.

### Key Features

1. **Medicine Search**: Users can search for medicines by name and location
2. **Pharmacy Portal**: Pharmacies can register, login, and manage their inventory
3. **User Authentication**: Separate login systems for users and pharmacies
4. **Real-time Updates**: Medicine availability updates in real-time

### Testing the Frontend

1. Open `http://localhost:5173` in your browser
2. Try searching for medicines like "Paracetamol" or "Aspirin"
3. Click "Pharmacy Portal" to test pharmacy authentication
4. Use the sample pharmacy credentials:
   - Email: `city@pharmacy.com`
   - Password: `password123`

## 🛠️ Development

### Backend Development

```bash
# Run with debug mode
bal run --debug

# Build the application
bal build

# Run tests
bal test
```

### Frontend Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint
```

## 🔒 Security Considerations

### Current Implementation (Development)
- In-memory storage
- Simple JWT tokens
- No password hashing
- No CORS restrictions

### Production Recommendations
1. **Database Integration**: Use MySQL, PostgreSQL, or MongoDB
2. **Password Hashing**: Implement bcrypt or similar
3. **Proper JWT**: Use a proper JWT library with expiration
4. **CORS Configuration**: Restrict origins in production
5. **Rate Limiting**: Implement API rate limiting
6. **Input Validation**: Add comprehensive validation
7. **HTTPS**: Use SSL/TLS in production
8. **Environment Variables**: Store sensitive data in env vars

## 🐛 Troubleshooting

### Backend Issues

1. **Port already in use**:
   ```bash
   # Check what's using port 9090
   netstat -ano | findstr :9090
   # Kill the process or change port in main.bal
   ```

2. **Ballerina not found**:
   ```bash
   # Check if Ballerina is installed
   bal --version
   # If not found, add to PATH or reinstall
   ```

3. **Compilation errors**:
   ```bash
   # Clean and rebuild
   bal clean
   bal build
   ```

### Frontend Issues

1. **API connection errors**:
   - Ensure backend is running on port 9090
   - Check CORS settings
   - Verify API_BASE_URL in `src/lib/api.ts`

2. **TypeScript errors**:
   ```bash
   npm run lint
   # Fix any linting issues
   ```

## 📚 Next Steps

### Immediate Improvements
1. Add more sample data
2. Implement proper error handling
3. Add loading states
4. Improve UI/UX

### Advanced Features
1. **Database Integration**: Replace in-memory storage
2. **Real-time Updates**: Implement WebSocket connections
3. **Image Upload**: Add medicine image upload
4. **Geolocation**: Implement location-based search
5. **Notifications**: Add email/SMS notifications
6. **Analytics**: Add usage analytics
7. **Mobile App**: Create React Native app

### Production Deployment
1. **Backend**: Deploy to cloud (AWS, Azure, GCP)
2. **Frontend**: Deploy to Vercel, Netlify, or similar
3. **Database**: Set up managed database service
4. **Monitoring**: Add logging and monitoring
5. **CI/CD**: Set up automated deployment

## 📞 Support

If you encounter any issues:

1. Check the console for error messages
2. Verify both frontend and backend are running
3. Test API endpoints manually
4. Check network connectivity
5. Review the logs for detailed error information

## 🎉 Congratulations!

You now have a complete medicine finder application with:
- ✅ React frontend with modern UI
- ✅ Ballerina backend with RESTful APIs
- ✅ User and pharmacy authentication
- ✅ Medicine search functionality
- ✅ Inventory management
- ✅ Sample data for testing

The application is ready for development and can be extended with additional features as needed! 