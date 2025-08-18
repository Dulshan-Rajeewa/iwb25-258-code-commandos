const API_BASE_URL = 'http://localhost:9090/api/v1';

// Login interface
export interface LoginData {
  email: string;
  password: string;
}

// Registration interface
export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
  address?: string;
  license_number?: string;
  license?: string;
  city?: string;
  province?: string;
  country?: string;
}

// Medicine interface
export interface Medicine {
  id: string;
  name: string;
  price: number;
  description: string;
  pharmacy_id?: string;
  category?: string;
  stock?: number; // Backend field
  stockQuantity?: number; // Frontend compatibility
  status?: string; // Backend status field
  manufacturer?: string;
  expiry_date?: string;
  pharmacyId?: string;
  pharmacyName?: string;
  address?: string; // Changed from location to address
  imageUrl?: string;
  isAvailable?: boolean;
  pharmacies?: {
    name: string;
    phone: string;
    email: string;
    address: string; // Changed from location to address
    license_number: string;
  };
}

// Search interface
export interface MedicineSearchResult {
  id: string;
  name: string;
  price: number;
  description: string;
  pharmacy_name: string;
  pharmacy_phone: string;
  pharmacy_address: string; // Changed from location to address
  pharmacy_id: string;
}

// Pharmacy info interface
export interface PharmacyInfo {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string; // Changed from location to address
  license_number: string;
  profile_image?: string;
}

// Pharmacy interface
export interface Pharmacy {
  id: string;
  name: string;
  email: string;
  phone: string;
  license: string;
  address: string; // Changed from location to address
  city: string;
  province: string;
  country: string;
  latitude: number;
  longitude: number;
  imageUrl: string;
  isVerified: boolean;
}

// Pharmacy update interface
export interface PharmacyUpdateData {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  license_number?: string;
  profile_image?: string;
  description?: string;
}

// Pharmacy settings interface
export interface PharmacySettings {
  id?: string;
  pharmacy_id: string;
  email_notifications: boolean;
  sms_notifications: boolean;
  opening_time: string;
  closing_time: string;
  notification_preferences?: Record<string, boolean>;
  business_hours?: Record<string, string>;
}

export interface SettingsUpdateData {
  email_notifications?: boolean;
  sms_notifications?: boolean;
  opening_time?: string;
  closing_time?: string;
  notification_preferences?: Record<string, boolean>;
  business_hours?: Record<string, string>;
}

// Analytics interface
export interface AnalyticsData {
  totalMedicines: number;
  lowStock?: number;
  outOfStock?: number;
  lowStockItems?: number;
  outOfStockItems?: number;
  categories?: {
    category: string;
    count: number;
  }[];
  categoryBreakdown?: { category: string; count: number; }[];
  statusBreakdown?: { status: string; count: number; }[];
  totalInventoryValue: number;
  recentlyAdded?: number;
  timestamp?: string;
}

// Medicine data interface for updates
export interface MedicineData {
  id?: string;
  name?: string;
  price?: number;
  description?: string;
  category?: string;
  stock?: number;
  status?: string;
  expiry_date?: string;
  manufacturer?: string;
}

// Auth response interface
export interface AuthResponse {
  token: string;
  userId: string;
  userType: string;
  message: string;
  success: boolean;
}

// Search response interface
export interface SearchResponse {
  medicines: Medicine[];
  totalCount: number;
  message: string;
}

