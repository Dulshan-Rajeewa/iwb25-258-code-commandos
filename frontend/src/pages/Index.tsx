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
import { Heart, Shield, MapPin, Clock, Users, Star, ChevronRight, Pill, Search, Activity } from "lucide-react";

const Index = () => {
  const { theme } = useTheme();
  const { toast } = useToast();
  const [showPharmacyAuth, setShowPharmacyAuth] = useState(false);
  const [isPharmacyLoggedIn, setIsPharmacyLoggedIn] = useState(false);
  const [pharmacyInfo, setPharmacyInfo] = useState({ name: "", profile_image: "" });
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
          profile_image: response.pharmacy.profile_image || ""
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
} catch (error) {
      console.error('Search failed:', error);
      setSearchResults({ medicine, location, medicines: [] });
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
    setPharmacyInfo({ name: "", profile_image: "" });
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
          {/* Hero Section */}
          <section className="relative overflow-hidden py-20 md:py-32">
            <div className="absolute inset-0 bg-gradient-to-br from-medical-blue/10 via-transparent to-medical-green/10" />
            
            {/* Floating elements for visual appeal */}
            <div className="absolute top-20 left-10 w-20 h-20 bg-medical-blue/20 rounded-full blur-xl animate-pulse" />
            <div className="absolute bottom-32 right-20 w-32 h-32 bg-medical-green/20 rounded-full blur-xl animate-pulse delay-1000" />
            <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-accent/30 rounded-full blur-lg animate-bounce" />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="text-center">
                <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-1000">
                  <Badge variant="outline" className="mb-4 px-4 py-2 bg-card/50 backdrop-blur-sm border-medical-blue/20">
                    <Activity className="w-4 h-4 mr-2" />
                    Trusted by 10,000+ Users
                  </Badge>
                  
                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-medical-blue via-medical-green to-accent bg-clip-text text-transparent leading-tight">
                    Find Medicine
                    <span className="block">Instantly</span>
                  </h1>
                  
                  <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
                    Locate nearby pharmacies with your needed medication in stock. 
                    <span className="font-semibold text-foreground"> Real-time availability</span> at your fingertips.
                  </p>
                </div>
                
                {/* Quick stats */}
                <div className="animate-in fade-in-0 slide-in-from-bottom-8 duration-1000 delay-300">
                  <div className="flex flex-wrap justify-center gap-6 md:gap-8 mb-12">
                    <div className="flex items-center gap-2 bg-card/50 backdrop-blur-sm px-4 py-2 rounded-full border border-border/50">
                      <MapPin className="w-5 h-5 text-medical-blue" />
                      <span className="text-sm font-medium">1,500+ Pharmacies</span>
                    </div>
                    <div className="flex items-center gap-2 bg-card/50 backdrop-blur-sm px-4 py-2 rounded-full border border-border/50">
                      <Pill className="w-5 h-5 text-medical-green" />
                      <span className="text-sm font-medium">50,000+ Medicines</span>
                    </div>
                    <div className="flex items-center gap-2 bg-card/50 backdrop-blur-sm px-4 py-2 rounded-full border border-border/50">
                      <Clock className="w-5 h-5 text-accent" />
                      <span className="text-sm font-medium">24/7 Available</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Enhanced Search Section */}
          <div className="animate-in fade-in-0 slide-in-from-bottom-12 duration-1000 delay-500">
            <SearchSection onSearch={handleSearch} />
          </div>
          
          {/* Features Section */}
          <section className="py-20 bg-gradient-to-b from-background/50 to-card/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Why Choose MediHunt?
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Experience the fastest and most reliable way to find medicines and pharmacies near you.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                      "group hover:shadow-lg transition-all duration-300 border-0 bg-card/60 backdrop-blur-sm hover:bg-card/80 hover:scale-105 cursor-pointer",
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

          {/* Search Results */}
          {searchResults && (
            <div className="animate-in fade-in-0 slide-in-from-bottom-8 duration-700">
              <SearchResults 
                medicine={searchResults.medicine}
                location={searchResults.location}
                results={searchResults.medicines}
                isLoading={isLoading}
              />
            </div>
          )}

          {/* CTA Section */}
          {!searchResults && (
            <section className="py-20 bg-gradient-to-r from-medical-blue/10 to-medical-green/10">
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
                      className="px-8 py-4 text-lg shadow-glow-medical hover:shadow-glow-blue transition-all duration-300"
                      onClick={() => document.querySelector('#search-section')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                      <Search className="mr-2 h-5 w-5" />
                      Start Searching
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
