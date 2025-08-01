import { useState } from "react";
import { Header } from "@/components/Header";
import { SearchSection } from "@/components/SearchSection";
import { SearchResults } from "@/components/SearchResults";
import { PharmacyAuth } from "@/components/PharmacyAuth";
import { PharmacyDashboard } from "@/components/PharmacyDashboard";
import medicalBg from "@/assets/medical-background.jpg";

const Index = () => {
  const [showPharmacyAuth, setShowPharmacyAuth] = useState(false);
  const [isPharmacyLoggedIn, setIsPharmacyLoggedIn] = useState(false);
  const [searchResults, setSearchResults] = useState<{ medicine: string; location: string } | null>(null);

  const handleSearch = (medicine: string, location: string) => {
    setSearchResults({ medicine, location });
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
            results={[]}
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
