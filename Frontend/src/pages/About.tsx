import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { Heart, Shield, Users, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header onPharmacyClick={() => {}} />
      
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-medical-blue to-medical-green bg-clip-text text-transparent mb-4">
            About MediHunt
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We're on a mission to make healthcare more accessible by connecting patients with nearby pharmacies that have their medications in stock.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 mb-12">
          <div>
            <h2 className="text-3xl font-semibold mb-6">Our Mission</h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              MediHunt was created to solve a common problem faced by millions of people every day: finding the right medication at the right pharmacy. We believe that access to healthcare should be simple, transparent, and efficient.
            </p>
            <p className="text-muted-foreground text-lg leading-relaxed">
              By connecting patients directly with pharmacy inventory in real-time, we eliminate the frustration of calling multiple locations or making unnecessary trips to find out-of-stock medications.
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-medical-light to-card rounded-lg p-8">
            <h3 className="text-2xl font-semibold mb-4">Why Choose MediHunt?</h3>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-medical-green rounded-full"></div>
                Real-time pharmacy inventory updates
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-medical-green rounded-full"></div>
                No registration required for patients
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-medical-green rounded-full"></div>
                Location-based search results
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-medical-green rounded-full"></div>
                Direct contact with pharmacies
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-medical-green rounded-full"></div>
                Free and easy to use
              </li>
            </ul>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="text-center">
            <CardHeader>
              <div className="w-16 h-16 bg-gradient-to-br from-medical-blue to-medical-green rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <CardTitle>Patient-Focused</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Every feature is designed with patient needs and convenience in mind.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-16 h-16 bg-gradient-to-br from-medical-blue to-medical-green rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <CardTitle>Reliable Data</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We ensure accurate, up-to-date information from verified pharmacy partners.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-16 h-16 bg-gradient-to-br from-medical-blue to-medical-green rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <CardTitle>Community Driven</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Built by healthcare professionals who understand real-world challenges.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-16 h-16 bg-gradient-to-br from-medical-blue to-medical-green rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <CardTitle>Fast & Simple</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Quick searches, instant results, and streamlined user experience.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="bg-gradient-to-r from-medical-light to-background rounded-lg p-8 text-center">
          <h2 className="text-2xl font-semibold mb-4">Join Our Network</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Are you a pharmacy owner? Join MediHunt to connect with more patients and help your community access the medications they need.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/">
              <Button variant="medical" size="lg">
                Start Searching
              </Button>
            </Link>
            <Button variant="outline" size="lg">
              Partner with Us
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default About;