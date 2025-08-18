import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { SearchSection } from "@/components/SearchSection";
import { SearchResults } from "@/components/SearchResults";
import { PharmacyAuth } from "@/components/PharmacyAuth";
import { PharmacyDashboard } from "@/components/PharmacyDashboard";
import ThemeTransitionWrapper from "@/components/ThemeTransitionWrapper";
import { useTheme } from "@/hooks/useTheme";
import { api, Medicine } from "@/lib/api";
import medicalBg from "@/assets/medical-background.jpg";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Shield, MapPin, Clock, Users, Star, ChevronRight, Pill, Search, Activity, ArrowDown, Zap } from "lucide-react";

const Index = () => {
  const { theme } = useTheme();
  const { toast } = useToast();
  const [showPharmacyAuth, setShowPharmacyAuth] = useState(false);
  const [isPharmacyLoggedIn, setIsPharmacyLoggedIn] = useState(false);
  const [pharmacyInfo, setPharmacyInfo] = useState({
    name: "",
    profile_image: "",
    email: "",
    phone: "",
    address: ""  // Changed from location to address
  });
  const [searchResults, setSearchResults] = useState<{ medicine: string; location: string; medicines: Medicine[] } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check for existing login on component mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userType = localStorage.getItem('userType');
    
    if (token && userType === 'pharmacy') {
      setIsPharmacyLoggedIn(true);
      loadPharmacyInfo(token);
    }
  }, []);

  const loadPharmacyInfo = async (token: string) => {
    try {
      const response = await api.getPharmacyInfo(token);
      if (response.success && response.pharmacy) {
        setPharmacyInfo({
          name: response.pharmacy.name || "",
          profile_image: response.pharmacy.profile_image || "",
          email: response.pharmacy.email || "",
          phone: response.pharmacy.phone || "",
          address: response.pharmacy.address || ""  // Changed to address
        });
      }
    } catch (error) {
      console.error('Failed to load pharmacy info:', error);
    }
  };

  const handleSearch = async (medicine: string, location: string) => {
    setIsLoading(true);
    try {
      const response = await api.searchMedicines(medicine, location);
      setSearchResults({ medicine, location, medicines: response.medicines || [] });
      
      // Show success toast
      toast({
        title: "Search Completed",
        description: `Found ${response.medicines?.length || 0} results for "${medicine}"`,
      });
      
      // Automatically scroll to search results after a short delay to ensure they're rendered
      setTimeout(() => {
        scrollToSearchResults();
      }, 300);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults({ medicine, location, medicines: [] });
      
      // Show error toast
      toast({
        title: "Search Failed",
        description: "Unable to search at the moment. Showing empty results.",
        variant: "destructive",
      });
      
      // Still scroll to show the "no results" message
      setTimeout(() => {
        scrollToSearchResults();
      }, 300);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePharmacyLogin = () => {
    setIsPharmacyLoggedIn(true);
    setShowPharmacyAuth(false);
    // Reload pharmacy info
    const token = localStorage.getItem('authToken');
    if (token) {
      loadPharmacyInfo(token);
    }
  };

  const handlePharmacyLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userType');
    localStorage.removeItem('userId');
    setIsPharmacyLoggedIn(false);
    setPharmacyInfo({ name: "", profile_image: "", email: "", phone: "", address: "" });
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };

  if (isPharmacyLoggedIn) {
    return (
      <ThemeTransitionWrapper>
        <PharmacyDashboard onLogout={handlePharmacyLogout} />
      </ThemeTransitionWrapper>
    );
  }

  // Dynamic background based on theme
  const getBackgroundStyle = () => {
    const baseStyle = {
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed' as const
    };

    switch (theme) {
      case 'medical':
        return {
          ...baseStyle,
          backgroundImage: `linear-gradient(
            135deg, 
            hsl(var(--medical-light) / 0.95), 
            hsl(var(--background) / 0.90)
          ), url(${medicalBg})`,
        };
      case 'dark':
        return {
          ...baseStyle,
          backgroundImage: `linear-gradient(
            135deg, 
            hsl(var(--background) / 0.98), 
            hsl(var(--card) / 0.95)
          ), url(${medicalBg})`,
        };
      default:
        return {
          ...baseStyle,
          backgroundImage: `linear-gradient(
            rgba(255, 255, 255, 0.95), 
            rgba(255, 255, 255, 0.90)
          ), url(${medicalBg})`,
        };
    }
  };

  const scrollToSearch = () => {
    const searchElement = document.getElementById('search-section');
    if (searchElement) {
      searchElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start',
        inline: 'nearest' 
      });
    }
  };

  const scrollToSearchResults = () => {
    const searchResultsElement = document.getElementById('search-results');
    if (searchResultsElement) {
      // Add a slight offset to provide better visual context
      const elementPosition = searchResultsElement.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - 80; // 80px offset from top
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const scrollToFeatures = () => {
    const featuresElement = document.getElementById('features-section');
    if (featuresElement) {
      featuresElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  };

  return (
    <ThemeTransitionWrapper>
      <div 
        className={cn(
          "min-h-screen bg-background relative transition-all duration-500",
          theme === 'medical' && "bg-gradient-to-br from-medical-light to-background"
        )}
        style={getBackgroundStyle()}
      >
        <Header 
          onPharmacyClick={() => setShowPharmacyAuth(true)} 
          isPharmacyLoggedIn={isPharmacyLoggedIn}
          pharmacyInfo={pharmacyInfo}
          onPharmacyLogout={handlePharmacyLogout}
        />
        
        <main className="relative">
          {/* Compact Hero Section with Immediate CTA */}
          <section className="relative overflow-hidden py-12 md:py-16">
            <div className="absolute inset-0 bg-gradient-to-br from-medical-blue/10 via-transparent to-medical-green/10" />
            
            {/* Floating elements for visual appeal */}
            <div className="absolute top-10 left-10 w-16 h-16 bg-medical-blue/20 rounded-full blur-xl animate-pulse" />
            <div className="absolute bottom-10 right-20 w-24 h-24 bg-medical-green/20 rounded-full blur-xl animate-pulse delay-1000" />
            
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="text-center">
                <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-1000">
                  <Badge variant="outline" className="mb-4 px-4 py-2 bg-card/50 backdrop-blur-sm border-medical-blue/20">
                    <Activity className="w-4 h-4 mr-2" />
                    Trusted by 10,000+ Users
                  </Badge>
                  
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-medical-blue via-medical-green to-accent bg-clip-text text-transparent leading-tight">
                    Find Medicine
                    <span className="block">Instantly</span>
                  </h1>
                  
                  <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-6 leading-relaxed">
                    Locate nearby pharmacies with your needed medication in stock. 
                    <span className="font-semibold text-foreground"> Real-time availability</span> at your fingertips.
                  </p>
                </div>
                
                {/* Prominent Search CTA Buttons */}
                <div className="animate-in fade-in-0 slide-in-from-bottom-8 duration-1000 delay-300">
                  <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                    <Button 
                      size="lg" 
                      variant="medical"
                      onClick={scrollToSearch}
                      className="px-8 py-4 text-lg shadow-glow-medical hover:shadow-glow-blue transition-all duration-300 hover:scale-105"
                    >
                      <Search className="mr-2 h-5 w-5" />
                      Start Medicine Search
                      <ArrowDown className="ml-2 h-4 w-4 animate-bounce" />
                    </Button>
                    <Button 
                      size="lg" 
                      variant="outline"
                      onClick={scrollToFeatures}
                      className="px-8 py-4 text-lg border-2 hover:bg-card/50 transition-all duration-300"
                    >
                      Learn More
                      <ChevronRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                  
                  {/* Quick stats */}
                  <div className="flex flex-wrap justify-center gap-4 md:gap-6">
                    <div className="flex items-center gap-2 bg-card/50 backdrop-blur-sm px-3 py-2 rounded-full border border-border/50">
                      <MapPin className="w-4 h-4 text-medical-blue" />
                      <span className="text-sm font-medium">1,500+ Pharmacies</span>
                    </div>
                    <div className="flex items-center gap-2 bg-card/50 backdrop-blur-sm px-3 py-2 rounded-full border border-border/50">
                      <Pill className="w-4 h-4 text-medical-green" />
                      <span className="text-sm font-medium">50,000+ Medicines</span>
                    </div>
                    <div className="flex items-center gap-2 bg-card/50 backdrop-blur-sm px-3 py-2 rounded-full border border-border/50">
                      <Clock className="w-4 h-4 text-accent" />
                      <span className="text-sm font-medium">24/7 Available</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Scroll indicator */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 animate-bounce">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={scrollToSearch}
                className="text-muted-foreground hover:text-medical-blue transition-colors"
              >
                <ArrowDown className="h-5 w-5" />
              </Button>
            </div>
          </section>

          {/* Enhanced Search Section - More Prominent */}
          <div className="animate-in fade-in-0 slide-in-from-bottom-12 duration-1000 delay-500">
            <SearchSection onSearch={handleSearch} isLoading={isLoading} />
          </div>

          {/* Quick Action Cards - Before Features */}
          {!searchResults && (
            <section className="py-12 px-4 md:px-6">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                  <h2 className="text-2xl md:text-3xl font-bold mb-4">
                    Popular Medicine Categories
                  </h2>
                  <p className="text-muted-foreground">
                    Quick search for commonly needed medications
                  </p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { name: "Pain Relief", icon: "💊", medicines: ["Paracetamol", "Ibuprofen", "Aspirin"] },
                    { name: "Antibiotics", icon: "🦠", medicines: ["Amoxicillin", "Azithromycin", "Cephalexin"] },
                    { name: "Cold & Flu", icon: "🤧", medicines: ["Cetirizine", "Loratadine", "Pseudoephedrine"] },
                    { name: "Vitamins", icon: "💪", medicines: ["Vitamin C", "Vitamin D", "Multivitamin"] }
                  ].map((category, index) => (
                    <Card 
                      key={index}
                      className={cn(
                        "group cursor-pointer hover:shadow-lg transition-all duration-300 border-0 bg-card/60 backdrop-blur-sm hover:bg-card/80 hover:scale-105",
                        "animate-in fade-in-0 slide-in-from-bottom-4 duration-700"
                      )}
                      style={{ animationDelay: `${index * 100}ms` }}
                      onClick={() => {
                        // Auto-fill search with first medicine from category
                        scrollToSearch();
                        setTimeout(() => {
                          const searchInput = document.querySelector('input[placeholder*="medicine"]') as HTMLInputElement;
                          if (searchInput) {
                            searchInput.value = category.medicines[0];
                            searchInput.focus();
                          }
                        }, 500);
                      }}
                    >
                      <CardContent className="p-4 text-center">
                        <div className="text-3xl mb-2">{category.icon}</div>
                        <h3 className="font-semibold text-sm mb-1 group-hover:text-medical-blue transition-colors">
                          {category.name}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          Tap to search
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </section>
          )}
          
          {/* Search Results */}
          {searchResults && (
            <div id="search-results" className="animate-in fade-in-0 slide-in-from-bottom-8 duration-700">
              {/* Search Results Header */}
              <div className="text-center py-4 px-4 md:px-6">
                <div className="inline-flex items-center gap-2 bg-medical-blue/10 px-4 py-2 rounded-full border border-medical-blue/20">
                  <Search className="w-4 h-4 text-medical-blue" />
                  <span className="text-sm font-medium text-medical-blue">
                    Search Results for "{searchResults.medicine}"
                  </span>
                </div>
              </div>
              <SearchResults 
                medicine={searchResults.medicine}
                location={searchResults.location}
                results={searchResults.medicines}
                isLoading={isLoading}
              />
            </div>
          )}

          {/* Features Section - Moved Lower */}
          <section id="features-section" className="py-16 bg-gradient-to-b from-background/50 to-card/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Why Choose MediHunt?
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Experience the fastest and most reliable way to find medicines and pharmacies near you.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    icon: Search,
                    title: "Smart Search",
                    description: "Advanced search algorithm finds exactly what you need from thousands of medicines.",
                    color: "medical-blue"
                  },
                  {
                    icon: MapPin,
                    title: "Location-Based",
                    description: "Find the nearest pharmacies with real-time distance and availability data.",
                    color: "medical-green"
                  },
                  {
                    icon: Shield,
                    title: "Verified Pharmacies",
                    description: "All listed pharmacies are licensed and verified for your safety and trust.",
                    color: "accent"
                  },
                  {
                    icon: Clock,
                    title: "Real-Time Updates",
                    description: "Live inventory tracking ensures medicine availability is always accurate.",
                    color: "medical-blue"
                  },
                  {
                    icon: Heart,
                    title: "User-Friendly",
                    description: "Simple, intuitive interface designed with user experience in mind.",
                    color: "medical-green"
                  },
                  {
                    icon: Users,
                    title: "Community Driven",
                    description: "Trusted by thousands of users and hundreds of registered pharmacies.",
                    color: "accent"
                  }
                ].map((feature, index) => (
                  <Card 
                    key={index} 
                    className={cn(
                      "group hover:shadow-lg transition-all duration-300 border-0 bg-card/60 backdrop-blur-sm hover:bg-card/80 hover:scale-105",
                      "animate-in fade-in-0 slide-in-from-bottom-4 duration-700",
                    )}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <CardHeader>
                      <div className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-colors duration-300",
                        feature.color === 'medical-blue' && "bg-medical-blue/20 text-medical-blue group-hover:bg-medical-blue/30",
                        feature.color === 'medical-green' && "bg-medical-green/20 text-medical-green group-hover:bg-medical-green/30",
                        feature.color === 'accent' && "bg-accent/20 text-accent group-hover:bg-accent/30"
                      )}>
                        <feature.icon className="w-6 h-6" />
                      </div>
                      <CardTitle className="text-xl group-hover:text-primary transition-colors duration-300">
                        {feature.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base leading-relaxed">
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* Floating Search Button for Mobile */}
          {!searchResults && (
            <div className="fixed bottom-2 right-2 z-40 md:hidden">
              <Button
                size="lg"
                variant="medical"
                onClick={scrollToSearch}
                className="rounded-full w-10 h-10 shadow-lg hover:shadow-xl transition-all duration-750 animate-pulse"
              >
                <Search className="h-6 w-6" />
              </Button>
            </div>
          )}

          {/* CTA Section - Only show if no search results */}
          {!searchResults && (
            <section className="py-16 bg-gradient-to-r from-medical-blue/10 to-medical-green/10">
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <div className="bg-card/80 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-border/50 shadow-xl">
                  <h3 className="text-3xl md:text-4xl font-bold mb-6">
                    Ready to Find Your Medicine?
                  </h3>
                  <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                    Join thousands of satisfied users who trust MediHunt for their healthcare needs. 
                    Start your search now and experience the difference.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button 
                      size="lg" 
                      variant="medical"
                      onClick={scrollToSearch}
                      className="px-8 py-4 text-lg shadow-glow-medical hover:shadow-glow-blue transition-all duration-300"
                    >
                      <Search className="mr-2 h-5 w-5" />
                      Start Searching Now
                    </Button>
                    <Button 
                      size="lg" 
                      variant="outline"
                      className="px-8 py-4 text-lg border-2 hover:bg-card/50 transition-all duration-300"
                      onClick={() => setShowPharmacyAuth(true)}
                    >
                      Join as Pharmacy
                      <ChevronRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </section>
          )}
        </main>

        {showPharmacyAuth && (
          <PharmacyAuth
            onClose={() => setShowPharmacyAuth(false)}
            onLogin={handlePharmacyLogin}
          />
        )}
      </div>
    </ThemeTransitionWrapper>
  );
};

export default Index;
