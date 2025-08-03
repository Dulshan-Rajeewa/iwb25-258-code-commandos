import { useState } from "react";
import { Header } from "@/components/Header";
import { SearchSection } from "@/components/SearchSection";
import { SearchResults } from "@/components/SearchResults";
import { PharmacyAuth } from "@/components/PharmacyAuth";
import { PharmacyDashboard } from "@/components/PharmacyDashboard";
import { api } from "@/lib/api";
import medicalBg from "@/assets/medical-background.jpg";

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
    return <PharmacyDashboard onLogout={handlePharmacyLogout} />;
  }

  return (
    <div 
      className="min-h-screen bg-background relative"
      style={{
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.90)), url(${medicalBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
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
  );
};

export default Index;
