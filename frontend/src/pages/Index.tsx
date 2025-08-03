import { useState } from "react";
import { Header } from "@/components/Header";
import { SearchSection } from "@/components/SearchSection";
import { SearchResults } from "@/components/SearchResults";
import { PharmacyAuth } from "@/components/PharmacyAuth";
import { PharmacyDashboard } from "@/components/PharmacyDashboard";
import ThemeTransitionWrapper from "@/components/ThemeTransitionWrapper";
import { useTheme } from "@/hooks/useTheme";
import { api } from "@/lib/api";
import medicalBg from "@/assets/medical-background.jpg";
import { cn } from "@/lib/utils";

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

const Index = () => {
  const { theme } = useTheme();
  const [showPharmacyAuth, setShowPharmacyAuth] = useState(false);
  const [isPharmacyLoggedIn, setIsPharmacyLoggedIn] = useState(false);
  const [searchResults, setSearchResults] = useState<{ medicine: string; location: string; medicines: Medicine[] } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
  };

  const handlePharmacyLogout = () => {
    setIsPharmacyLoggedIn(false);
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
        <Header onPharmacyClick={() => setShowPharmacyAuth(true)} />
        
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
