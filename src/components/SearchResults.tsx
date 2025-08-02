import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Clock, Navigation } from "lucide-react";

interface Pharmacy {
  id: string;
  name: string;
  address: string;
  phone: string;
  distance: string;
  availability: "in-stock" | "low-stock" | "out-of-stock";
  hours: string;
  price?: string;
}

interface SearchResultsProps {
  medicine: string;
  location: string;
  results: Pharmacy[];
}

const mockResults: Pharmacy[] = [
  {
    id: "1",
    name: "HealthPlus Pharmacy",
    address: "123 Main Street, Downtown",
    phone: "+1 (555) 123-4567",
    distance: "0.3 km",
    availability: "in-stock",
    hours: "Open until 9:00 PM",
    price: "$8.99"
  },
  {
    id: "2",
    name: "Care Point Pharmacy",
    address: "456 Oak Avenue, Central Plaza",
    phone: "+1 (555) 234-5678",
    distance: "0.8 km",
    availability: "low-stock",
    hours: "Open 24 hours",
    price: "$9.50"
  },
  {
    id: "3",
    name: "MediCare Express",
    address: "789 Pine Road, Medical Center",
    phone: "+1 (555) 345-6789",
    distance: "1.2 km",
    availability: "in-stock",
    hours: "Open until 10:00 PM",
    price: "$8.75"
  },
  {
    id: "4",
    name: "Quick Relief Pharmacy",
    address: "321 Elm Street, Shopping District",
    phone: "+1 (555) 456-7890",
    distance: "1.5 km",
    availability: "out-of-stock",
    hours: "Open until 8:00 PM"
  }
];

const getAvailabilityColor = (availability: string) => {
  switch (availability) {
    case "in-stock":
      return "bg-medical-success text-white";
    case "low-stock":
      return "bg-medical-warning text-white";
    case "out-of-stock":
      return "bg-destructive text-destructive-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const getAvailabilityText = (availability: string) => {
  switch (availability) {
    case "in-stock":
      return "In Stock";
    case "low-stock":
      return "Low Stock";
    case "out-of-stock":
      return "Out of Stock";
    default:
      return "Unknown";
  }
};

export const SearchResults = ({ medicine, location }: SearchResultsProps) => {
  return (
    <section className="w-full py-8 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h3 className="text-2xl font-bold mb-2">
            Results for "{medicine}"
          </h3>
          <p className="text-muted-foreground flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Near {location} • {mockResults.filter(r => r.availability !== "out-of-stock").length} pharmacies have this medicine
          </p>
        </div>

        <div className="grid gap-4">
          {mockResults.map((pharmacy) => (
            <Card key={pharmacy.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-lg font-semibold text-foreground">{pharmacy.name}</h4>
                      <p className="text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="h-4 w-4" />
                        {pharmacy.address}
                      </p>
                    </div>
                    <Badge className={getAvailabilityColor(pharmacy.availability)}>
                      {getAvailabilityText(pharmacy.availability)}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Navigation className="h-4 w-4" />
                      {pharmacy.distance} away
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      {pharmacy.phone}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {pharmacy.hours}
                    </span>
                    {pharmacy.price && (
                      <span className="font-semibold text-medical-blue">
                        {pharmacy.price}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Navigation className="h-4 w-4 mr-1" />
                    Directions
                  </Button>
                  <Button variant="outline" size="sm">
                    <Phone className="h-4 w-4 mr-1" />
                    Call
                  </Button>
                  {pharmacy.availability !== "out-of-stock" && (
                    <Button variant="medical" size="sm">
                      Reserve
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-muted-foreground text-sm">
            Don't see your pharmacy? <Button variant="link" className="p-0 h-auto text-sm">Suggest a pharmacy</Button>
          </p>
        </div>
      </div>
    </section>
  );
};