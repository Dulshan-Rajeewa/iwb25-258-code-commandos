import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";
import logo from "@/assets/medihunt-logo.png";
import ThemeToggle from "./ThemeToggle";
import { Menu, LogOut } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onPharmacyClick: () => void;
  isPharmacyLoggedIn?: boolean;
  pharmacyInfo?: { name: string; profile_image?: string };
  onPharmacyLogout?: () => void;
}

export const Header = ({ onPharmacyClick, isPharmacyLoggedIn = false, pharmacyInfo, onPharmacyLogout }: HeaderProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

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
          {isPharmacyLoggedIn && pharmacyInfo ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-9 w-9 border-2 border-medical-blue/20 hover:border-medical-blue/40 transition-colors">
                    <AvatarImage src={pharmacyInfo.profile_image} alt={pharmacyInfo.name} />
                    <AvatarFallback className="bg-gradient-to-br from-medical-blue to-medical-green text-white font-semibold">
                      {getInitials(pharmacyInfo.name)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex flex-col space-y-1 p-2">
                  <p className="text-sm font-medium leading-none">{pharmacyInfo.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    Pharmacy Dashboard
                  </p>
                </div>
                <DropdownMenuItem 
                  onClick={onPharmacyLogout}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button 
              variant="medical" 
              onClick={onPharmacyClick}
              className="shadow-glow-blue hover:shadow-glow-medical transition-all duration-300"
            >
              Pharmacy Login
            </Button>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden mt-4 pb-4 border-t border-border pt-4">
          <nav className="flex flex-col gap-2">
            <Link to="/how-it-works">
              <Button 
                variant="ghost" 
                className="w-full justify-start text-muted-foreground hover:text-foreground"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                How it works
              </Button>
            </Link>
            <Link to="/about">
              <Button 
                variant="ghost"
                className="w-full justify-start text-muted-foreground hover:text-foreground"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </Button>
            </Link>
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-sm text-muted-foreground">Theme</span>
              <ThemeToggle />
            </div>
            {isPharmacyLoggedIn && pharmacyInfo ? (
              <div className="flex flex-col gap-2 pt-2 border-t border-border">
                <div className="flex items-center gap-3 px-3 py-2">
                  <Avatar className="h-8 w-8 border-2 border-medical-blue/20">
                    <AvatarImage src={pharmacyInfo.profile_image} alt={pharmacyInfo.name} />
                    <AvatarFallback className="bg-gradient-to-br from-medical-blue to-medical-green text-white text-sm font-semibold">
                      {getInitials(pharmacyInfo.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <p className="text-sm font-medium">{pharmacyInfo.name}</p>
                    <p className="text-xs text-muted-foreground">Pharmacy Dashboard</p>
                  </div>
                </div>
                <Button 
                  variant="ghost"
                  onClick={() => {
                    onPharmacyLogout?.();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </Button>
              </div>
            ) : (
              <Button 
                variant="medical" 
                onClick={() => {
                  onPharmacyClick();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full shadow-glow-blue hover:shadow-glow-medical transition-all duration-300"
              >
                Pharmacy Login
              </Button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;