// API object
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
  getMedicines: async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/medicines`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      
      // Normalize the medicines data to ensure consistent field names
      if (data.medicines && Array.isArray(data.medicines)) {
        data.medicines = data.medicines.map((medicine: Medicine & { stock?: number }) => ({
          ...medicine,
          stockQuantity: medicine.stock || medicine.stockQuantity || 0,
          status: medicine.status || 'available',
          category: medicine.category || 'General'
        }));
      }
      
      return data;
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
      const requestData = {
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone || "",
        licenseNumber: data.license || "",
        address: data.address || ""
      };

      const response = await fetch(`${API_BASE_URL}/pharmacyRegister`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 409) {
          throw new Error('A pharmacy with this email already exists. Please use a different email or try logging in.');
        }
        throw new Error(result.message || `HTTP ${response.status}`);
      }
      
      return result;
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
      // Transform frontend Medicine interface to backend expected format
      const backendMedicineData = {
        name: medicine.name,
        description: medicine.description,
        category: medicine.category,
        price: medicine.price,
        stock: medicine.stockQuantity, // Transform stockQuantity to stock
        status: "available"
      };

      const response = await fetch(`${API_BASE_URL}/medicines`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(backendMedicineData)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
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
      // Transform frontend field names to backend expected format
      const backendPharmacyData: Record<string, string> = {};
      
      if (pharmacyData.name) backendPharmacyData.name = pharmacyData.name;
      if (pharmacyData.email) backendPharmacyData.email = pharmacyData.email;  
      if (pharmacyData.phone) backendPharmacyData.phone = pharmacyData.phone;
      if (pharmacyData.address) backendPharmacyData.address = pharmacyData.address;
      if (pharmacyData.license_number) backendPharmacyData.license_number = pharmacyData.license_number;
      if (pharmacyData.profile_image) backendPharmacyData.profile_image = pharmacyData.profile_image;
      if (pharmacyData.description) backendPharmacyData.description = pharmacyData.description;

      const response = await fetch(`${API_BASE_URL}/pharmacyInfo`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(backendPharmacyData)
      });
      
      // Handle different error types with specific messages
      if (!response.ok) {
        if (response.status === 0) {
          throw new Error('Unable to connect to server. Please check if the backend is running.');
        }
        
        if (response.status === 401) {
          throw new Error('Your session has expired. Please log in again.');
        }
        
        if (response.status === 403) {
          throw new Error('You do not have permission to update this pharmacy information.');
        }
        
        if (response.status === 500) {
          // Try to get the actual error message from backend
          try {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Server error occurred while updating pharmacy information.');
          } catch {
            throw new Error('Server error occurred. Please try again later.');
          }
        }
        
        if (response.status === 404) {
          throw new Error('Pharmacy not found. Please contact support.');
        }
        
        // For any other HTTP error
        try {
          const errorData = await response.json();
          throw new Error(errorData.message || `Update failed with status ${response.status}`);
        } catch {
          throw new Error(`Network error occurred (Status: ${response.status})`);
        }
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Update pharmacy info failed:', error);
      
      // Re-throw with preserved error message for better UX
      if (error instanceof Error) {
        throw error; // Preserve the specific error message
      }
      
      // Fallback for unknown errors
      throw new Error('An unexpected error occurred while updating pharmacy information.');
    }
  },

  // Upload profile image (authenticated)
  uploadProfileImage: async (imageUrl: string, token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/uploadProfileImage`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ profile_image: imageUrl })
      });
      
      if (!response.ok) {
        if (response.status === 0) {
          throw new Error('Unable to connect to server. Please check if the backend is running.');
        }
        
        if (response.status === 401) {
          throw new Error('Your session has expired. Please log in again.');
        }
        
        if (response.status === 413) {
          throw new Error('Image file is too large. Please select a smaller image.');
        }
        
        if (response.status === 415) {
          throw new Error('Unsupported image format. Please use JPG, PNG, or GIF.');
        }
        
        if (response.status === 500) {
          try {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Server error occurred while uploading image.');
          } catch {
            throw new Error('Server error occurred. Please try again later.');
          }
        }
        
        // For any other HTTP error
        try {
          const errorData = await response.json();
          throw new Error(errorData.message || `Upload failed with status ${response.status}`);
        } catch {
          throw new Error(`Network error occurred while uploading image (Status: ${response.status})`);
        }
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Upload profile image failed:', error);
      
      // Re-throw with preserved error message
      if (error instanceof Error) {
        throw error;
      }
      
      throw new Error('An unexpected error occurred while uploading the image.');
    }
  },

  // Get analytics data (authenticated)
  getAnalytics: async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/analytics`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Get analytics failed:', error);
      throw error;
    }
  },

  // Get pharmacy settings (authenticated)
  getPharmacySettings: async (token: string): Promise<{ success: boolean; settings: PharmacySettings }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/pharmacySettings`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Get pharmacy settings failed:', error);
      throw error;
    }
  },

  // Update pharmacy settings (authenticated)
  updatePharmacySettings: async (token: string, settingsData: SettingsUpdateData): Promise<{ success: boolean; settings: PharmacySettings; message: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/pharmacySettings`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settingsData)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Update pharmacy settings failed:', error);
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