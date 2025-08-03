import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { PharmacyAuth } from "@/components/PharmacyAuth";
import { PharmacyDashboard } from "@/components/PharmacyDashboard";
import { Search, MapPin, Phone, Clock } from "lucide-react";
import { Link } from "react-router-dom";

const HowItWorks = () => {
  const [showPharmacyAuth, setShowPharmacyAuth] = useState(false);
  const [isPharmacyLoggedIn, setIsPharmacyLoggedIn] = useState(false);

  const handlePharmacyClick = () => {
    setShowPharmacyAuth(true);
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
    <div className="min-h-screen bg-background">
      <Header onPharmacyClick={handlePharmacyClick} />
      
      {showPharmacyAuth && (
        <PharmacyAuth 
          onLogin={handlePharmacyLogin}
          onClose={() => setShowPharmacyAuth(false)}
        />
      )}
      
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-medical-blue to-medical-green bg-clip-text text-transparent mb-4">
            How MediHunt Works
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Finding the medicine you need has never been easier. Follow these simple steps to locate nearby pharmacies with your medication in stock.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="text-center">
            <CardHeader>
              <div className="w-16 h-16 bg-gradient-to-br from-medical-blue to-medical-green rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-white" />
              </div>
              <CardTitle>1. Search Medicine</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Enter the name of the medicine you're looking for in our search bar.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-16 h-16 bg-gradient-to-br from-medical-blue to-medical-green rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <CardTitle>2. Set Location</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We'll automatically detect your location, or you can manually select your area.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-16 h-16 bg-gradient-to-br from-medical-blue to-medical-green rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <CardTitle>3. View Results</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                See real-time availability and stock levels at nearby pharmacies.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-16 h-16 bg-gradient-to-br from-medical-blue to-medical-green rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-white" />
              </div>
              <CardTitle>4. Contact Pharmacy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Call or visit the pharmacy directly to reserve or purchase your medicine.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="bg-gradient-to-r from-medical-light to-background rounded-lg p-8 text-center">
          <h2 className="text-2xl font-semibold mb-4">Ready to find your medicine?</h2>
          <p className="text-muted-foreground mb-6">
            Start searching now and discover pharmacies near you with the medications you need.
          </p>
          <Link to="/">
            <Button variant="medical" size="lg">
              Start Searching
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default HowItWorks;