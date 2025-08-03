import React, { useEffect, useState } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';
import useCursorEffects from '@/hooks/useCursorEffects';

interface ThemeTransitionWrapperProps {
  children: React.ReactNode;
}

const ThemeTransitionWrapper: React.FC<ThemeTransitionWrapperProps> = ({ children }) => {
  const { theme, isTransitioning } = useTheme();
  const [previousTheme, setPreviousTheme] = useState(theme);
  const [showTransitionEffect, setShowTransitionEffect] = useState(false);

  // Use cursor effects hook
  useCursorEffects();

  useEffect(() => {
    if (theme !== previousTheme) {
      setShowTransitionEffect(true);
      setPreviousTheme(theme);
      
      // Hide transition effect after animation completes
      const timer = setTimeout(() => {
        setShowTransitionEffect(false);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [theme, previousTheme]);

  return (
    <div className={cn("min-h-screen transition-all duration-300", {
      "animate-theme-enter": isTransitioning,
    })}>
      {/* Theme transition overlay */}
      {showTransitionEffect && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          <div className={cn(
            "absolute inset-0 transition-opacity duration-500",
            theme === 'medical' && "bg-gradient-to-br from-medical-blue/10 via-medical-green/5 to-medical-accent/10",
            theme === 'dark' && "bg-gradient-to-br from-gray-900/20 via-blue-900/10 to-purple-900/10",
            theme === 'light' && "bg-gradient-to-br from-blue-50/30 via-white/20 to-green-50/30"
          )} />
          
          {/* Animated particles for medical theme */}
          {theme === 'medical' && (
            <div className="absolute inset-0">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-medical-blue/30 rounded-full animate-float"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${3 + Math.random() * 2}s`
                  }}
                />
              ))}
            </div>
          )}
          
          {/* Shimmer effect */}
          <div className={cn(
            "absolute inset-0 opacity-50",
            "bg-gradient-to-r from-transparent via-white/10 to-transparent",
            "animate-shimmer"
          )} />
        </div>
      )}
      
      {/* Theme-specific background patterns */}
      <div className={cn(
        "fixed inset-0 pointer-events-none opacity-5 transition-opacity duration-500",
        theme === 'medical' && "bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%2300a8e6\" fill-opacity=\"0.1\"%3E%3Cpath d=\"M30 0c16.569 0 30 13.431 30 30s-13.431 30-30 30S0 46.569 0 30 13.431 0 30 0zm0 6c-13.255 0-24 10.745-24 24s10.745 24 24 24 24-10.745 24-24S43.255 6 30 6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"
      )} />
      
      {children}
    </div>
  );
};

export default ThemeTransitionWrapper;
