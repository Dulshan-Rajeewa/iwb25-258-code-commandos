// Test script to verify location-based search API
const http = require('http');

const postData = JSON.stringify({
  medicineName: "Paracetamol",
  city: "Sri Jayawardenepura Kotte",
  state: "Colombo District", 
  country: "Sri Lanka",
  location: "Sri Jayawardenepura Kotte, Colombo District, Sri Lanka"
});

const options = {
  hostname: 'localhost',
  port: 9090,
  path: '/api/v1/search/location',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('🧪 Testing location search API...');
console.log('📦 Request payload:', postData);

const req = http.request(options, (res) => {
  console.log('📊 Response status:', res.statusCode);
  console.log('📊 Response headers:', res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log('✅ API Response:', JSON.stringify(response, null, 2));
      console.log('🔍 Medicines count:', response.totalCount);
      console.log('💊 Medicines array length:', response.medicines ? response.medicines.length : 'No medicines array');
    } catch (e) {
      console.log('📄 Raw response:', data);
    }
  });
});

req.on('error', (e) => {
  console.error('💥 Request error:', e);
});

req.write(postData);
req.end();
