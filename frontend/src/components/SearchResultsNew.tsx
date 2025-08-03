import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Clock, Navigation, Package } from "lucide-react";

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

interface SearchResultsProps {
  medicine: string;
  location: string;
  results: Medicine[];
  isLoading?: boolean;
}

export const SearchResults = ({ medicine, location, results, isLoading }: SearchResultsProps) => {
  const getAvailabilityBadge = (stockQuantity: number) => {
    if (stockQuantity > 50) return { variant: "default" as const, text: "In Stock", color: "bg-green-100 text-green-800" };
    if (stockQuantity > 10) return { variant: "secondary" as const, text: "Low Stock", color: "bg-yellow-100 text-yellow-800" };
    return { variant: "destructive" as const, text: "Out of Stock", color: "bg-red-100 text-red-800" };
  };

  if (isLoading) {
    return (
      <section className="w-full py-12 px-6 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <p className="text-lg text-muted-foreground">Searching for {medicine} near {location}...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full py-12 px-6 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Search Results for "{medicine}"
          </h2>
          <p className="text-muted-foreground">
            Found {results.length} result{results.length !== 1 ? 's' : ''} near {location}
          </p>
        </div>

        {results.length === 0 ? (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No medicines found</h3>
            <p className="text-muted-foreground">
              We couldn't find "{medicine}" in any nearby pharmacies. Try searching for a different medicine or check the spelling.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {results.map((med) => {
              const availability = getAvailabilityBadge(med.stockQuantity);
              
              return (
                <Card key={med.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg text-foreground">{med.name}</h3>
                        <p className="text-sm text-muted-foreground">{med.description}</p>
                      </div>
                      <Badge className={availability.color}>
                        {availability.text}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Package className="w-4 h-4 mr-2" />
                        <span>Category: {med.category}</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span>{med.pharmacyName}</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Navigation className="w-4 h-4 mr-2" />
                        <span>{med.location}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t">
                      <div>
                        <span className="text-2xl font-bold text-primary">${med.price}</span>
                        <span className="text-sm text-muted-foreground ml-2">Stock: {med.stockQuantity}</span>
                      </div>
                      <Button 
                        className="bg-primary hover:bg-primary/90"
                        disabled={!med.isAvailable || med.stockQuantity === 0}
                      >
                        {med.isAvailable && med.stockQuantity > 0 ? 'Get Directions' : 'Unavailable'}
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
