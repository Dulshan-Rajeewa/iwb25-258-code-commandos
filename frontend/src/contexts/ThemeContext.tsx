import React, { useEffect, useState } from 'react';
import { Theme, ThemeContext, ThemeContextType } from './ThemeContext.types';

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

export const ThemeProvider = ({
  children,
  defaultTheme = 'light',
  storageKey = 'medihunt-theme',
}: ThemeProviderProps) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem(storageKey);
    return (stored as Theme) || defaultTheme;
  });
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Start transition
    setIsTransitioning(true);
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark', 'medical');
    
    // Add new theme class
    root.classList.add(theme);
    
    // Store theme preference
    localStorage.setItem(storageKey, theme);
    
    // Force reflow to restart CSS animations for medical theme
    if (theme === 'medical') {
      // Trigger reflow for medical theme animations
      setTimeout(() => {
        // Restart all medical animations by forcing reflow
        const medicalElements = document.querySelectorAll('.medical *[class*="medical"], .medical .bg-gradient-to-r, .medical h1, .medical h2, .medical h3, .medical .card, .medical button');
        medicalElements.forEach(element => {
          const htmlElement = element as HTMLElement;
          htmlElement.style.animation = 'none';
          void htmlElement.offsetHeight; // Trigger reflow
          htmlElement.style.animation = '';
        });
        
        // Force body background refresh for medical decorations
        const body = document.body;
        const computedStyle = window.getComputedStyle(body, '::before');
        body.style.setProperty('--medical-refresh', Math.random().toString());
        
        // Trigger cursor updates for medical mode
        const cursorElements = document.querySelectorAll('.medical, .medical *, .medical button, .medical a, .medical input');
        cursorElements.forEach(element => {
          const htmlElement = element as HTMLElement;
          const currentCursor = htmlElement.style.cursor;
          htmlElement.style.cursor = 'auto';
          void htmlElement.offsetHeight; // Trigger reflow
          htmlElement.style.cursor = currentCursor;
        });
      }, 100);
    }
    
    // End transition after animation completes
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [theme, storageKey]);

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  const value = {
    theme,
    setTheme: handleSetTheme,
    isTransitioning,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
