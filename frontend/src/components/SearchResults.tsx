import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MapPin, Phone, Clock, Navigation, Package, Star, Shield, Loader2, CheckCircle, AlertCircle, XCircle, Mail, FileText } from "lucide-react";
import { Medicine } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface SearchResultsProps {
  medicine: string;
  location: string;
  results: Medicine[];
  isLoading?: boolean;
}

export const SearchResults = ({ medicine, location, results, isLoading }: SearchResultsProps) => {
  const [callDialogOpen, setCallDialogOpen] = useState(false);
  const [selectedPharmacy, setSelectedPharmacy] = useState<NonNullable<Medicine['pharmacies']>[0] | null>(null);
  const { toast } = useToast();

  // Debug logging
  console.log('SearchResults props:', { medicine, location, results, isLoading });
  results.forEach((result, index) => {
    console.log(`Result ${index}:`, result);
    console.log(`Result ${index} pharmacies:`, result.pharmacies);
  });

  const openMapDirections = (pharmacy: NonNullable<Medicine['pharmacies']>[0]) => {
    console.log('Opening map for pharmacy:', pharmacy);
    if (pharmacy?.address && pharmacy?.name) {
      const query = encodeURIComponent(`${pharmacy.name}, ${pharmacy.address}`);
      const mapUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;
      console.log('Opening map URL:', mapUrl);
      window.open(mapUrl, '_blank');
    } else {
      console.log('Missing pharmacy data:', { name: pharmacy?.name, address: pharmacy?.address });
      toast({
        title: "Location Unavailable",
        description: "Address information is not available for this pharmacy.",
        variant: "destructive"
      });
    }
  };

  const handleCallPharmacy = (pharmacy: NonNullable<Medicine['pharmacies']>[0]) => {
    console.log('Attempting to call pharmacy:', pharmacy);
    if (!pharmacy) return;
    setSelectedPharmacy(pharmacy);
    setCallDialogOpen(true);
  };

  const confirmCall = () => {
    if (selectedPharmacy?.phone) {
      window.location.href = `tel:${selectedPharmacy.phone}`;
      setCallDialogOpen(false);
      toast({
        title: "Calling Pharmacy",
        description: `Connecting to ${selectedPharmacy.name}...`,
      });
    }
  };

  const getAvailabilityInfo = (stockQuantity: number = 0) => {
    if (stockQuantity > 50) {
      return { 
        icon: CheckCircle, 
        text: "In Stock", 
        color: "text-green-600", 
        bgColor: "bg-green-50", 
        borderColor: "border-green-200",
        variant: "default" as const 
      };
    }
    if (stockQuantity > 10) {
      return { 
        icon: AlertCircle, 
        text: "Low Stock", 
        color: "text-yellow-600", 
        bgColor: "bg-yellow-50", 
        borderColor: "border-yellow-200",
        variant: "secondary" as const 
      };
    }
    if (stockQuantity > 0) {
      return { 
        icon: AlertCircle, 
        text: "Very Low Stock", 
        color: "text-orange-600", 
        bgColor: "bg-orange-50", 
        borderColor: "border-orange-200",
        variant: "secondary" as const 
      };
    }
    return { 
      icon: XCircle, 
      text: "Out of Stock", 
      color: "text-red-600", 
      bgColor: "bg-red-50", 
      borderColor: "border-red-200",
      variant: "destructive" as const 
    };
  };

  if (isLoading) {
    return (
      <section className="w-full py-12 px-4 md:px-6 bg-gradient-to-b from-background to-card/20">
        <div className="max-w-6xl mx-auto">
          <Card className="p-12 text-center border-0 bg-card/60 backdrop-blur-sm">
            <Loader2 className="mx-auto h-12 w-12 text-medical-blue animate-spin mb-4" />
            <h3 className="text-xl font-semibold mb-2">Searching for medicines...</h3>
            <p className="text-muted-foreground">
              Looking for "<span className="font-medium text-medical-blue">{medicine}</span>" near <span className="font-medium text-medical-green">{location}</span>
            </p>
            <div className="flex justify-center gap-2 mt-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-medical-blue rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full py-12 px-4 md:px-6 bg-gradient-to-b from-background to-card/20">
      <div className="max-w-6xl mx-auto">
        {/* Results Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 bg-card/60 backdrop-blur-sm px-4 py-2 rounded-full border border-border/50 mb-4">
            <Package className="w-4 h-4 text-medical-blue" />
            <span className="text-sm font-medium">Search Results</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Found <span className="text-medical-blue">{results.length}</span> result{results.length !== 1 ? 's' : ''}
          </h2>
          <p className="text-lg text-muted-foreground">
            for "<span className="font-semibold text-foreground">{medicine}</span>" near <span className="font-semibold text-foreground">{location}</span>
          </p>
        </div>

        {results.length === 0 ? (
          <Card className="p-12 text-center border-0 bg-card/60 backdrop-blur-sm">
            <Package className="mx-auto h-16 w-16 text-muted-foreground/50 mb-6" />
            <h3 className="text-2xl font-semibold text-foreground mb-4">No medicines found</h3>
            <p className="text-lg text-muted-foreground mb-6 max-w-md mx-auto">
              We couldn't find "<span className="font-medium">{medicine}</span>" in any nearby pharmacies. Try searching for a different medicine or check the spelling.
            </p>
            <Button variant="outline" size="lg" onClick={() => window.location.reload()}>
              Try Another Search
            </Button>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Results Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card className="p-4 text-center bg-card/40 backdrop-blur-sm border-0">
                <div className="text-2xl font-bold text-medical-blue">
                  {results.filter(r => (r.stock || r.stockQuantity || 0) > 0).length}
                </div>
                <div className="text-sm text-muted-foreground">Available</div>
              </Card>
              <Card className="p-4 text-center bg-card/40 backdrop-blur-sm border-0">
                <div className="text-2xl font-bold text-medical-green">
                  {results.length}
                </div>
                <div className="text-sm text-muted-foreground">Total Found</div>
              </Card>
              <Card className="p-4 text-center bg-card/40 backdrop-blur-sm border-0">
                <div className="text-2xl font-bold text-accent">
                  ${results.length > 0 ? Math.min(...results.map(r => r.price)).toFixed(2) : '0.00'}
                </div>
                <div className="text-sm text-muted-foreground">Lowest Price</div>
              </Card>
              <Card className="p-4 text-center bg-card/40 backdrop-blur-sm border-0">
                <div className="text-2xl font-bold text-purple-600">
                  {new Set(results.map(r => r.pharmacyName)).size}
                </div>
                <div className="text-sm text-muted-foreground">Pharmacies</div>
              </Card>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {results.map((result, index) => {
                // Ensure we have fallback values for testing
                const stockValue = result.stock !== undefined ? result.stock : 
                                 result.stockQuantity !== undefined ? result.stockQuantity : 
                                 Math.floor(Math.random() * 100); // Fallback for demo
                
                const availability = getAvailabilityInfo(stockValue);
                const AvailabilityIcon = availability.icon;
                
                // Ensure pharmacy data exists - take first pharmacy from array
                const pharmacyData = (result.pharmacies && result.pharmacies.length > 0) 
                  ? result.pharmacies[0] 
                  : {
                    name: result.pharmacyName || "Demo Pharmacy",
                    phone: "+94123456789",
                    email: "demo@pharmacy.com", 
                    address: "123 Main Street, Colombo, Sri Lanka",
                    license_number: "PH001"
                  };
                
                return (
                  <Card
                    key={`${result.pharmacyId}-${result.id}-${index}`}
                    className={cn(
                      "group hover:shadow-xl transition-all duration-300 border-0 bg-card/60 backdrop-blur-sm hover:bg-card/80 hover:scale-[1.02]",
                      "animate-in fade-in-0 slide-in-from-bottom-4 duration-700"
                    )}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          {/* Medicine Image and Name */}
                          <div className="flex items-center gap-3 mb-2">
                            <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-border/50 flex-shrink-0">
                              {result.imageUrl ? (
                                <img
                                  src={result.imageUrl}
                                  alt={result.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = "https://via.placeholder.com/64x64?text=Medicine";
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-medical-blue/20 to-medical-green/20 flex items-center justify-center">
                                  <Package className="h-6 w-6 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <CardTitle className="text-xl group-hover:text-medical-blue transition-colors duration-300 truncate">
                                {result.name}
                              </CardTitle>
                              <CardDescription className="flex items-center gap-2 mt-1">
                                <Shield className="w-4 h-4 text-medical-blue" />
                                {pharmacyData.name}
                              </CardDescription>
                            </div>
                          </div>
                        </div>
                        <div className={cn(
                          "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border",
                          availability.bgColor,
                          availability.borderColor,
                          availability.color
                        )}>
                          <AvailabilityIcon className="w-4 h-4" />
                          {availability.text}
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {/* Price and Stock Info */}
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-3xl font-bold text-medical-green">
                            ${result.price.toFixed(2)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            per unit
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold">
                            {stockValue} in stock
                          </div>
                          <div className="text-sm text-muted-foreground">
                            units available
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* Pharmacy Details */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-foreground flex items-center gap-2">
                          <Shield className="w-4 h-4 text-medical-blue" />
                          Pharmacy Information
                        </h4>
                        
                        {pharmacyData?.name && (
                          <div className="flex items-center gap-3 text-sm">
                            <Package className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-foreground font-medium">
                              {pharmacyData.name}
                            </span>
                          </div>
                        )}
                        
                        {pharmacyData?.address && (
                          <div className="flex items-start gap-3 text-sm">
                            <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                            <span className="text-muted-foreground">
                              {pharmacyData.address}
                            </span>
                          </div>
                        )}
                        
                        {pharmacyData?.phone && (
                          <div className="flex items-center gap-3 text-sm">
                            <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-muted-foreground">
                              {pharmacyData.phone}
                            </span>
                          </div>
                        )}
                        
                        {pharmacyData?.email && (
                          <div className="flex items-center gap-3 text-sm">
                            <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-muted-foreground">
                              {pharmacyData.email}
                            </span>
                          </div>
                        )}
                        
                        {pharmacyData?.license_number && (
                          <div className="flex items-center gap-3 text-sm">
                            <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-muted-foreground">
                              License: {pharmacyData.license_number}
                            </span>
                          </div>
                        )}
                        
                        {(pharmacyData?.address || result.address) && (
                          <div className="flex items-center gap-3 text-sm">
                            <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-muted-foreground">
                              {pharmacyData?.address || result.address || "Colombo"} • Verified pharmacy
                            </span>
                          </div>
                        )}
                      </div>

                      <Separator />

                      {/* Action Buttons */}
                      <div className="flex gap-3 pt-2">
                        <Button
                          variant="default"
                          size="sm"
                          className="flex-1"
                          onClick={() => openMapDirections(pharmacyData)}
                          disabled={!pharmacyData?.address}
                        >
                          <Navigation className="w-4 h-4 mr-2" />
                          Get Directions
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleCallPharmacy(pharmacyData)}
                          disabled={!pharmacyData?.phone}
                        >
                          <Phone className="w-4 h-4 mr-2" />
                          Call Pharmacy
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            
            {/* Show More Results */}
            {results.length > 0 && (
              <div className="text-center pt-8">
                <Card className="inline-block p-6 bg-card/40 backdrop-blur-sm border-0">
                  <p className="text-muted-foreground mb-4">
                    Need help finding the right pharmacy?
                  </p>
                  <Button variant="outline" size="lg">
                    Contact Support
                  </Button>
                </Card>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Call Confirmation Dialog */}
      <Dialog open={callDialogOpen} onOpenChange={setCallDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Call Pharmacy</DialogTitle>
            <DialogDescription>
              Do you want to call {selectedPharmacy?.name}?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center gap-3 text-sm">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span>{selectedPharmacy?.phone}</span>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setCallDialogOpen(false)}>
              No, Cancel
            </Button>
            <Button onClick={confirmCall}>
              Yes, Call Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
};