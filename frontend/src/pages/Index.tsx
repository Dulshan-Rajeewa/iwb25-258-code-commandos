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
        
        <main>
          <SearchSection onSearch={handleSearch} />
          
          {searchResults && (
            <SearchResults 
              medicine={searchResults.medicine}
              location={searchResults.location}
              results={searchResults.medicines}
              isLoading={isLoading}
            />
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
