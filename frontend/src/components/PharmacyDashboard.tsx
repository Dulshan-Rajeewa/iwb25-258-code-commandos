import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Plus, Edit, Trash2, LogOut, MapPin, Loader2, Save, X, RefreshCw, Menu, Camera, User, Settings, BarChart3, Package } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface PharmacyDashboardProps {
  onLogout: () => void;
}

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
  status?: string;
}

export const PharmacyDashboard = ({ onLogout }: PharmacyDashboardProps) => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [medicineToDelete, setMedicineToDelete] = useState<Medicine | null>(null);
  const [activeView, setActiveView] = useState<'inventory' | 'profile' | 'analytics' | 'settings'>('inventory');
  const [settings, setSettings] = useState({
    email_notifications: true,
    sms_notifications: false,
    opening_time: "09:00",
    closing_time: "21:00"
  });
  const { toast } = useToast();
  const [newMedicine, setNewMedicine] = useState({
    name: "",
    description: "",
    stockQuantity: "",
    price: "",
    category: "",
    imageUrl: ""
  });

  const [pharmacyInfo, setPharmacyInfo] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    license_number: "",
    profile_image: "",
    description: ""
  });
  
  const [isProfileImageUploading, setIsProfileImageUploading] = useState(false);
  const [profileImagePreview, setProfileImagePreview] = useState("");
  const [isMedicineImageUploading, setIsMedicineImageUploading] = useState(false);
  const [medicineImagePreview, setMedicineImagePreview] = useState("");

  // Helper function to get safe values for editing medicine
  const getEditingMedicineValue = (field: keyof Medicine, defaultValue: string = "") => {
    if (!editingMedicine) return defaultValue;
    const value = editingMedicine[field];
    return value !== undefined && value !== null ? String(value) : defaultValue;
  };

  // Helper function to get numeric values for editing medicine
  const getEditingMedicineNumberValue = (field: keyof Medicine, defaultValue: number = 0) => {
    if (!editingMedicine) return defaultValue;
    const value = editingMedicine[field];
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? defaultValue : parsed;
    }
    return defaultValue;
  };

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const loadMedicines = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('No authentication token found');
        toast({
          title: "Authentication Error",
          description: "Please log in again to access your medicines.",
          variant: "destructive",
        });
        return;
      }
      const response = await api.getMedicines(token);
      if (response.medicines) {
        setMedicines(response.medicines);
        if (response.medicines.length === 0) {
          toast({
            title: "No Medicines Found",
            description: "Start by adding your first medicine to the inventory.",
          });
        }
      }
    } catch (error) {
      console.error('Failed to load medicines:', error);
      
      let errorMessage = 'Failed to load medicines. Please try again.';
      if (error instanceof Error) {
        if (error.message.includes('connect') || error.message.includes('fetch')) {
          errorMessage = 'Unable to connect to server. Please check your internet connection.';
        } else if (error.message.includes('401') || error.message.includes('unauthorized')) {
          errorMessage = 'Your session has expired. Please log in again.';
          localStorage.removeItem('authToken');
          localStorage.removeItem('userType');
        }
      }
      
      setError(errorMessage);
      toast({
        title: "Failed to Load Medicines",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const loadPharmacyInfo = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await api.getPharmacyInfo(token);
      if (response.success && response.pharmacy) {
        setPharmacyInfo({
          name: response.pharmacy.name || "",
          address: response.pharmacy.address || "", // Only use address field
          phone: response.pharmacy.phone || "",
          email: response.pharmacy.email || "",
          license_number: response.pharmacy.license_number || "",
          profile_image: response.pharmacy.profile_image || "",
          description: response.pharmacy.description || ""
        });
      }
    } catch (error) {
      console.error('Failed to load pharmacy info:', error);
      
      let errorMessage = 'Some pharmacy information may not be available.';
      if (error instanceof Error) {
        if (error.message.includes('connect') || error.message.includes('fetch')) {
          errorMessage = 'Unable to load pharmacy information. Please check your connection.';
        } else if (error.message.includes('401') || error.message.includes('unauthorized')) {
          errorMessage = 'Session expired. Please log in again to view pharmacy information.';
        }
      }
      
      // Only show toast for connection issues, not for minor info loading issues
      if (error instanceof Error && (error.message.includes('connect') || error.message.includes('401'))) {
        toast({
          title: "Failed to Load Pharmacy Info",
          description: errorMessage,
          variant: "destructive",
        });
      }
    }
  }, [toast]);

  useEffect(() => {
    loadMedicines();
    loadPharmacyInfo();
  }, [loadMedicines, loadPharmacyInfo]);

  const handleUpdatePharmacyInfo = async () => {
    try {
      setIsLoading(true);
      setError("");
      setSuccessMessage("");

      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Authentication required. Please log in again.');
        return;
      }

      // Validation
      if (!pharmacyInfo.name || !pharmacyInfo.email || !pharmacyInfo.phone || !pharmacyInfo.address) {
        setError('Please fill in all required fields (Name, Email, Phone, Address)');
        return;
      }

      const response = await api.updatePharmacyInfo(pharmacyInfo, token);
      
      if (response.success) {
        setSuccessMessage('Pharmacy information updated successfully!');
        toast({
          title: "Profile Updated",
          description: "Your pharmacy information has been saved successfully.",
        });
        // Always reload the latest profile info from backend to avoid empty form bug
        setTimeout(() => {
          loadPharmacyInfo();
        }, 200);
        setTimeout(() => {
          setSuccessMessage("");
        }, 3000);
      } else {
        const errorMessage = response.message || "Failed to update pharmacy information";
        setError(errorMessage);
        toast({
          title: "Update Failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Update pharmacy info error:', error);
      
      // Extract meaningful error message
      let errorMessage = 'An unexpected error occurred while updating pharmacy information.';
      
      if (error instanceof Error) {
        if (error.message.includes('connect') || error.message.includes('fetch')) {
          errorMessage = 'Unable to connect to server. Please check your internet connection and try again.';
        } else if (error.message.includes('session') || error.message.includes('expired')) {
          errorMessage = 'Your session has expired. Please log in again.';
          // Optionally redirect to login
          localStorage.removeItem('authToken');
          localStorage.removeItem('userType');
        } else if (error.message.includes('permission')) {
          errorMessage = 'You do not have permission to perform this action.';
        } else if (error.message) {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
      toast({
        title: "Update Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsProfileImageUploading(true);

      // Basic validation
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File",
          description: "Please select a valid image file.",
          variant: "destructive",
        });
        return;
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File Too Large",
          description: "Please select an image smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }

      // Convert to base64 for demo purposes
      // In production, you'd upload to a proper image hosting service
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageUrl = e.target?.result as string;
        setProfileImagePreview(imageUrl);
        
        try {
          const token = localStorage.getItem('authToken');
          if (!token) throw new Error('No authentication token');

          // Upload the profile image
          const response = await api.uploadProfileImage(imageUrl, token);
          
          if (response.success) {
            setPharmacyInfo(prev => ({ ...prev, profile_image: imageUrl }));
            toast({
              title: "Success",
              description: "Profile image updated successfully!",
            });
          } else {
            throw new Error(response.message || 'Upload failed');
          }
        } catch (error) {
          console.error('Profile image upload error:', error);
          
          // Extract meaningful error message for image upload
          let errorMessage = 'Failed to upload profile image. Please try again.';
          
          if (error instanceof Error) {
            if (error.message.includes('connect') || error.message.includes('fetch')) {
              errorMessage = 'Unable to connect to server. Please check your internet connection.';
            } else if (error.message.includes('session') || error.message.includes('expired')) {
              errorMessage = 'Your session has expired. Please log in again.';
              localStorage.removeItem('authToken');
              localStorage.removeItem('userType');
            } else if (error.message.includes('large') || error.message.includes('size')) {
              errorMessage = 'Image file is too large. Please select a smaller image.';
            } else if (error.message.includes('format') || error.message.includes('type')) {
              errorMessage = 'Unsupported image format. Please use JPG, PNG, or GIF.';
            } else if (error.message) {
              errorMessage = error.message;
            }
          }
          
          toast({
            title: "Upload Failed",
            description: errorMessage,
            variant: "destructive",
          });
          setProfileImagePreview("");
        } finally {
          setIsProfileImageUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Image processing error:', error);
      toast({
        title: "Error",
        description: "Failed to process the image. Please try again.",
        variant: "destructive",
      });
      setIsProfileImageUploading(false);
    }
  };

  const handleMedicineImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, medicineId?: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsMedicineImageUploading(true);

      // Basic validation
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File",
          description: "Please select a valid image file.",
          variant: "destructive",
        });
        return;
      }

      if (file.size > 2 * 1024 * 1024) { // 2MB limit for medicines
        toast({
          title: "File Too Large",
          description: "Please select an image smaller than 2MB.",
          variant: "destructive",
        });
        return;
      }

      // Convert to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageUrl = e.target?.result as string;
        setMedicineImagePreview(imageUrl);

        try {
          const token = localStorage.getItem('authToken');
          if (!token) throw new Error('No authentication token');

          // If medicineId is provided, upload directly to that medicine
          if (medicineId) {
            // Validate medicineId is not empty
            if (!medicineId || medicineId.trim() === '') {
              console.error('Medicine ID is empty or invalid');
              toast({
                title: "Upload Failed",
                description: "Invalid medicine ID. Please try again.",
                variant: "destructive",
              });
              return;
            }

            console.log('Uploading image for medicine ID:', medicineId);
            const response = await api.uploadMedicineImage(medicineId, imageUrl, token);

            if (response.success) {
              toast({
                title: "Image Uploaded Successfully",
                description: "Your medicine image has been updated.",
              });

              // Update the editing medicine state with the new image URL if we're in edit mode
              if (editingMedicine && response.medicine) {
                try {
                  const newImageUrl = response.medicine.image_url || response.medicine.imageUrl;
                  console.log('Updating editing medicine with new image URL:', newImageUrl);

                  setEditingMedicine(prev => ({
                    ...prev,
                    imageUrl: newImageUrl || prev.imageUrl
                  }));

                  // Also update the image URL input field directly
                  const imageUrlInput = document.getElementById('edit-image-url') as HTMLInputElement;
                  if (imageUrlInput && newImageUrl) {
                    imageUrlInput.value = newImageUrl;
                  }
                } catch (stateError) {
                  console.error('Failed to update editing medicine state:', stateError);
                }
              }

              // Refresh medicines to show the new image
              try {
                await loadMedicines();
              } catch (refreshError) {
                console.error('Failed to refresh medicines after image upload:', refreshError);
              }

              // Clear the image preview
              setMedicineImagePreview("");

              // Clear the file input
              const fileInput = document.getElementById('medicine-image-upload') as HTMLInputElement;
              if (fileInput) fileInput.value = '';
              const editFileInput = document.getElementById('edit-medicine-image-upload') as HTMLInputElement;
              if (editFileInput) editFileInput.value = '';
            } else {
              throw new Error(response.message || 'Upload failed');
            }
          } else {
            // For new medicine, just set the preview
            setNewMedicine(prev => ({ ...prev, imageUrl: imageUrl }));
            toast({
              title: "Image Selected",
              description: "Image has been selected for the new medicine.",
            });
          }
        } catch (error) {
          console.error('Medicine image upload error:', error);

          let errorMessage = 'Failed to upload image. Please try again.';

          if (error instanceof Error) {
            if (error.message.includes('connect') || error.message.includes('fetch')) {
              errorMessage = 'Unable to connect to server. Please check your internet connection.';
            } else if (error.message.includes('session') || error.message.includes('expired')) {
              errorMessage = 'Your session has expired. Please log in again.';
              localStorage.removeItem('authToken');
              localStorage.removeItem('userType');
            } else if (error.message.includes('large') || error.message.includes('size')) {
              errorMessage = 'Image file is too large. Please select a smaller image.';
            } else if (error.message.includes('format') || error.message.includes('type')) {
              errorMessage = 'Unsupported image format. Please use JPG, PNG, or GIF.';
            } else if (error.message.includes('500') || error.message.includes('Internal Server Error')) {
              errorMessage = 'Server error occurred. Please try again later.';
            } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
              errorMessage = 'Authentication failed. Please log in again.';
              localStorage.removeItem('authToken');
              localStorage.removeItem('userType');
            } else if (error.message.includes('404') || error.message.includes('Not Found')) {
              errorMessage = 'Medicine not found. Please refresh the page and try again.';
            } else if (error.message.includes('Server error occurred')) {
              errorMessage = 'Server error occurred. Please try again later.';
            } else if (error.message) {
              errorMessage = error.message;
            }
          }

          toast({
            title: "Upload Failed",
            description: errorMessage,
            variant: "destructive",
          });
        } finally {
          setIsMedicineImageUploading(false);
        }
      };

      reader.onerror = () => {
        toast({
          title: "File Read Error",
          description: "Failed to read the selected file. Please try again.",
          variant: "destructive",
        });
        setIsMedicineImageUploading(false);
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Medicine image upload error:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
      setIsMedicineImageUploading(false);
    }
  };

  const getStatusBadge = (medicine: Medicine) => {
    // Use actual status from database if available, otherwise calculate from stock
    const actualStatus = medicine.status?.toLowerCase() || 'available';
    
    if (actualStatus === 'out_of_stock' || actualStatus === 'unavailable' || medicine.stockQuantity === 0) {
      return <Badge variant="destructive">Out of Stock</Badge>;
    } else if (actualStatus === 'low_stock' || (medicine.stockQuantity && medicine.stockQuantity < 30)) {
      return <Badge className="bg-yellow-500 text-white">Low Stock</Badge>;
    } else if (actualStatus === 'available' || actualStatus === 'in_stock') {
      return <Badge className="bg-green-500 text-white">In Stock</Badge>;
    } else {
      return <Badge variant="secondary">{actualStatus}</Badge>;
    }
  };

  const handleAddMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Authentication required. Please log in again.');
        return;
      }

      // Validation
      if (!newMedicine.name || !newMedicine.description || !newMedicine.category || 
          !newMedicine.price || !newMedicine.stockQuantity) {
        setError('Please fill in all required fields');
        return;
      }

      const price = parseFloat(newMedicine.price);
      const stockQuantity = parseInt(newMedicine.stockQuantity);

      if (isNaN(price) || price <= 0) {
        setError('Please enter a valid price');
        return;
      }

      if (isNaN(stockQuantity) || stockQuantity < 0) {
        setError('Please enter a valid stock quantity');
        return;
      }

      const medicineData = {
        name: newMedicine.name,
        description: newMedicine.description,
        category: newMedicine.category,
        price: price,
        stockQuantity: stockQuantity,
        stock: stockQuantity, // Backend field
        status: stockQuantity === 0 ? 'out_of_stock' : 
                stockQuantity < 30 ? 'low_stock' : 'available',
        pharmacyId: "", // Will be set by backend
        pharmacyName: "", // Will be set by backend
        location: "", // Will be set by backend
        imageUrl: newMedicine.imageUrl || medicineImagePreview || ""
      };

      const response = await api.addMedicine(medicineData, token);
      
      if (response.success) {
        setSuccessMessage('Medicine added successfully!');
        toast({
          title: "Medicine Added",
          description: `${newMedicine.name} has been added to your inventory.`,
        });
        await loadMedicines();
        setNewMedicine({ 
          name: "", 
          description: "", 
          stockQuantity: "", 
          price: "", 
          category: "", 
          imageUrl: "" 
        });
      } else {
        setError(response.message || "Failed to add medicine");
        toast({
          title: "Failed to Add Medicine",
          description: response.message || "Please check your input and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Add medicine error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(`Failed to add medicine: ${errorMessage}`);
      toast({
        title: "Error Adding Medicine",
        description: `${errorMessage}. Please check if you're logged in and try again.`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditMedicine = (medicine: Medicine) => {
    console.log('Editing medicine:', medicine);
    console.log('Medicine ID:', medicine.id);
    console.log('Medicine ID type:', typeof medicine.id);
    
    if (!medicine.id) {
      console.error('Medicine has no ID:', medicine);
      toast({
        title: "Error",
        description: "This medicine cannot be edited - missing ID. Please refresh the page.",
        variant: "destructive",
      });
      return;
    }
    
    setEditingMedicine(medicine);
    setIsEditDialogOpen(true);
  };

  const handleUpdateMedicine = async () => {
    if (!editingMedicine) return;

    setIsLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Authentication required. Please log in again.');
        return;
      }

      // Validation
      if (!editingMedicine.name || !editingMedicine.description || !editingMedicine.category || 
          !editingMedicine.price || !editingMedicine.stockQuantity) {
        setError('Please fill in all required fields');
        return;
      }

      if (editingMedicine.price <= 0) {
        setError('Please enter a valid price');
        return;
      }

      if (editingMedicine.stockQuantity < 0) {
        setError('Please enter a valid stock quantity');
        return;
      }

      const medicineData = {
        name: editingMedicine.name,
        description: editingMedicine.description,
        category: editingMedicine.category,
        price: editingMedicine.price,
        stockQuantity: editingMedicine.stockQuantity,
        stock: editingMedicine.stockQuantity, // Backend field
        status: editingMedicine.stockQuantity === 0 ? 'out_of_stock' : 
                editingMedicine.stockQuantity < 30 ? 'low_stock' : 'available',
        pharmacyId: editingMedicine.pharmacyId,
        pharmacyName: editingMedicine.pharmacyName,
        location: editingMedicine.location,
        imageUrl: editingMedicine.imageUrl || medicineImagePreview || "",
        isAvailable: editingMedicine.stockQuantity > 0
      };

      const response = await api.updateMedicine(editingMedicine.id, medicineData, token);
      
      if (response.success) {
        setSuccessMessage('Medicine updated successfully!');
        await loadMedicines();
        setIsEditDialogOpen(false);
        setEditingMedicine(null);
      } else {
        setError(response.message || "Failed to update medicine");
      }
    } catch (error) {
      console.error('Update medicine error:', error);
      setError('Failed to update medicine. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (medicine: Medicine) => {
    setMedicineToDelete(medicine);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!medicineToDelete) return;

    setIsLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Authentication required. Please log in again.');
        toast({
          title: "Authentication Error",
          description: "Please log in again to continue.",
          variant: "destructive",
        });
        return;
      }

      const response = await api.deleteMedicine(medicineToDelete.id, token);
      
      if (response.success) {
        setSuccessMessage('Medicine deleted successfully!');
        toast({
          title: "Medicine Deleted",
          description: `${medicineToDelete.name} has been removed from your inventory.`,
        });
        await loadMedicines();
        setIsDeleteDialogOpen(false);
        setMedicineToDelete(null);
      } else {
        const errorMessage = response.message || "Failed to delete medicine";
        setError(errorMessage);
        toast({
          title: "Delete Failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Delete medicine error:', error);
      
      // Extract meaningful error message
      let errorMessage = 'Failed to delete medicine. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('connect') || error.message.includes('fetch')) {
          errorMessage = 'Unable to connect to server. Please check your internet connection and try again.';
        } else if (error.message.includes('session') || error.message.includes('expired')) {
          errorMessage = 'Your session has expired. Please log in again.';
          localStorage.removeItem('authToken');
          localStorage.removeItem('userType');
        } else if (error.message.includes('not found') || error.message.includes('404')) {
          errorMessage = 'Medicine not found or has already been deleted.';
        } else if (error.message.includes('permission') || error.message.includes('access denied')) {
          errorMessage = 'You do not have permission to delete this medicine.';
        } else if (error.message.includes('500') || error.message.includes('Internal Server Error')) {
          errorMessage = 'Server error occurred. Please try again later or contact support.';
        } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          errorMessage = 'Authentication failed. Please log in again.';
          localStorage.removeItem('authToken');
          localStorage.removeItem('userType');
        } else if (error.message) {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
      toast({
        title: "Delete Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Settings functions
  const loadPharmacySettings = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await api.getPharmacySettings(token);
      if (response.success && response.settings) {
        setSettings({
          email_notifications: response.settings.email_notifications,
          sms_notifications: response.settings.sms_notifications,
          opening_time: response.settings.opening_time,
          closing_time: response.settings.closing_time
        });
      }
    } catch (error) {
      console.error('Load settings error:', error);
    }
  };

  const handleUpdateSettings = async () => {
    setIsLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Authentication required. Please log in again.');
        return;
      }

      const response = await api.updatePharmacySettings(token, settings);
      
      if (response.success) {
        setSuccessMessage('Settings updated successfully!');
        toast({
          title: "Settings Updated",
          description: "Your pharmacy settings have been saved successfully.",
        });
      } else {
        setError(response.message || "Failed to update settings");
      }
    } catch (error) {
      console.error('Update settings error:', error);
      setError('Failed to update settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Load settings when switching to settings view
  useEffect(() => {
    if (activeView === 'settings') {
      loadPharmacySettings();
    }
  }, [activeView]);

  // Clear messages after a few seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-background">
      {/* Enhanced Header with Profile Avatar and Hamburger Menu */}
      <header className="bg-card/95 backdrop-blur-md border-b border-border/50 py-3 px-4 md:px-6 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Left: Logo and Title */}
          <div className="flex items-center gap-3">
            <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-medical-blue to-medical-green bg-clip-text text-transparent">
              Pharmacy Dashboard
            </h1>
          </div>

          {/* Center: Navigation (Desktop) */}
          <nav className="hidden md:flex items-center gap-2">
            <Button 
              variant={activeView === 'inventory' ? 'default' : 'ghost'} 
              size="sm" 
              className={activeView === 'inventory' ? 'bg-medical-blue hover:bg-medical-blue/90' : 'text-muted-foreground hover:text-medical-blue'}
              onClick={() => setActiveView('inventory')}
            >
              <Package className="h-4 w-4 mr-2" />
              Inventory
            </Button>
            <Button 
              variant={activeView === 'profile' ? 'default' : 'ghost'} 
              size="sm" 
              className={activeView === 'profile' ? 'bg-medical-green hover:bg-medical-green/90' : 'text-muted-foreground hover:text-medical-green'}
              onClick={() => setActiveView('profile')}
            >
              <User className="h-4 w-4 mr-2" />
              Profile
            </Button>
            <Button 
              variant={activeView === 'analytics' ? 'default' : 'ghost'} 
              size="sm" 
              className={activeView === 'analytics' ? 'bg-accent hover:bg-accent/90' : 'text-muted-foreground hover:text-accent'}
              onClick={() => setActiveView('analytics')}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </Button>
            <Button 
              variant={activeView === 'settings' ? 'default' : 'ghost'} 
              size="sm" 
              className={activeView === 'settings' ? 'bg-secondary hover:bg-secondary/90' : 'text-muted-foreground hover:text-secondary'}
              onClick={() => setActiveView('settings')}
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </nav>

          {/* Right: Profile Avatar, Theme Toggle, and Actions */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Profile Avatar with Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full border-2 border-medical-blue/20 hover:border-medical-blue/40 transition-all duration-300">
                  <Avatar className="h-8 w-8">
                    <AvatarImage 
                      src={profileImagePreview || pharmacyInfo.profile_image} 
                      alt={pharmacyInfo.name}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-gradient-to-br from-medical-blue to-medical-green text-white text-xs font-semibold">
                      {getInitials(pharmacyInfo.name || "PH")}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-card/95 backdrop-blur-md border-border/50" align="end" forceMount>
                <div className="flex flex-col space-y-1 p-3">
                  <p className="text-sm font-medium leading-none">{pharmacyInfo.name || "Pharmacy Name"}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {pharmacyInfo.email || "email@pharmacy.com"}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setActiveView('profile')}
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setActiveView('settings')}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Dashboard Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={onLogout}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Hamburger Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] bg-card/95 backdrop-blur-md">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage 
                        src={profileImagePreview || pharmacyInfo.profile_image} 
                        alt={pharmacyInfo.name}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-gradient-to-br from-medical-blue to-medical-green text-white">
                        {getInitials(pharmacyInfo.name || "PH")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <p className="text-sm font-medium">{pharmacyInfo.name || "Pharmacy Name"}</p>
                      <p className="text-xs text-muted-foreground">{pharmacyInfo.email}</p>
                    </div>
                  </SheetTitle>
                  <SheetDescription>
                    Manage your pharmacy dashboard and settings
                  </SheetDescription>
                </SheetHeader>
                <div className="flex flex-col gap-2 mt-6">
                  <Button 
                    variant={activeView === 'inventory' ? 'default' : 'ghost'} 
                    className="justify-start" 
                    size="lg"
                    onClick={() => setActiveView('inventory')}
                  >
                    <Package className="mr-3 h-5 w-5" />
                    Medicine Inventory
                  </Button>
                  <Button 
                    variant={activeView === 'profile' ? 'default' : 'ghost'} 
                    className="justify-start" 
                    size="lg"
                    onClick={() => setActiveView('profile')}
                  >
                    <User className="mr-3 h-5 w-5" />
                    Pharmacy Profile
                  </Button>
                  <Button 
                    variant={activeView === 'analytics' ? 'default' : 'ghost'} 
                    className="justify-start" 
                    size="lg"
                    onClick={() => setActiveView('analytics')}
                  >
                    <BarChart3 className="mr-3 h-5 w-5" />
                    Analytics & Reports
                  </Button>
                  <Button 
                    variant={activeView === 'settings' ? 'default' : 'ghost'} 
                    className="justify-start" 
                    size="lg"
                    onClick={() => setActiveView('settings')}
                  >
                    <Settings className="mr-3 h-5 w-5" />
                    Settings
                  </Button>
                  <div className="border-t pt-4 mt-4">
                    <Button 
                      variant="ghost" 
                      className="justify-start text-red-600 hover:text-red-700 hover:bg-red-50" 
                      size="lg"
                      onClick={onLogout}
                    >
                      <LogOut className="mr-3 h-5 w-5" />
                      Log out
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-4 md:py-8 px-4 md:px-6">
        {/* Alert Messages */}
        {error && (
          <Alert className="mb-4 md:mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}
        
        {successMessage && (
          <Alert className="mb-4 md:mb-6 border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
          </Alert>
        )}

        {/* Conditional Content Based on Active View */}
        {activeView === 'inventory' && (
          <div className="space-y-6">
            {/* Add Medicine Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Add New Medicine
                </CardTitle>
                <CardDescription>
                  Add medicines to your inventory
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddMedicine} className="space-y-6">
                  <div className="grid grid-cols-1 gap-4 sm:gap-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="medicine-name">Medicine Name *</Label>
                    <Input
                      id="medicine-name"
                      value={newMedicine.name}
                      onChange={(e) => setNewMedicine({ ...newMedicine, name: e.target.value })}
                      placeholder="e.g., Paracetamol 500mg"
                      required
                          className="w-full"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select value={newMedicine.category} onValueChange={(value) => setNewMedicine({ ...newMedicine, category: value })}>
                          <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pain Relief">Pain Relief</SelectItem>
                        <SelectItem value="Antibiotics">Antibiotics</SelectItem>
                        <SelectItem value="Cardiovascular">Cardiovascular</SelectItem>
                        <SelectItem value="Diabetes">Diabetes</SelectItem>
                        <SelectItem value="Respiratory">Respiratory</SelectItem>
                        <SelectItem value="Vitamins">Vitamins</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                      </div>
                  </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price ($) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={newMedicine.price}
                      onChange={(e) => setNewMedicine({ ...newMedicine, price: e.target.value })}
                      placeholder="0.00"
                      required
                          className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stock">Stock Quantity *</Label>
                    <Input
                      id="stock"
                      type="number"
                      min="0"
                      value={newMedicine.stockQuantity}
                      onChange={(e) => setNewMedicine({ ...newMedicine, stockQuantity: e.target.value })}
                      placeholder="0"
                      required
                          className="w-full"
                    />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="image-url">Medicine Image</Label>
                    <div className="space-y-4">
                      {/* Image Preview */}
                      {(newMedicine.imageUrl || medicineImagePreview) && (
                        <div className="flex justify-center sm:justify-start">
                          <div className="relative w-32 h-32 border-2 border-dashed border-border rounded-lg overflow-hidden">
                            <img
                              src={medicineImagePreview || newMedicine.imageUrl}
                              alt="Medicine preview"
                              className="w-full h-full object-cover"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute top-1 right-1 h-6 w-6 p-0 bg-black/50 hover:bg-black/70 text-white"
                              onClick={() => {
                                setNewMedicine(prev => ({ ...prev, imageUrl: "" }));
                                setMedicineImagePreview("");
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      {/* Upload Button */}
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="hover:bg-medical-blue/10 hover:border-medical-blue/30 w-full sm:w-auto"
                          onClick={() => document.getElementById('medicine-image-upload')?.click()}
                          disabled={isMedicineImageUploading}
                        >
                          <Camera className="h-4 w-4 mr-2" />
                          {isMedicineImageUploading ? 'Uploading...' : 'Upload Image'}
                        </Button>
                        
                        <input
                          id="medicine-image-upload"
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleMedicineImageUpload(e)}
                          className="hidden"
                        />
                      </div>
                      
                      {/* Or URL Input */}
                  <div className="space-y-2">
                        <Label htmlFor="image-url" className="text-sm font-medium">Or enter image URL</Label>
                    <Input
                      id="image-url"
                      value={newMedicine.imageUrl}
                      onChange={(e) => setNewMedicine({ ...newMedicine, imageUrl: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                          className="w-full"
                    />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={newMedicine.description}
                      onChange={(e) => setNewMedicine({ ...newMedicine, description: e.target.value })}
                      placeholder="Medicine description, usage instructions, etc."
                      required
                      className="min-h-[120px] w-full resize-none"
                    />
                  </div>

                  <div className="pt-4 flex flex-col sm:flex-row gap-3">
                    <Button type="submit" disabled={isLoading} className="w-full sm:w-auto px-8 py-2">
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Adding Medicine...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Medicine
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Medicine Inventory Table */}
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle>Current Inventory</CardTitle>
                    <CardDescription>
                      Manage your medicine stock and pricing
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadMedicines}
                    disabled={isLoading}
                    className="w-full sm:w-auto"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading && medicines.length === 0 ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <span className="ml-2">Loading medicines...</span>
                  </div>
                ) : medicines.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No medicines in inventory. Add your first medicine using the form above.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="min-w-[250px]">Medicine</TableHead>
                          <TableHead className="hidden md:table-cell">Category</TableHead>
                          <TableHead className="hidden sm:table-cell">Price</TableHead>
                          <TableHead className="hidden sm:table-cell">Stock</TableHead>
                          <TableHead className="hidden lg:table-cell">Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {medicines.map((medicine) => (
                          <TableRow key={medicine.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-3">
                                {/* Medicine Image */}
                                <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-border/50 flex-shrink-0">
                                  {medicine.imageUrl ? (
                                    <img
                                      src={medicine.imageUrl}
                                      alt={medicine.name}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        // Use a data URI for a simple placeholder to avoid network requests
                                        target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMiAxMkgzNlYzNkgxMlYxMloiIGZpbGw9IiNFNUU3RUIiLz4KPHBhdGggZD0iTTE2IDE2SDMyVjIwSDE2VjE2WiIgZmlsbD0iIzk0QTNCRiIvPgo8cGF0aCBkPSJNMTYgMjJIMzJWMjZIMTZWMjJaIiBmaWxsPSIjOTRBM0JGIi8+CjxwYXRoIGQ9Ik0xNiAyOEgyOFYzMkgxNlYyOFoiIGZpbGw9IiM5NEEzQkYiLz4KPC9zdmc+";
                                        target.onerror = null; // Prevent infinite loop
                                      }}
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-medical-blue/20 to-medical-green/20 flex items-center justify-center">
                                      <Package className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                  )}
                                </div>
                                
                                {/* Medicine Info */}
                                <div className="min-w-0 flex-1">
                                  <div className="font-medium truncate">{medicine.name}</div>
                                  <div className="text-xs text-muted-foreground md:hidden">
                                    {medicine.category} • ${medicine.price.toFixed(2)} • {medicine.stockQuantity || 0} in stock
                                  </div>
                                  <div className="text-xs text-muted-foreground hidden md:block lg:hidden">
                                    ${medicine.price.toFixed(2)} • {medicine.stockQuantity || 0} in stock
                                  </div>
                                  {medicine.description && (
                                    <div className="text-xs text-muted-foreground truncate max-w-[200px] hidden lg:block">
                                      {medicine.description}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">{medicine.category}</TableCell>
                            <TableCell className="hidden sm:table-cell font-medium">${medicine.price.toFixed(2)}</TableCell>
                            <TableCell className="hidden sm:table-cell font-medium">{medicine.stockQuantity || 0}</TableCell>
                            <TableCell className="hidden lg:table-cell">{getStatusBadge(medicine)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex gap-1 sm:gap-2 justify-end">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleEditMedicine(medicine)}
                                  disabled={isLoading}
                                  className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-medical-blue/10 hover:border-medical-blue/30"
                                  title="Edit Medicine"
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  onClick={() => handleDeleteClick(medicine)}
                                  disabled={isLoading}
                                  className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-red-600/90"
                                  title="Delete Medicine"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeView === 'profile' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Pharmacy Information
                </CardTitle>
                <CardDescription>
                  Update your pharmacy profile information and settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Enhanced Profile Avatar Section */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-6 bg-gradient-to-r from-medical-blue/10 to-medical-green/10 rounded-xl border border-border/50">
                  <div className="relative group">
                    <Avatar className="h-24 w-24 border-4 border-medical-blue/20 group-hover:border-medical-blue/40 transition-all duration-300">
                      <AvatarImage 
                        src={profileImagePreview || pharmacyInfo.profile_image} 
                        alt={pharmacyInfo.name}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-gradient-to-br from-medical-blue to-medical-green text-white text-xl font-semibold">
                        {getInitials(pharmacyInfo.name || "PH")}
                      </AvatarFallback>
                    </Avatar>
                    
                    {/* Upload Button Overlay */}
                    <div className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center cursor-pointer">
                      <label htmlFor="profile-image-upload" className="cursor-pointer">
                        <Camera className="h-6 w-6 text-white" />
                        <input
                          id="profile-image-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleProfileImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {isProfileImageUploading && (
                      <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
                        <Loader2 className="h-6 w-6 text-white animate-spin" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 space-y-3">
                    <h3 className="text-xl font-semibold bg-gradient-to-r from-medical-blue to-medical-green bg-clip-text text-transparent">
                      {pharmacyInfo.name || 'Pharmacy Name'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Click on the avatar to upload a new profile image. Supported formats: JPG, PNG, GIF (max 5MB)
                    </p>
                    
                    {/* Upload Methods */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="hover:bg-medical-blue/10 hover:border-medical-blue/30"
                        onClick={() => document.getElementById('profile-image-upload')?.click()}
                        disabled={isProfileImageUploading}
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        {isProfileImageUploading ? 'Uploading...' : 'Upload Image'}
                      </Button>
                      
                      <div className="flex-1 space-y-1">
                        <Label htmlFor="profile-image-url" className="text-xs">Or enter image URL</Label>
                        <div className="flex gap-2">
                          <Input
                            id="profile-image-url"
                            value={pharmacyInfo.profile_image}
                            onChange={(e) => setPharmacyInfo({ ...pharmacyInfo, profile_image: e.target.value })}
                            placeholder="https://example.com/logo.jpg"
                            className="text-xs"
                          />
                          {pharmacyInfo.profile_image && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setPharmacyInfo({ ...pharmacyInfo, profile_image: "" })}
                              className="px-2"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pharmacy-name">Pharmacy Name *</Label>
                    <Input
                      id="pharmacy-name"
                      value={pharmacyInfo.name}
                      onChange={(e) => setPharmacyInfo({ ...pharmacyInfo, name: e.target.value })}
                      placeholder="Enter pharmacy name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={pharmacyInfo.phone}
                      onChange={(e) => setPharmacyInfo({ ...pharmacyInfo, phone: e.target.value })}
                      placeholder="+1 (555) 123-4567"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={pharmacyInfo.email}
                      onChange={(e) => setPharmacyInfo({ ...pharmacyInfo, email: e.target.value })}
                      placeholder="contact@pharmacy.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="license">License Number</Label>
                    <Input
                      id="license"
                      value={pharmacyInfo.license_number}
                      onChange={(e) => setPharmacyInfo({ ...pharmacyInfo, license_number: e.target.value })}
                      placeholder="Enter license number"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    value={pharmacyInfo.address}
                    onChange={(e) => setPharmacyInfo({ ...pharmacyInfo, address: e.target.value })}
                    placeholder="123 Main Street, Downtown, City, State/Province, Country"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={pharmacyInfo.description}
                    onChange={(e) => setPharmacyInfo({ ...pharmacyInfo, description: e.target.value })}
                    placeholder="Tell customers about your pharmacy, services, and specialties..."
                    rows={4}
                  />
                </div>
                <Button 
                  onClick={handleUpdatePharmacyInfo}
                  disabled={isLoading}
                  className="w-full md:w-auto"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Update Pharmacy Information
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {activeView === 'analytics' && (
          <div className="space-y-6">
            {/* Summary Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm md:text-base">Total Medicines</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl md:text-3xl font-bold text-blue-600">
                    {medicines.length}
                  </div>
                  <p className="text-xs md:text-sm text-muted-foreground">In your inventory</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm md:text-base">Available</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl md:text-3xl font-bold text-green-600">
                    {medicines.filter(m => 
                      (m.status?.toLowerCase() === 'available' || m.status?.toLowerCase() === 'in_stock') && 
                      (m.stockQuantity || 0) > 0
                    ).length}
                  </div>
                  <p className="text-xs md:text-sm text-muted-foreground">Ready to sell</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm md:text-base">Low Stock</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl md:text-3xl font-bold text-yellow-600">
                    {medicines.filter(m => {
                      const stock = m.stockQuantity || 0;
                      const status = m.status?.toLowerCase() || 'available';
                      return (status === 'low_stock') || (stock > 0 && stock < 30 && status === 'available');
                    }).length}
                  </div>
                  <p className="text-xs md:text-sm text-muted-foreground">Need restocking</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm md:text-base">Out of Stock</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl md:text-3xl font-bold text-red-600">
                    {medicines.filter(m => 
                      (m.stockQuantity || 0) === 0 || 
                      m.status?.toLowerCase() === 'out_of_stock' || 
                      m.status?.toLowerCase() === 'unavailable'
                    ).length}
                  </div>
                  <p className="text-xs md:text-sm text-muted-foreground">Urgent attention</p>
                </CardContent>
              </Card>
            </div>

            {/* Category Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Category Breakdown</CardTitle>
                <CardDescription>Medicines distribution by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Object.entries(
                    medicines.reduce((acc, medicine) => {
                      const category = medicine.category || 'General';
                      acc[category] = (acc[category] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)
                  ).map(([category, count]) => (
                    <div key={category} className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-lg md:text-xl font-bold text-medical-blue">{count}</div>
                      <div className="text-xs md:text-sm text-muted-foreground truncate">{category}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Inventory Value */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Total Inventory Value</CardTitle>
                  <CardDescription>Based on current stock and prices</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl md:text-3xl font-bold text-medical-green">
                    ${medicines.reduce((total, medicine) => 
                      total + ((medicine.stockQuantity || 0) * medicine.price), 0
                    ).toFixed(2)}
                  </div>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Across {medicines.filter(m => (m.stockQuantity || 0) > 0).length} stocked items
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Average Medicine Price</CardTitle>
                  <CardDescription>Mean price across all medicines</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl md:text-3xl font-bold text-purple-600">
                    ${medicines.length > 0 ? 
                      (medicines.reduce((sum, m) => sum + m.price, 0) / medicines.length).toFixed(2) : 
                      '0.00'
                    }
                  </div>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    {medicines.length > 0 ? 
                      `Range: $${Math.min(...medicines.map(m => m.price)).toFixed(2)} - $${Math.max(...medicines.map(m => m.price)).toFixed(2)}` :
                      'No medicines in inventory'
                    }
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeView === 'settings' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Settings
                </CardTitle>
                <CardDescription>
                  Manage your pharmacy settings and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Notification Preferences</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <input 
                          type="checkbox" 
                          id="email-notifications" 
                          className="rounded h-4 w-4" 
                          checked={settings.email_notifications}
                          onChange={(e) => setSettings({...settings, email_notifications: e.target.checked})}
                        />
                        <Label htmlFor="email-notifications" className="text-sm font-medium">
                          Email notifications
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input 
                          type="checkbox" 
                          id="sms-notifications" 
                          className="rounded h-4 w-4" 
                          checked={settings.sms_notifications}
                          onChange={(e) => setSettings({...settings, sms_notifications: e.target.checked})}
                        />
                        <Label htmlFor="sms-notifications" className="text-sm font-medium">
                          SMS notifications
                        </Label>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Business Hours</h3>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="opening-time" className="text-sm font-medium">Opening Time</Label>
                        <Input 
                          id="opening-time"
                          type="time" 
                          value={settings.opening_time}
                          onChange={(e) => setSettings({...settings, opening_time: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="closing-time" className="text-sm font-medium">Closing Time</Label>
                        <Input 
                          id="closing-time"
                          type="time" 
                          value={settings.closing_time}
                          onChange={(e) => setSettings({...settings, closing_time: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t flex gap-3">
                  <Button 
                    onClick={handleUpdateSettings}
                    disabled={isLoading}
                    className="bg-medical-blue hover:bg-medical-blue/90"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Settings
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={loadPharmacySettings}
                    disabled={isLoading}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Edit Medicine Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Medicine</DialogTitle>
            <DialogDescription>
              Update the medicine information below.
            </DialogDescription>
          </DialogHeader>
          {editingMedicine && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:gap-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                    <Label htmlFor="edit-name">Medicine Name *</Label>
                <Input
                      id="edit-name"
                      placeholder="Medicine name"
                      value={getEditingMedicineValue('name')}
                      onChange={(e) => setEditingMedicine(editingMedicine ? { ...editingMedicine, name: e.target.value } : null)}
                      className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category *</Label>
                    <Select value={getEditingMedicineValue('category')} onValueChange={(value) => setEditingMedicine(editingMedicine ? { ...editingMedicine, category: value } : null)}>
                      <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pain Relief">Pain Relief</SelectItem>
                    <SelectItem value="Antibiotics">Antibiotics</SelectItem>
                    <SelectItem value="Cardiovascular">Cardiovascular</SelectItem>
                    <SelectItem value="Diabetes">Diabetes</SelectItem>
                    <SelectItem value="Respiratory">Respiratory</SelectItem>
                    <SelectItem value="Vitamins">Vitamins</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                  </div>
              </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <Label htmlFor="edit-price">Price ($) *</Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                      value={getEditingMedicineNumberValue('price', 0).toString()}
                      onChange={(e) => setEditingMedicine(editingMedicine ? { ...editingMedicine, price: parseFloat(e.target.value) || 0 } : null)}
                      className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-stock">Stock Quantity *</Label>
                <Input
                  id="edit-stock"
                  type="number"
                  min="0"
                  placeholder="0"
                      value={getEditingMedicineNumberValue('stockQuantity', 0).toString()}
                      onChange={(e) => setEditingMedicine(editingMedicine ? { ...editingMedicine, stockQuantity: parseInt(e.target.value) || 0 } : null)}
                      className="w-full"
                />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="edit-image-url">Medicine Image</Label>
                <div className="space-y-4">
                  {/* Image Preview */}
                  {(editingMedicine.imageUrl || medicineImagePreview) && (
                    <div className="flex justify-center sm:justify-start">
                      <div className="relative w-32 h-32 border-2 border-dashed border-border rounded-lg overflow-hidden">
                        <img
                          src={medicineImagePreview || editingMedicine.imageUrl}
                          alt="Medicine preview"
                          className="w-full h-full object-cover"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute top-1 right-1 h-6 w-6 p-0 bg-black/50 hover:bg-black/70 text-white"
                          onClick={() => {
                            setEditingMedicine(prev => prev ? { ...prev, imageUrl: "" } : null);
                            setMedicineImagePreview("");
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {/* Upload Button */}
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="hover:bg-medical-blue/10 hover:border-medical-blue/30 w-full sm:w-auto"
                      onClick={() => document.getElementById('edit-medicine-image-upload')?.click()}
                      disabled={isMedicineImageUploading}
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      {isMedicineImageUploading ? 'Uploading...' : 'Upload Image'}
                    </Button>
                    
                    <input
                      id="edit-medicine-image-upload"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const medicineId = editingMedicine?.id;
                        if (!medicineId) {
                          console.error('No medicine ID available for image upload');
                          toast({
                            title: "Error",
                            description: "Unable to upload image - medicine ID not found.",
                            variant: "destructive",
                          });
                          return;
                        }
                        handleMedicineImageUpload(e, medicineId);
                      }}
                      className="hidden"
                    />
                  </div>
                  
                  {/* Or URL Input */}
                  <div className="space-y-2">
                    <Label htmlFor="edit-image-url" className="text-sm font-medium">Or enter image URL</Label>
                <Input
                  id="edit-image-url"
                  placeholder="https://example.com/image.jpg"
                      value={getEditingMedicineValue('imageUrl')}
                      onChange={(e) => setEditingMedicine(editingMedicine ? { ...editingMedicine, imageUrl: e.target.value } : null)}
                      className="w-full"
                />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="edit-description">Description *</Label>
                <Textarea
                  id="edit-description"
                  placeholder="Medicine description"
                  value={getEditingMedicineValue('description')}
                  onChange={(e) => setEditingMedicine(editingMedicine ? { ...editingMedicine, description: e.target.value } : null)}
                  className="min-h-[120px] w-full resize-none"
                />
              </div>
            </div>
          )}
          <DialogFooter className="flex flex-col gap-3 sm:flex-row sm:gap-0">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="w-full sm:w-auto order-2 sm:order-1">
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleUpdateMedicine} disabled={isLoading} className="w-full sm:w-auto order-1 sm:order-2">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update Medicine
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="w-[95vw] sm:w-full max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Medicine</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{medicineToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col gap-3 sm:flex-row sm:gap-0">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="w-full sm:w-auto order-2 sm:order-1">
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={isLoading} className="w-full sm:w-auto order-1 sm:order-2">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
