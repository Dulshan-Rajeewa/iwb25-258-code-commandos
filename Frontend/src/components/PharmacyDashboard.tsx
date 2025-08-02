import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Upload, Edit, Trash2, LogOut, MapPin, Phone, Clock } from "lucide-react";

interface PharmacyDashboardProps {
  onLogout: () => void;
}

interface Medicine {
  id: string;
  name: string;
  stock: number;
  price: string;
  category: string;
  expiryDate: string;
  status: "in-stock" | "low-stock" | "out-of-stock";
}

const mockMedicines: Medicine[] = [
  {
    id: "1",
    name: "Paracetamol 500mg",
    stock: 150,
    price: "$8.99",
    category: "Pain Relief",
    expiryDate: "2025-12-15",
    status: "in-stock"
  },
  {
    id: "2",
    name: "Aspirin 100mg",
    stock: 25,
    price: "$12.50",
    category: "Cardiovascular",
    expiryDate: "2025-08-20",
    status: "low-stock"
  },
  {
    id: "3",
    name: "Ibuprofen 400mg",
    stock: 0,
    price: "$9.75",
    category: "Pain Relief",
    expiryDate: "2025-10-30",
    status: "out-of-stock"
  }
];

export const PharmacyDashboard = ({ onLogout }: PharmacyDashboardProps) => {
  const [medicines, setMedicines] = useState<Medicine[]>(mockMedicines);
  const [newMedicine, setNewMedicine] = useState({
    name: "",
    stock: "",
    price: "",
    category: "",
    expiryDate: ""
  });

  const [pharmacyInfo, setPharmacyInfo] = useState({
    name: "HealthPlus Pharmacy",
    address: "123 Main Street, Downtown",
    phone: "+1 (555) 123-4567",
    email: "contact@healthplus.com",
    hours: "Mon-Fri: 8AM-9PM, Sat: 9AM-7PM, Sun: 10AM-6PM",
    description: "Your trusted neighborhood pharmacy providing quality healthcare services for over 15 years."
  });

  const getStatusBadge = (status: Medicine["status"]) => {
    switch (status) {
      case "in-stock":
        return <Badge className="bg-medical-success text-white">In Stock</Badge>;
      case "low-stock":
        return <Badge className="bg-medical-warning text-white">Low Stock</Badge>;
      case "out-of-stock":
        return <Badge variant="destructive">Out of Stock</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const handleAddMedicine = (e: React.FormEvent) => {
    e.preventDefault();
    const stock = parseInt(newMedicine.stock);
    const status: Medicine["status"] = stock === 0 ? "out-of-stock" : stock < 30 ? "low-stock" : "in-stock";
    
    const medicine: Medicine = {
      id: Date.now().toString(),
      name: newMedicine.name,
      stock,
      price: newMedicine.price,
      category: newMedicine.category,
      expiryDate: newMedicine.expiryDate,
      status
    };
    
    setMedicines([...medicines, medicine]);
    setNewMedicine({ name: "", stock: "", price: "", category: "", expiryDate: "" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-medical-blue to-medical-green bg-clip-text text-transparent">
            Pharmacy Dashboard
          </h1>
          <Button variant="outline" onClick={onLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-8 px-6">
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
                  Add medicines to your inventory one by one or upload a CSV file
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddMedicine} className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="medicine-name">Medicine Name</Label>
                    <Input
                      id="medicine-name"
                      placeholder="e.g., Paracetamol 500mg"
                      value={newMedicine.name}
                      onChange={(e) => setNewMedicine(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stock">Stock Quantity</Label>
                    <Input
                      id="stock"
                      type="number"
                      placeholder="150"
                      value={newMedicine.stock}
                      onChange={(e) => setNewMedicine(prev => ({ ...prev, stock: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price</Label>
                    <Input
                      id="price"
                      placeholder="$8.99"
                      value={newMedicine.price}
                      onChange={(e) => setNewMedicine(prev => ({ ...prev, price: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={newMedicine.category} onValueChange={(value) => setNewMedicine(prev => ({ ...prev, category: value }))}>
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
                    <Label htmlFor="expiry">Expiry Date</Label>
                    <Input
                      id="expiry"
                      type="date"
                      value={newMedicine.expiryDate}
                      onChange={(e) => setNewMedicine(prev => ({ ...prev, expiryDate: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="md:col-span-5 flex gap-2">
                    <Button type="submit" variant="medical">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Medicine
                    </Button>
                    <Button type="button" variant="outline">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload CSV
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Medicine List */}
            <Card>
              <CardHeader>
                <CardTitle>Current Inventory ({medicines.length} medicines)</CardTitle>
                <CardDescription>
                  Manage your medicine stock and pricing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Medicine Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {medicines.map((medicine) => (
                      <TableRow key={medicine.id}>
                        <TableCell className="font-medium">{medicine.name}</TableCell>
                        <TableCell>{medicine.category}</TableCell>
                        <TableCell>{medicine.stock}</TableCell>
                        <TableCell>{medicine.price}</TableCell>
                        <TableCell>{getStatusBadge(medicine.status)}</TableCell>
                        <TableCell>{medicine.expiryDate}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
                  Update your pharmacy details and contact information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pharmacy-name">Pharmacy Name</Label>
                    <Input
                      id="pharmacy-name"
                      value={pharmacyInfo.name}
                      onChange={(e) => setPharmacyInfo(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={pharmacyInfo.phone}
                      onChange={(e) => setPharmacyInfo(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={pharmacyInfo.address}
                    onChange={(e) => setPharmacyInfo(prev => ({ ...prev, address: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={pharmacyInfo.email}
                    onChange={(e) => setPharmacyInfo(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hours">Operating Hours</Label>
                  <Input
                    id="hours"
                    value={pharmacyInfo.hours}
                    onChange={(e) => setPharmacyInfo(prev => ({ ...prev, hours: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={pharmacyInfo.description}
                    onChange={(e) => setPharmacyInfo(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>
                <Button variant="medical">
                  Update Profile
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
                  <div className="text-3xl font-bold text-medical-blue">{medicines.length}</div>
                  <p className="text-muted-foreground text-sm">Active products</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Low Stock Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-medical-warning">
                    {medicines.filter(m => m.status === "low-stock").length}
                  </div>
                  <p className="text-muted-foreground text-sm">Need restocking</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Out of Stock</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-destructive">
                    {medicines.filter(m => m.status === "out-of-stock").length}
                  </div>
                  <p className="text-muted-foreground text-sm">Urgent attention</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};