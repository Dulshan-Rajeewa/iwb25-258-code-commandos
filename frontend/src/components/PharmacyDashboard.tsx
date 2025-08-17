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
import { Plus, Edit, Trash2, LogOut, MapPin, Loader2, Save, X, RefreshCw } from "lucide-react";
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
      setError('Failed to load medicines');
      toast({
        title: "Failed to Load Medicines",
        description: "Please check your connection and try again.",
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
          address: response.pharmacy.location || "", // Map location to address
          phone: response.pharmacy.phone || "",
          email: response.pharmacy.email || "",
          license_number: response.pharmacy.license_number || "",
          profile_image: response.pharmacy.profile_image || "",
          description: response.pharmacy.description || ""
        });
      }
    } catch (error) {
      console.error('Failed to load pharmacy info:', error);
      toast({
        title: "Failed to Load Pharmacy Info",
        description: "Some pharmacy information may not be available.",
        variant: "destructive",
      });
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
        // Update local state with response data if available
        if (response.pharmacy) {
          setPharmacyInfo({
            name: response.pharmacy.name || "",
            address: response.pharmacy.address || "",
            phone: response.pharmacy.phone || "",
            email: response.pharmacy.email || "",
            license_number: response.pharmacy.license_number || "",
            profile_image: response.pharmacy.profile_image || "",
            description: pharmacyInfo.description || ""
          });
        }
      } else {
        setError(response.message || "Failed to update pharmacy information");
        toast({
          title: "Update Failed",
          description: response.message || "Please check your information and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Update pharmacy info error:', error);
      setError('Failed to update pharmacy information. Please try again.');
      toast({
        title: "Update Error",
        description: "Network error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
        imageUrl: newMedicine.imageUrl || "https://example.com/default-medicine.jpg"
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
        imageUrl: editingMedicine.imageUrl || "https://example.com/default-medicine.jpg",
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
        return;
      }

      const response = await api.deleteMedicine(medicineToDelete.id, token);
      
      if (response.success) {
        setSuccessMessage('Medicine deleted successfully!');
        await loadMedicines();
        setIsDeleteDialogOpen(false);
        setMedicineToDelete(null);
      } else {
        setError(response.message || "Failed to delete medicine");
      }
    } catch (error) {
      console.error('Delete medicine error:', error);
      setError('Failed to delete medicine. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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
      {/* Header */}
      <header className="bg-card border-b border-border py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            Pharmacy Dashboard
          </h1>
          <Button variant="outline" onClick={onLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
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

        <Tabs defaultValue="inventory" className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-auto">
            <TabsTrigger value="inventory" className="text-xs md:text-sm py-2">
              <span className="hidden sm:inline">Medicine </span>Inventory
            </TabsTrigger>
            <TabsTrigger value="profile" className="text-xs md:text-sm py-2">
              <span className="hidden sm:inline">Pharmacy </span>Profile
            </TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs md:text-sm py-2">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="inventory" className="space-y-6">
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
                <form onSubmit={handleAddMedicine} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="medicine-name">Medicine Name *</Label>
                    <Input
                      id="medicine-name"
                      value={newMedicine.name}
                      onChange={(e) => setNewMedicine({ ...newMedicine, name: e.target.value })}
                      placeholder="e.g., Paracetamol 500mg"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select value={newMedicine.category} onValueChange={(value) => setNewMedicine({ ...newMedicine, category: value })}>
                      <SelectTrigger>
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
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="image-url">Image URL</Label>
                    <Input
                      id="image-url"
                      value={newMedicine.imageUrl}
                      onChange={(e) => setNewMedicine({ ...newMedicine, imageUrl: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2 lg:col-span-3">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={newMedicine.description}
                      onChange={(e) => setNewMedicine({ ...newMedicine, description: e.target.value })}
                      placeholder="Medicine description, usage instructions, etc."
                      required
                    />
                  </div>

                  <div className="md:col-span-2 lg:col-span-3">
                    <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
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
                          <TableHead className="min-w-[150px]">Medicine Name</TableHead>
                          <TableHead className="hidden sm:table-cell">Category</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Stock</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {medicines.map((medicine) => (
                          <TableRow key={medicine.id}>
                            <TableCell className="font-medium">
                              <div>
                                <div className="font-medium">{medicine.name}</div>
                                <div className="text-xs text-muted-foreground sm:hidden">
                                  {medicine.category}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">{medicine.category}</TableCell>
                            <TableCell className="font-medium">${medicine.price.toFixed(2)}</TableCell>
                            <TableCell className="font-medium">{medicine.stockQuantity || 0}</TableCell>
                            <TableCell>{getStatusBadge(medicine)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex gap-2 justify-end">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleEditMedicine(medicine)}
                                  disabled={isLoading}
                                  className="h-8 w-8 p-0"
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  onClick={() => handleDeleteClick(medicine)}
                                  disabled={isLoading}
                                  className="h-8 w-8 p-0"
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
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
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
                {/* Profile Avatar Section */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-muted/50 rounded-lg">
                  <Avatar className="h-20 w-20 border-4 border-medical-blue/20">
                    <AvatarImage src={pharmacyInfo.profile_image} alt={pharmacyInfo.name} />
                    <AvatarFallback className="bg-gradient-to-br from-medical-blue to-medical-green text-white text-lg font-semibold">
                      {pharmacyInfo.name ? pharmacyInfo.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'PH'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <h3 className="text-lg font-semibold">{pharmacyInfo.name || 'Pharmacy Name'}</h3>
                    <p className="text-sm text-muted-foreground">Upload or update your pharmacy profile image</p>
                    <div className="space-y-2">
                      <Label htmlFor="profile-image">Profile Image URL</Label>
                      <Input
                        id="profile-image"
                        value={pharmacyInfo.profile_image}
                        onChange={(e) => setPharmacyInfo({ ...pharmacyInfo, profile_image: e.target.value })}
                        placeholder="https://example.com/your-pharmacy-logo.jpg"
                      />
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
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
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
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Medicine Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Medicine</DialogTitle>
            <DialogDescription>
              Update the medicine information below.
            </DialogDescription>
          </DialogHeader>
          {editingMedicine && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-medicine-name">Medicine Name *</Label>
                <Input
                  id="edit-medicine-name"
                  value={editingMedicine.name}
                  onChange={(e) => setEditingMedicine({ ...editingMedicine, name: e.target.value })}
                  placeholder="e.g., Paracetamol 500mg"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category *</Label>
                <Select value={editingMedicine.category} onValueChange={(value) => setEditingMedicine({ ...editingMedicine, category: value })}>
                  <SelectTrigger>
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

              <div className="space-y-2">
                <Label htmlFor="edit-price">Price ($) *</Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={editingMedicine.price}
                  onChange={(e) => setEditingMedicine({ ...editingMedicine, price: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-stock">Stock Quantity *</Label>
                <Input
                  id="edit-stock"
                  type="number"
                  min="0"
                  value={editingMedicine.stockQuantity}
                  onChange={(e) => setEditingMedicine({ ...editingMedicine, stockQuantity: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="edit-image-url">Image URL</Label>
                <Input
                  id="edit-image-url"
                  value={editingMedicine.imageUrl}
                  onChange={(e) => setEditingMedicine({ ...editingMedicine, imageUrl: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="edit-description">Description *</Label>
                <Textarea
                  id="edit-description"
                  value={editingMedicine.description}
                  onChange={(e) => setEditingMedicine({ ...editingMedicine, description: e.target.value })}
                  placeholder="Medicine description, usage instructions, etc."
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleUpdateMedicine} disabled={isLoading}>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Medicine</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{medicineToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={isLoading}>
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
