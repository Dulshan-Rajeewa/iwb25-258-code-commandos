const API_BASE_URL = 'http://localhost:9090/api/v1';

// Type definitions
interface Medicine {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  stockQuantity: number;
  pharmacyId: string;
  pharmacyName: string;
  location: string;
  imageUrl: string;
  isAvailable: boolean;
}

interface Pharmacy {
  id: string;
  name: string;
  email: string;
  phone: string;
  license: string;
  address: string;
  city: string;
  province: string;
  country: string;
  latitude: number;
  longitude: number;
  imageUrl: string;
  isVerified: boolean;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
  license?: string;
  address?: string;
  city?: string;
  province?: string;
  country?: string;
}

interface PharmacyUpdateData {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  country: string;
  imageUrl?: string;
  description?: string;
}

interface AuthResponse {
  token: string;
  userId: string;
  userType: string;
  message: string;
  success: boolean;
}

interface SearchResponse {
  medicines: Medicine[];
  totalCount: number;
  message: string;
}

export const api = {
  // Health check
  health: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  },

  // Search medicines
  searchMedicines: async (medicineName: string, location: string): Promise<SearchResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ medicineName, location })
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Search failed:', error);
      throw error;
    }
  },

  // Get all medicines
  getMedicines: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/medicines`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Get medicines failed:', error);
      throw error;
    }
  },

  // Generic auth login (works for both pharmacy and user)
  authLogin: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Auth login failed:', error);
      throw error;
    }
  },

  // Pharmacy authentication
  pharmacyLogin: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/pharmacyLogin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Pharmacy login failed:', error);
      throw error;
    }
  },

  pharmacyRegister: async (data: RegisterData): Promise<AuthResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/pharmacyRegister`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Pharmacy registration failed:', error);
      throw error;
    }
  },

  // User authentication
  userLogin: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/userLogin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('User login failed:', error);
      throw error;
    }
  },

  userRegister: async (data: RegisterData): Promise<AuthResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/userRegister`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('User registration failed:', error);
      throw error;
    }
  },

  // Medicine management (for pharmacies)
  addMedicine: async (medicine: Omit<Medicine, 'id' | 'isAvailable'>, token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/medicines`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(medicine)
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Add medicine failed:', error);
      throw error;
    }
  },

  updateMedicine: async (id: string, medicine: Omit<Medicine, 'id'>, token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/medicines/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(medicine)
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Update medicine failed:', error);
      throw error;
    }
  },

  deleteMedicine: async (id: string, token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/medicines/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Delete medicine failed:', error);
      throw error;
    }
  },

  // Get pharmacies
  getPharmacies: () => fetch(`${API_BASE_URL}/pharmacies`).then(res => res.json()),

  // Get pharmacy medicines
  getPharmacyMedicines: (pharmacyId: string) =>
    fetch(`${API_BASE_URL}/pharmacyMedicines?id=${pharmacyId}`).then(res => res.json()),

  // Get current pharmacy info (authenticated)
  getPharmacyInfo: async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/pharmacyInfo`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Get pharmacy info failed:', error);
      throw error;
    }
  },

  // Update current pharmacy info (authenticated)
  updatePharmacyInfo: async (pharmacyData: PharmacyUpdateData, token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/pharmacyInfo`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(pharmacyData)
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Update pharmacy info failed:', error);
      throw error;
    }
  },

  // Logout
  logout: (token: string) =>
    fetch(`${API_BASE_URL}/logout`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(res => res.json())
}; 