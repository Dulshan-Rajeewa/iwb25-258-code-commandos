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
    <header className="w-full bg-card/95 backdrop-blur-md border-b border-border/50 py-4 px-4 sm:px-6 transition-all duration-300 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
          <div className="relative">
            <img 
              src={logo} 
              alt="MediHunt Logo" 
              className="h-8 w-8 sm:h-10 sm:w-10 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3" 
            />
            <div className="absolute inset-0 bg-medical-blue/20 rounded-full scale-0 group-hover:scale-125 transition-transform duration-300 -z-10" />
          </div>
          <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-medical-blue via-medical-green to-accent bg-clip-text text-transparent group-hover:from-accent group-hover:to-medical-blue transition-all duration-500">
            MediHunt
          </h1>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/how-it-works">
            <Button 
              variant="ghost" 
              className="text-muted-foreground hover:text-medical-blue hover:bg-medical-blue/10 transition-all duration-300 relative group"
            >
              <span className="relative z-10">How it works</span>
              <div className="absolute inset-0 bg-gradient-to-r from-medical-blue/0 via-medical-blue/10 to-medical-blue/0 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-md" />
            </Button>
          </Link>
          <Link to="/about">
            <Button 
              variant="ghost"
              className="text-muted-foreground hover:text-medical-green hover:bg-medical-green/10 transition-all duration-300 relative group"
            >
              <span className="relative z-10">About</span>
              <div className="absolute inset-0 bg-gradient-to-r from-medical-green/0 via-medical-green/10 to-medical-green/0 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-md" />
            </Button>
          </Link>
          <ThemeToggle />
          {isPharmacyLoggedIn && pharmacyInfo ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full group">
                  <Avatar className="h-9 w-9 border-2 border-medical-blue/20 group-hover:border-medical-blue/40 transition-all duration-300 group-hover:scale-110">
                    <AvatarImage src={pharmacyInfo.profile_image} alt={pharmacyInfo.name} />
                    <AvatarFallback className="bg-gradient-to-br from-medical-blue to-medical-green text-white font-semibold text-sm group-hover:from-medical-green group-hover:to-medical-blue transition-all duration-500">
                      {getInitials(pharmacyInfo.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute inset-0 rounded-full bg-medical-blue/20 scale-0 group-hover:scale-125 transition-transform duration-300 -z-10" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-card/95 backdrop-blur-md border-border/50" align="end" forceMount>
                <div className="flex flex-col space-y-1 p-2">
                  <p className="text-sm font-medium leading-none text-foreground">{pharmacyInfo.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    Pharmacy Dashboard
                  </p>
                </div>
                <DropdownMenuItem 
                  onClick={onPharmacyLogout}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors duration-200 cursor-pointer"
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
              className="shadow-glow-medical hover:shadow-glow-blue transition-all duration-300 hover:scale-105 active:scale-95 relative group overflow-hidden"
            >
              <span className="relative z-10">Pharmacy Login</span>
              <div className="absolute inset-0 bg-gradient-to-r from-medical-blue/20 to-medical-green/20 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500" />
            </Button>
          )}
        </nav>

        {/* Mobile Theme Toggle and Menu Button */}
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
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