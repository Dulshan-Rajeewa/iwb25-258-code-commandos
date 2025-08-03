@echo off
echo Testing MediFind Backend API...
echo.

echo 1. Testing Health Check...
curl -X GET http://localhost:9090/api/v1/health
echo.
echo.

echo 2. Testing Search Medicines...
curl -X POST http://localhost:9090/api/v1/search -H "Content-Type: application/json" -d "{\"medicineName\":\"Paracetamol\",\"location\":\"New York\"}"
echo.
echo.

echo 3. Testing Get All Medicines...
curl -X GET http://localhost:9090/api/v1/medicines
echo.
echo.

echo 4. Testing Pharmacy Login...
curl -X POST http://localhost:9090/api/v1/auth/pharmacy/login -H "Content-Type: application/json" -d "{\"email\":\"city@pharmacy.com\",\"password\":\"password123\"}"
echo.
echo.

echo 5. Testing Get All Pharmacies...
curl -X GET http://localhost:9090/api/v1/pharmacies
echo.
echo.

echo API Testing Complete!
pause 