import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import logo from "@/assets/medihunt-logo.png";

interface HeaderProps {
  onPharmacyClick: () => void;
}

export const Header = ({ onPharmacyClick }: HeaderProps) => {
  return (
    <header className="w-full bg-card border-b border-border py-4 px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="MediHunt Logo" className="h-10 w-10" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-medical-blue to-medical-green bg-clip-text text-transparent">
            MediHunt
          </h1>
        </Link>
        
        <nav className="flex items-center gap-4">
          <Link to="/how-it-works">
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
              How it works
            </Button>
          </Link>
          <Link to="/about">
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
              About
            </Button>
          </Link>
          <Button variant="medical" onClick={onPharmacyClick}>
            Pharmacy Login
          </Button>
        </nav>
      </div>
    </header>
  );
};