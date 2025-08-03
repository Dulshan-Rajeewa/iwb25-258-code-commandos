# Frontend Integration Guide

This guide explains how to integrate your React frontend with the Ballerina backend.

## Backend URL

The Ballerina backend runs on: `http://localhost:9090`

## API Base URL

All API endpoints are prefixed with: `/api/v1`

## Frontend Integration Steps

### 1. Update Frontend API Configuration

Create a new file `src/lib/api.ts` in your frontend:

```typescript
const API_BASE_URL = 'http://localhost:9090/api/v1';

export const api = {
  // Health check
  health: () => fetch(`${API_BASE_URL}/health`).then(res => res.json()),

  // Search medicines
  searchMedicines: (medicineName: string, location: string) => 
    fetch(`${API_BASE_URL}/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ medicineName, location })
    }).then(res => res.json()),

  // Get all medicines
  getMedicines: () => fetch(`${API_BASE_URL}/medicines`).then(res => res.json()),

  // Pharmacy authentication
  pharmacyLogin: (email: string, password: string) =>
    fetch(`${API_BASE_URL}/auth/pharmacy/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    }).then(res => res.json()),

  pharmacyRegister: (data: any) =>
    fetch(`${API_BASE_URL}/auth/pharmacy/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(res => res.json()),

  // User authentication
  userLogin: (email: string, password: string) =>
    fetch(`${API_BASE_URL}/auth/user/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    }).then(res => res.json()),

  userRegister: (data: any) =>
    fetch(`${API_BASE_URL}/auth/user/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(res => res.json()),

  // Medicine management (for pharmacies)
  addMedicine: (medicine: any, token: string) =>
    fetch(`${API_BASE_URL}/medicines`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(medicine)
    }).then(res => res.json()),

  updateMedicine: (id: string, medicine: any, token: string) =>
    fetch(`${API_BASE_URL}/medicines/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(medicine)
    }).then(res => res.json()),

  deleteMedicine: (id: string, token: string) =>
    fetch(`${API_BASE_URL}/medicines/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(res => res.json()),

  // Get pharmacies
  getPharmacies: () => fetch(`${API_BASE_URL}/pharmacies`).then(res => res.json()),

  // Get pharmacy medicines
  getPharmacyMedicines: (pharmacyId: string) =>
    fetch(`${API_BASE_URL}/pharmacies/${pharmacyId}/medicines`).then(res => res.json()),

  // Logout
  logout: (token: string) =>
    fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(res => res.json())
};
```

### 2. Update SearchSection Component

Modify your `SearchSection.tsx` to use the API:

```typescript
import { useState } from "react";
import { api } from "@/lib/api";

// ... existing imports ...

export const SearchSection = ({ onSearch }: SearchSectionProps) => {
  const [medicine, setMedicine] = useState("");
  const [loading, setLoading] = useState(false);
  // ... existing state ...

  const handleSearch = async () => {
    if (!medicine.trim()) return;
    
    setLoading(true);
    try {
      const location = useAutoLocation 
        ? "Auto-detected location" 
        : `${city}, ${province}, ${country}`;
      
      const response = await api.searchMedicines(medicine, location);
      
      if (response.medicines) {
        onSearch(medicine, location);
        // You can also pass the results to a parent component
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // ... rest of component ...
};
```

### 3. Update PharmacyAuth Component

Modify your `PharmacyAuth.tsx` to use the API:

```typescript
import { useState } from "react";
import { api } from "@/lib/api";

// ... existing imports ...

export const PharmacyAuth = ({ onClose, onLogin }: PharmacyAuthProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // ... existing state ...

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const response = await api.pharmacyLogin(loginData.email, loginData.password);
      
      if (response.success) {
        // Store token in localStorage or state management
        localStorage.setItem('token', response.token);
        localStorage.setItem('userType', response.userType);
        localStorage.setItem('userId', response.userId);
        onLogin();
      } else {
        setError(response.message || 'Login failed');
      }
    } catch (error) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const response = await api.pharmacyRegister(registerData);
      
      if (response.success) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('userType', response.userType);
        localStorage.setItem('userId', response.userId);
        onLogin();
      } else {
        setError(response.message || 'Registration failed');
      }
    } catch (error) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ... rest of component with loading states and error display ...
};
```

### 4. Update PharmacyDashboard Component

Modify your `PharmacyDashboard.tsx` to use the API:

```typescript
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

// ... existing imports ...

export const PharmacyDashboard = ({ onLogout }: PharmacyDashboardProps) => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    loadPharmacyMedicines();
  }, []);

  const loadPharmacyMedicines = async () => {
    try {
      const response = await api.getPharmacyMedicines(userId);
      setMedicines(response.medicines || []);
    } catch (error) {
      setError('Failed to load medicines');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMedicine = async (medicineData: any) => {
    try {
      await api.addMedicine(medicineData, token);
      loadPharmacyMedicines(); // Reload the list
    } catch (error) {
      setError('Failed to add medicine');
    }
  };

  const handleUpdateMedicine = async (id: string, medicineData: any) => {
    try {
      await api.updateMedicine(id, medicineData, token);
      loadPharmacyMedicines(); // Reload the list
    } catch (error) {
      setError('Failed to update medicine');
    }
  };

  const handleDeleteMedicine = async (id: string) => {
    try {
      await api.deleteMedicine(id, token);
      loadPharmacyMedicines(); // Reload the list
    } catch (error) {
      setError('Failed to delete medicine');
    }
  };

  const handleLogout = async () => {
    try {
      await api.logout(token);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('userType');
      localStorage.removeItem('userId');
      onLogout();
    }
  };

  // ... rest of component with medicines display and management UI ...
};
```

### 5. Update SearchResults Component

Modify your `SearchResults.tsx` to use the API:

```typescript
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

// ... existing imports ...

export const SearchResults = ({ medicine, location }: SearchResultsProps) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (medicine && location) {
      searchMedicines();
    }
  }, [medicine, location]);

  const searchMedicines = async () => {
    setLoading(true);
    setError("");
    
    try {
      const response = await api.searchMedicines(medicine, location);
      setResults(response.medicines || []);
    } catch (error) {
      setError('Failed to search medicines');
    } finally {
      setLoading(false);
    }
  };

  // ... rest of component with results display ...
};
```

## CORS Configuration

If you encounter CORS issues, you may need to add CORS headers to your Ballerina backend. Add this to your `main.bal`:

```ballerina
@http:ServiceConfig {
    basePath: "/api/v1",
    cors: {
        allowOrigins: ["http://localhost:5173", "http://localhost:3000"],
        allowCredentials: true,
        allowHeaders: ["Content-Type", "Authorization"],
        allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    }
}
```

## Testing the Integration

1. Start the Ballerina backend: `bal run`
2. Start your React frontend: `npm run dev`
3. Test the search functionality
4. Test pharmacy login/registration
5. Test medicine management features

## Error Handling

Always implement proper error handling in your frontend components:

```typescript
try {
  const response = await api.someEndpoint();
  // Handle success
} catch (error) {
  console.error('API Error:', error);
  // Show user-friendly error message
}
```

## Security Considerations

1. Store tokens securely (consider using httpOnly cookies)
2. Implement token refresh logic
3. Add input validation
4. Implement proper error handling
5. Use HTTPS in production 