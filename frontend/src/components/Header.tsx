import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import logo from "@/assets/medihunt-logo.png";
import ThemeToggle from "./ThemeToggle";
import { Menu } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onPharmacyClick: () => void;
}

export const Header = ({ onPharmacyClick }: HeaderProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="w-full bg-card/80 backdrop-blur-sm border-b border-border py-4 px-4 sm:px-6 transition-all duration-300 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
          <img 
            src={logo} 
            alt="MediHunt Logo" 
            className="h-8 w-8 sm:h-10 sm:w-10 transition-transform duration-300 group-hover:scale-110" 
          />
          <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-medical-blue to-medical-green bg-clip-text text-transparent">
            MediHunt
          </h1>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-4">
          <Link to="/how-it-works">
            <Button 
              variant="ghost" 
              className="text-muted-foreground hover:text-foreground transition-colors duration-300"
            >
              How it works
            </Button>
          </Link>
          <Link to="/about">
            <Button 
              variant="ghost" 
              className="text-muted-foreground hover:text-foreground transition-colors duration-300"
            >
              About
            </Button>
          </Link>
          
          <ThemeToggle />
          
          <Button 
            variant="medical" 
            onClick={onPharmacyClick}
            className="shadow-glow-blue hover:shadow-glow-medical transition-all duration-300"
          >
            <span className="hidden sm:inline">Pharmacy Login</span>
            <span className="sm:hidden">Login</span>
          </Button>
        </nav>

        {/* Mobile Menu Button and Theme Toggle */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden mt-4 pb-4 border-t border-border">
          <nav className="flex flex-col gap-2 pt-4">
            <Link to="/how-it-works" onClick={() => setIsMobileMenuOpen(false)}>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-muted-foreground hover:text-foreground transition-colors duration-300"
              >
                How it works
              </Button>
            </Link>
            <Link to="/about" onClick={() => setIsMobileMenuOpen(false)}>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-muted-foreground hover:text-foreground transition-colors duration-300"
              >
                About
              </Button>
            </Link>
            
            <Button 
              variant="medical" 
              onClick={() => {
                onPharmacyClick();
                setIsMobileMenuOpen(false);
              }}
              className="w-full mt-2 shadow-glow-blue hover:shadow-glow-medical transition-all duration-300"
            >
              Pharmacy Login
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
};