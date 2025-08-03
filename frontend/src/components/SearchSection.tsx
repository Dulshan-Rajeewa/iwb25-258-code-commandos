import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Search, MapPin } from "lucide-react";

interface SearchSectionProps {
  onSearch: (medicine: string, location: string) => void;
}

export const SearchSection = ({ onSearch }: SearchSectionProps) => {
  const [medicine, setMedicine] = useState("");
  const [useAutoLocation, setUseAutoLocation] = useState(true);
  const [country, setCountry] = useState("");
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");

  const handleSearch = () => {
    const location = useAutoLocation 
      ? "Auto-detected location" 
      : `${city}, ${province}, ${country}`;
    onSearch(medicine, location);
  };

  return (
    <section className="w-full bg-gradient-to-br from-medical-light to-background py-16 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl font-bold mb-4 text-foreground">
          Find Your Medicine
          <span className="block text-2xl font-normal text-muted-foreground mt-2">
            Quickly locate nearby pharmacies with your needed medication in stock
          </span>
        </h2>
        
        <Card className="p-8 mt-8 shadow-card bg-card">
          <div className="space-y-6">
            {/* Medicine Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Enter medicine name (e.g., Paracetamol, Aspirin)"
                value={medicine}
                onChange={(e) => setMedicine(e.target.value)}
                className="pl-10 py-6 text-lg border-2 focus:border-primary"
              />
            </div>

            {/* Location Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    id="auto-location"
                    name="location"
                    checked={useAutoLocation}
                    onChange={() => setUseAutoLocation(true)}
                    className="text-primary"
                  />
                  <label htmlFor="auto-location" className="text-sm font-medium">
                    <MapPin className="inline h-4 w-4 mr-1" />
                    Use my current location
                  </label>
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    id="manual-location"
                    name="location"
                    checked={!useAutoLocation}
                    onChange={() => setUseAutoLocation(false)}
                    className="text-primary"
                  />
                  <label htmlFor="manual-location" className="text-sm font-medium">
                    Select manually
                  </label>
                </div>
              </div>

              {!useAutoLocation && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Select value={country} onValueChange={setCountry}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="usa">United States</SelectItem>
                      <SelectItem value="canada">Canada</SelectItem>
                      <SelectItem value="uk">United Kingdom</SelectItem>
                      <SelectItem value="germany">Germany</SelectItem>
                      <SelectItem value="france">France</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={province} onValueChange={setProvince}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Province/State" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ontario">Ontario</SelectItem>
                      <SelectItem value="quebec">Quebec</SelectItem>
                      <SelectItem value="california">California</SelectItem>
                      <SelectItem value="texas">Texas</SelectItem>
                      <SelectItem value="london">London</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={city} onValueChange={setCity}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select City" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="toronto">Toronto</SelectItem>
                      <SelectItem value="montreal">Montreal</SelectItem>
                      <SelectItem value="los-angeles">Los Angeles</SelectItem>
                      <SelectItem value="houston">Houston</SelectItem>
                      <SelectItem value="london">London</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <Button 
              onClick={handleSearch}
              variant="medical"
              size="lg"
              className="w-full md:w-auto px-12 py-6 text-lg"
              disabled={!medicine.trim()}
            >
              <Search className="mr-2 h-5 w-5" />
              Search Pharmacies
            </Button>
          </div>
        </Card>
      </div>
    </section>
  );
};