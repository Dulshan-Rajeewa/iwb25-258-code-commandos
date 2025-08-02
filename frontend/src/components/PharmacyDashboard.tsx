import { useState, useEffect } from "react";
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, LogOut, MapPin, Loader2, Save, X } from "lucide-react";
import { api } from "@/lib/api";

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
    city: "",
    province: "",
    country: "",
    imageUrl: "",
    description: ""
  });

  useEffect(() => {
    loadMedicines();
    loadPharmacyInfo();
  }, []);

  const loadMedicines = async () => {
    try {
      setIsLoading(true);
      setError("");
      const response = await api.getMedicines();
      if (response.medicines) {
        setMedicines(response.medicines);
      }
    } catch (error) {
      console.error('Failed to load medicines:', error);
      setError('Failed to load medicines');
    } finally {
      setIsLoading(false);
    }
  };

  const loadPharmacyInfo = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await api.getPharmacyInfo(token);
      if (response.success && response.pharmacy) {
        setPharmacyInfo({
          name: response.pharmacy.name || "",
          address: response.pharmacy.address || "",
          phone: response.pharmacy.phone || "",
          email: response.pharmacy.email || "",
          city: response.pharmacy.city || "",
          province: response.pharmacy.province || "",
          country: response.pharmacy.country || "",
          imageUrl: response.pharmacy.imageUrl || "",
          description: response.pharmacy.description || ""
        });
      }
    } catch (error) {
      console.error('Failed to load pharmacy info:', error);
      // Don't show error here as it's not critical
    }
  };

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
        // Update local state with response data if available
        if (response.pharmacy) {
          setPharmacyInfo({
            name: response.pharmacy.name || "",
            address: response.pharmacy.address || "",
            phone: response.pharmacy.phone || "",
            email: response.pharmacy.email || "",
            city: response.pharmacy.city || "",
            province: response.pharmacy.province || "",
            country: response.pharmacy.country || "",
            imageUrl: response.pharmacy.imageUrl || "",
            description: pharmacyInfo.description || ""
          });
        }
      } else {
        setError(response.message || "Failed to update pharmacy information");
      }
    } catch (error) {
      console.error('Update pharmacy info error:', error);
      setError('Failed to update pharmacy information. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (medicine: Medicine) => {
    if (medicine.stockQuantity === 0) {
      return <Badge variant="destructive">Out of Stock</Badge>;
    } else if (medicine.stockQuantity < 30) {
      return <Badge className="bg-yellow-500 text-white">Low Stock</Badge>;
    } else {
      return <Badge className="bg-green-500 text-white">In Stock</Badge>;
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
        pharmacyId: "", // Will be set by backend
        pharmacyName: "", // Will be set by backend
        location: "", // Will be set by backend
        imageUrl: newMedicine.imageUrl || "https://example.com/default-medicine.jpg"
      };

      const response = await api.addMedicine(medicineData, token);
      
      if (response.success) {
        setSuccessMessage('Medicine added successfully!');
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
      }
    } catch (error) {
      console.error('Add medicine error:', error);
      setError('Failed to add medicine. Please try again.');
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

      <div className="max-w-7xl mx-auto py-8 px-6">
        {/* Alert Messages */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}
        
        {successMessage && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="inventory" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="inventory">Medicine Inventory</TabsTrigger>
            <TabsTrigger value="profile">Pharmacy Profile</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
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
                <CardTitle>Current Inventory</CardTitle>
                <CardDescription>
                  Manage your medicine stock and pricing
                </CardDescription>
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
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Medicine Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {medicines.map((medicine) => (
                        <TableRow key={medicine.id}>
                          <TableCell className="font-medium">{medicine.name}</TableCell>
                          <TableCell>{medicine.category}</TableCell>
                          <TableCell>${medicine.price.toFixed(2)}</TableCell>
                          <TableCell>{medicine.stockQuantity}</TableCell>
                          <TableCell>{getStatusBadge(medicine)}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleEditMedicine(medicine)}
                                disabled={isLoading}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => handleDeleteClick(medicine)}
                                disabled={isLoading}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
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
              </CardHeader>
              <CardContent className="space-y-4">
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
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={pharmacyInfo.city}
                      onChange={(e) => setPharmacyInfo({ ...pharmacyInfo, city: e.target.value })}
                      placeholder="Enter city"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="province">Province/State</Label>
                    <Input
                      id="province"
                      value={pharmacyInfo.province}
                      onChange={(e) => setPharmacyInfo({ ...pharmacyInfo, province: e.target.value })}
                      placeholder="Enter province or state"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={pharmacyInfo.country}
                      onChange={(e) => setPharmacyInfo({ ...pharmacyInfo, country: e.target.value })}
                      placeholder="Enter country"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    value={pharmacyInfo.address}
                    onChange={(e) => setPharmacyInfo({ ...pharmacyInfo, address: e.target.value })}
                    placeholder="123 Main Street, Downtown"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image-url">Image URL</Label>
                  <Input
                    id="image-url"
                    value={pharmacyInfo.imageUrl}
                    onChange={(e) => setPharmacyInfo({ ...pharmacyInfo, imageUrl: e.target.value })}
                    placeholder="https://example.com/pharmacy-image.jpg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={pharmacyInfo.description}
                    onChange={(e) => setPharmacyInfo({ ...pharmacyInfo, description: e.target.value })}
                    placeholder="Tell customers about your pharmacy..."
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Total Medicines</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">
                    {medicines.length}
                  </div>
                  <p className="text-muted-foreground text-sm">In your inventory</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Low Stock Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-yellow-600">
                    {medicines.filter(m => m.stockQuantity > 0 && m.stockQuantity < 30).length}
                  </div>
                  <p className="text-muted-foreground text-sm">Need restocking</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Out of Stock</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600">
                    {medicines.filter(m => m.stockQuantity === 0).length}
                  </div>
                  <p className="text-muted-foreground text-sm">Urgent attention</p>
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
