import React from 'react';
import { useTheme } from '@/hooks/useTheme';
import { Theme } from '@/contexts/ThemeContext.types';
import { Button } from '@/components/ui/button';
import { Sun, Moon, Stethoscope } from 'lucide-react';
import { cn } from '@/lib/utils';

const ThemeToggle = () => {
  const { theme, setTheme, isTransitioning } = useTheme();

  const themes: { value: Theme; icon: React.ReactNode; label: string; color: string }[] = [
    {
      value: 'light',
      icon: <Sun className="h-3 w-3 sm:h-4 sm:w-4" />,
      label: 'Light',
      color: 'from-yellow-400 to-orange-400',
    },
    {
      value: 'dark',
      icon: <Moon className="h-3 w-3 sm:h-4 sm:w-4" />,
      label: 'Dark',
      color: 'from-blue-600 to-purple-600',
    },
    {
      value: 'medical',
      icon: <Stethoscope className="h-3 w-3 sm:h-4 sm:w-4" />,
      label: 'Medical',
      color: 'from-medical-blue to-medical-green',
    },
  ];

  const handleThemeChange = (newTheme: Theme) => {
    console.log('Theme changing from', theme, 'to', newTheme); // Debug log
    setTheme(newTheme);
  };

  return (
    <div className="flex items-center bg-background/90 backdrop-blur-sm border border-border rounded-full p-1 shadow-lg">
      {themes.map((themeOption) => (
        <button
          key={themeOption.value}
          type="button"
          onClick={() => handleThemeChange(themeOption.value)}
          className={cn(
            'relative flex items-center justify-center',
            'h-7 w-7 sm:h-9 sm:w-9 rounded-full',
            'transition-all duration-300 ease-in-out',
            'hover:scale-110 hover:shadow-md active:scale-95',
            'cursor-pointer touch-manipulation',
            'focus:outline-none focus:ring-2 focus:ring-primary/50',
            theme === themeOption.value ? [
              'bg-primary text-primary-foreground',
              'shadow-lg scale-105',
            ] : [
              'text-muted-foreground hover:text-foreground',
              'hover:bg-muted/50',
            ],
            isTransitioning && 'animate-pulse'
          )}
          title={`Switch to ${themeOption.label} mode`}
          aria-label={`Switch to ${themeOption.label} mode`}
        >
          <span className="relative z-10">
            {themeOption.icon}
          </span>
          {theme === themeOption.value && (
            <div className="absolute inset-0 rounded-full bg-primary/10 animate-pulse" />
          )}
        </button>
      ))}
    </div>
  );
};

export default ThemeToggle;
