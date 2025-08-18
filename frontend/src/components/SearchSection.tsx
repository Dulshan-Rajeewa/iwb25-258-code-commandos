import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Globe, Zap, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchSectionProps {
  onSearch: (medicine: string, location: string) => void;
  isLoading?: boolean;
}

export const SearchSection = ({ onSearch, isLoading = false }: SearchSectionProps) => {
  const [medicine, setMedicine] = useState("");
  const [useAutoLocation, setUseAutoLocation] = useState(true);
  const [country, setCountry] = useState("");
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const handleSearch = () => {
    const location = useAutoLocation 
      ? "Auto-detected location" 
      : `${city}, ${province}, ${country}`;
    onSearch(medicine, location);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && medicine.trim()) {
      handleSearch();
    }
  };

  const popularMedicines = [
    "Paracetamol", "Aspirin", "Ibuprofen", "Amoxicillin", "Omeprazole", 
    "Metformin", "Atorvastatin", "Lisinopril", "Cetirizine"
  ];

  return (
    <section id="search-section" className="w-full bg-gradient-to-br from-medical-light/30 via-background/80 to-medical-green/20 py-16 md:py-20 px-4 md:px-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <div className="absolute top-10 right-10 w-40 h-40 bg-medical-blue/10 rounded-full blur-2xl animate-pulse" />
      <div className="absolute bottom-10 left-10 w-32 h-32 bg-medical-green/10 rounded-full blur-xl animate-pulse delay-1000" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center gap-2 bg-card/60 backdrop-blur-sm px-4 py-2 rounded-full border border-border/50 mb-6">
            <Target className="w-4 h-4 text-medical-blue" />
            <span className="text-sm font-medium">Smart Medicine Search</span>
          </div>
          
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-foreground leading-tight">
            Find Your Medicine
            <span className="block text-2xl md:text-3xl font-normal text-muted-foreground mt-2">
              Search from <span className="text-medical-blue font-semibold">50,000+</span> medicines across <span className="text-medical-green font-semibold">1,500+</span> verified pharmacies
            </span>
          </h2>
        </div>
        
        <Card className={cn(
          "p-6 md:p-10 shadow-2xl bg-card/90 backdrop-blur-md border-0 transition-all duration-500 relative overflow-hidden",
          "before:absolute before:inset-0 before:bg-gradient-to-r before:from-medical-blue/5 before:to-medical-green/5 before:rounded-lg"
        )}>
          <div className="space-y-8 relative z-10">
            {/* Medicine Search */}
            <div className="space-y-4">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Search className="w-4 h-4" />
                What medicine are you looking for?
              </label>
              <div className={cn(
                "relative group transition-all duration-300",
                isSearchFocused && "scale-[1.02]"
              )}>
                <Search className={cn(
                  "absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors duration-300",
                  isSearchFocused ? "text-medical-blue" : "text-muted-foreground"
                )} />
                <Input
                  placeholder="Enter medicine name (e.g., Paracetamol, Aspirin, Amoxicillin)"
                  value={medicine}
                  onChange={(e) => setMedicine(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  onKeyPress={handleKeyPress}
                  className={cn(
                    "pl-12 pr-4 py-4 md:py-6 text-base md:text-lg border-2 rounded-xl transition-all duration-300",
                    "focus:border-medical-blue focus:shadow-glow-blue",
                    "placeholder:text-muted-foreground/70"
                  )}
                />
                {medicine && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <Badge variant="secondary" className="bg-medical-blue/20 text-medical-blue border-0">
                      <Zap className="w-3 h-3 mr-1" />
                      Ready
                    </Badge>
                  </div>
                )}
              </div>
              
              {/* Popular medicines suggestions */}
              <div className="flex flex-wrap gap-2">
                <span className="text-xs text-muted-foreground self-center mr-2">Popular:</span>
                {popularMedicines.slice(0, 6).map((med) => (
                  <Button
                    key={med}
                    variant="outline"
                    size="sm"
                    className="h-7 px-3 text-xs hover:bg-medical-blue/10 hover:border-medical-blue/30 transition-all duration-300"
                    onClick={() => setMedicine(med)}
                  >
                    {med}
                  </Button>
                ))}
              </div>
            </div>

            {/* Location Section */}
            <div className="space-y-6">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Where should we search?
              </label>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <div className={cn(
                  "flex-1 p-4 rounded-xl border-2 cursor-pointer transition-all duration-300",
                  useAutoLocation 
                    ? "border-medical-blue bg-medical-blue/5" 
                    : "border-border hover:border-border/80"
                )}>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="location"
                      checked={useAutoLocation}
                      onChange={() => setUseAutoLocation(true)}
                      className="mt-1 text-medical-blue focus:ring-medical-blue"
                    />
                    <div>
                      <div className="flex items-center gap-2 font-medium">
                        <MapPin className="w-4 h-4 text-medical-blue" />
                        Use my current location
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Get instant results for nearby pharmacies
                      </p>
                    </div>
                  </label>
                </div>
                
                <div className={cn(
                  "flex-1 p-4 rounded-xl border-2 cursor-pointer transition-all duration-300",
                  !useAutoLocation 
                    ? "border-medical-green bg-medical-green/5" 
                    : "border-border hover:border-border/80"
                )}>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="location"
                      checked={!useAutoLocation}
                      onChange={() => setUseAutoLocation(false)}
                      className="mt-1 text-medical-green focus:ring-medical-green"
                    />
                    <div>
                      <div className="flex items-center gap-2 font-medium">
                        <Globe className="w-4 h-4 text-medical-green" />
                        Select manually
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Choose specific city or region
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {!useAutoLocation && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in slide-in-from-top-4 duration-500">
                  <Select value={country} onValueChange={setCountry}>
                    <SelectTrigger className="h-12 border-2 hover:border-border/80 transition-colors">
                      <SelectValue placeholder="Select Country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="usa">🇺🇸 United States</SelectItem>
                      <SelectItem value="canada">🇨🇦 Canada</SelectItem>
                      <SelectItem value="uk">🇬🇧 United Kingdom</SelectItem>
                      <SelectItem value="germany">🇩🇪 Germany</SelectItem>
                      <SelectItem value="france">🇫🇷 France</SelectItem>
                      <SelectItem value="australia">🇦🇺 Australia</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={province} onValueChange={setProvince} disabled={!country}>
                    <SelectTrigger className="h-12 border-2 hover:border-border/80 transition-colors">
                      <SelectValue placeholder="Select Province/State" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ontario">Ontario</SelectItem>
                      <SelectItem value="quebec">Quebec</SelectItem>
                      <SelectItem value="california">California</SelectItem>
                      <SelectItem value="texas">Texas</SelectItem>
                      <SelectItem value="london">London</SelectItem>
                      <SelectItem value="bavaria">Bavaria</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={city} onValueChange={setCity} disabled={!province}>
                    <SelectTrigger className="h-12 border-2 hover:border-border/80 transition-colors">
                      <SelectValue placeholder="Select City" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="toronto">Toronto</SelectItem>
                      <SelectItem value="montreal">Montreal</SelectItem>
                      <SelectItem value="los-angeles">Los Angeles</SelectItem>
                      <SelectItem value="houston">Houston</SelectItem>
                      <SelectItem value="london">London</SelectItem>
                      <SelectItem value="munich">Munich</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Search Button */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button 
                onClick={handleSearch}
                variant="medical"
                size="lg"
                className={cn(
                  "px-8 md:px-12 py-4 md:py-6 text-base md:text-lg font-semibold rounded-xl",
                  "shadow-glow-medical hover:shadow-glow-blue transition-all duration-300",
                  "hover:scale-105 active:scale-95",
                  (!medicine.trim() || isLoading) && "opacity-50 cursor-not-allowed"
                )}
                disabled={!medicine.trim() || isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-5 w-5" />
                    Search Pharmacies
                  </>
                )}
              </Button>
              
              {isLoading ? (
                <div className="flex items-center justify-center gap-2 text-sm text-medical-blue animate-in fade-in-0 duration-500">
                  <div className="w-2 h-2 bg-medical-blue rounded-full animate-pulse" />
                  Searching for "{medicine}" - Results will appear below...
                </div>
              ) : (
                medicine.trim() && (
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground animate-in fade-in-0 duration-500">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    Ready to search for "{medicine}"
                  </div>
                )
              )}
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};