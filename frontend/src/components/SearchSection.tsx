import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Globe, Zap, Target, Loader2, CheckCircle, AlertCircle, Navigation } from "lucide-react";
import { cn } from "@/lib/utils";
import { api, type Country, type State, type CityName, type LocationSearchParams } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface SearchSectionProps {
  onSearch: (medicine: string, location: string) => void;
  isLoading?: boolean;
}

export const SearchSection = ({ onSearch, isLoading = false }: SearchSectionProps) => {
  const { toast } = useToast();
  const [medicine, setMedicine] = useState("");
  const [useAutoLocation, setUseAutoLocation] = useState(true);
  const [country, setCountry] = useState("");
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  // Location data states
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<CityName[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  
  // Enhanced location states
  const [currentLocation, setCurrentLocation] = useState<{
    country: string;
    state: string;
    city: string;
    address?: string;
    coordinates?: { lat: number; lng: number };
  } | null>(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Load countries on component mount
  useEffect(() => {
    const loadCountries = async () => {
      try {
        setIsLoadingLocations(true);
        const response = await api.getCountries();
        console.log('📄 Countries API response:', response);
        
        if (response.success && response.data?.data) {
          const countriesData = response.data.data;
          console.log('🌍 Countries data:', countriesData);
          
          // Handle different data formats
          if (Array.isArray(countriesData)) {
            // Check if it's already in the correct format
            if (countriesData.length > 0 && typeof countriesData[0] === 'object' && countriesData[0].country) {
              setCountries(countriesData);
            } else if (countriesData.length > 0 && typeof countriesData[0] === 'string') {
              // Convert string array to object array
              const formattedCountries = countriesData.map(countryName => ({ country: countryName }));
              setCountries(formattedCountries);
            } else {
              console.log('❌ Countries data is not in expected format:', countriesData);
              setCountries([]);
            }
          } else {
            console.log('❌ Countries data is not an array:', countriesData);
            setCountries([]);
          }
        } else {
          console.log('❌ Invalid response structure:', response);
          setCountries([]);
        }
      } catch (error) {
        console.error('Failed to load countries:', error);
        setCountries([]);
      } finally {
        setIsLoadingLocations(false);
        console.log('🏁 Countries loading finished');
      }
    };

    loadCountries();
  }, []);

  // Load states when country changes
  useEffect(() => {
    const loadStates = async () => {
      if (!country) {
        setStates([]);
        setProvince("");
        setCities([]);
        setCity("");
        return;
      }

      try {
        setIsLoadingLocations(true);
        console.log('🔍 Loading states for country:', country);
        const response = await api.getStates(country);
        console.log('📄 States API response:', response);
        
        if (response.success && response.data) {
          console.log('🌍 States data structure:', response.data);
          if (response.data.data?.states) {
            console.log('✅ Found states:', response.data.data.states);
            setStates(response.data.data.states);
          } else if (response.data.states) {
            console.log('✅ Found states (alternative structure):', response.data.states);
            setStates(response.data.states);
          } else {
            console.log('❌ No states found in response');
            setStates([]);
          }
        } else {
          console.log('❌ Invalid states response structure:', response);
          setStates([]);
        }
        setProvince("");
        setCities([]);
        setCity("");
      } catch (error) {
        console.error('Failed to load states:', error);
        setStates([]);
      } finally {
        setIsLoadingLocations(false);
      }
    };

    if (!useAutoLocation && country) {
      loadStates();
    }
  }, [country, useAutoLocation]);

  // Load cities when state changes
  useEffect(() => {
    const loadCities = async () => {
      if (!country || !province) {
        setCities([]);
        setCity("");
        return;
      }

      try {
        setIsLoadingLocations(true);
        const response = await api.getCities(country, province);
        if (response.success && response.data?.data) {
          setCities(response.data.data);
        } else {
          setCities([]);
        }
        setCity("");
      } catch (error) {
        console.error('Failed to load cities:', error);
        setCities([]);
      } finally {
        setIsLoadingLocations(false);
      }
    };

    if (!useAutoLocation && country && province) {
      loadCities();
    }
  }, [province, country, useAutoLocation]);

  // Enhanced geolocation function
  const detectCurrentLocation = async () => {
    if (!navigator.geolocation) {
      const errorMsg = "Geolocation is not supported by this browser.";
      setLocationError(errorMsg);
      toast({
        variant: "destructive",
        title: "Location Error",
        description: errorMsg,
      });
      return;
    }

    setIsDetectingLocation(true);
    setLocationError(null);
    
    toast({
      title: "🌍 Detecting Location",
      description: "Please wait while we detect your location...",
    });

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 minutes
          }
        );
      });

      const { latitude, longitude } = position.coords;
      
      // Use reverse geocoding to get location details
      try {
        // Using a free geocoding service (OpenStreetMap Nominatim)
        const geocodingUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`;
        
        const geoResponse = await fetch(geocodingUrl);
        if (geoResponse.ok) {
          const geoData = await geoResponse.json();
          const address = geoData.address;
          
          const detectedLocation = {
            country: address.country || address.country_code?.toUpperCase() || "Unknown",
            state: address.state || address.region || address.county || "Unknown",
            city: address.city || address.town || address.village || address.suburb || "Unknown",
            address: geoData.display_name,
            coordinates: { lat: latitude, lng: longitude }
          };
          
          setCurrentLocation(detectedLocation);
          toast({
            title: "📍 Location Detected",
            description: `Location detected: ${detectedLocation.city}, ${detectedLocation.state}, ${detectedLocation.country}`,
          });
          
        } else {
          throw new Error("Geocoding failed");
        }
      } catch (geoError) {
        // Fallback to coordinates only
        const fallbackLocation = {
          country: "Unknown Location",
          state: "Unknown State", 
          city: "Unknown City",
          address: `Coordinates: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
          coordinates: { lat: latitude, lng: longitude }
        };
        
        setCurrentLocation(fallbackLocation);
        toast({
          title: "📍 Location Detected",
          description: `Location detected (coordinates: ${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
        });
      }
      
    } catch (error) {
      let errorMessage = "Failed to detect location. ";
      
      if (error instanceof GeolocationPositionError) {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied. Please enable location permissions.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable. Please try again.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location detection timed out. Please try again.";
            break;
        }
      }
      
      setLocationError(errorMessage);
      toast({
        variant: "destructive",
        title: "Location Error",
        description: errorMessage,
      });
    } finally {
      setIsDetectingLocation(false);
    }
  };

  // Enhanced search handler with location-based search
  const handleSearch = async () => {
    if (!medicine.trim()) {
      toast({
        variant: "destructive",
        title: "Medicine Required",
        description: "Please enter a medicine name to search",
      });
      return;
    }

    if (useAutoLocation) {
      if (!currentLocation) {
        toast({
          variant: "destructive",
          title: "Location Required",
          description: "Please detect your location first or switch to manual location selection",
        });
        return;
      }
      
      // Use current location for search - let Index.tsx handle the actual search
      const location = currentLocation.address || `${currentLocation.city}, ${currentLocation.state}, ${currentLocation.country}`;
      onSearch(medicine, location);
      
    } else {
      // Manual location selection
      if (!country || !province || !city) {
        toast({
          variant: "destructive",
          title: "Location Selection Required",
          description: "Please select country, state/province, and city for location-based search",
        });
        return;
      }
      
      // Pass the selected location to Index.tsx for proper location-based search
      const location = `${city}, ${province}, ${country}`;
      onSearch(medicine, location);
    }
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
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 font-medium">
                          <MapPin className="w-4 h-4 text-medical-blue" />
                          Use my current location
                        </div>
                        {useAutoLocation && (
                          <div className="flex items-center gap-2">
                            {currentLocation && (
                              <Badge variant="secondary" className="bg-green-500/20 text-green-700 border-0">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Detected
                              </Badge>
                            )}
                            {locationError && (
                              <Badge variant="secondary" className="bg-red-500/20 text-red-700 border-0">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                Error
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Get instant results for nearby pharmacies
                      </p>
                      {useAutoLocation && (
                        <div className="mt-3 space-y-2">
                          {currentLocation && (
                            <div className="p-2 bg-green-50 rounded-lg border border-green-200">
                              <p className="text-xs font-medium text-green-800">📍 Current Location:</p>
                              <p className="text-xs text-green-700">{currentLocation.city}, {currentLocation.state}, {currentLocation.country}</p>
                            </div>
                          )}
                          {locationError && (
                            <div className="p-2 bg-red-50 rounded-lg border border-red-200">
                              <p className="text-xs text-red-700">{locationError}</p>
                            </div>
                          )}
                          <Button 
                            type="button"
                            onClick={detectCurrentLocation}
                            disabled={isDetectingLocation}
                            size="sm"
                            variant="outline"
                            className={cn(
                              "w-full h-8 text-xs border-medical-blue text-medical-blue hover:bg-medical-blue hover:text-white transition-colors",
                              isDetectingLocation && "opacity-50 cursor-not-allowed"
                            )}
                          >
                            {isDetectingLocation ? (
                              <>
                                <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                                Detecting...
                              </>
                            ) : (
                              <>
                                <Navigation className="w-3 h-3 mr-2" />
                                {currentLocation ? 'Update Location' : 'Detect Location'}
                              </>
                            )}
                          </Button>
                        </div>
                      )}
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
                  <Select value={country} onValueChange={setCountry} disabled={isLoadingLocations}>
                    <SelectTrigger className="h-12 border-2 hover:border-border/80 transition-colors">
                      <SelectValue placeholder={isLoadingLocations ? "Loading countries..." : "Select Country"} />
                    </SelectTrigger>
                    <SelectContent>
                      {(() => {
                        console.log('🔍 Rendering countries dropdown, countries:', countries);
                        console.log('🔍 Countries is array:', Array.isArray(countries));
                        console.log('🔍 Countries length:', countries.length);
                        return null;
                      })()}
                      {countries.map((countryItem) => {
                        const countryValue = countryItem?.country || '';
                        if (!countryValue) {
                          console.warn('⚠️ Empty country value for item:', countryItem);
                          return null;
                        }
                        return (
                          <SelectItem key={countryValue} value={countryValue}>
                            {countryValue}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>

                  <Select 
                    value={province} 
                    onValueChange={setProvince} 
                    disabled={!country || isLoadingLocations}
                  >
                    <SelectTrigger className="h-12 border-2 hover:border-border/80 transition-colors">
                      <SelectValue placeholder={
                        !country 
                          ? "Select country first" 
                          : isLoadingLocations 
                            ? "Loading states..." 
                            : "Select Province/State"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {states.map((state) => {
                        const stateName = state?.name || '';
                        if (!stateName) {
                          console.warn('⚠️ Empty state name for item:', state);
                          return null;
                        }
                        return (
                          <SelectItem key={stateName} value={stateName}>
                            {stateName}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>

                  <Select 
                    value={city} 
                    onValueChange={setCity} 
                    disabled={!province || isLoadingLocations}
                  >
                    <SelectTrigger className="h-12 border-2 hover:border-border/80 transition-colors">
                      <SelectValue placeholder={
                        !province 
                          ? "Select state/province first" 
                          : isLoadingLocations 
                            ? "Loading cities..." 
                            : "Select City"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((cityItem) => {
                        const cityName = cityItem || '';
                        if (!cityName || cityName.trim() === '') {
                          console.warn('⚠️ Empty city name for item:', cityItem);
                          return null;
                        }
                        return (
                          <SelectItem key={cityName} value={cityName}>
                            {cityName}
                          </SelectItem>
                        );
                      })}
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