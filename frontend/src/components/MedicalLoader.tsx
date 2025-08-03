import React from 'react';
import { Loader2, Heart, Activity } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';

interface MedicalLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

const MedicalLoader: React.FC<MedicalLoaderProps> = ({ 
  size = 'md', 
  text = 'Loading...', 
  className 
}) => {
  const { theme } = useTheme();

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const containerSizeClasses = {
    sm: 'gap-2',
    md: 'gap-3',
    lg: 'gap-4'
  };

  if (theme === 'medical') {
    return (
      <div className={cn(
        'flex flex-col items-center justify-center',
        containerSizeClasses[size],
        className
      )}>
        <div className="relative">
          {/* Pulsing heart for medical theme */}
          <Heart className={cn(
            sizeClasses[size],
            'text-medical-blue animate-pulse-medical absolute inset-0'
          )} />
          <Activity className={cn(
            sizeClasses[size],
            'text-medical-green animate-pulse'
          )} />
          
          {/* Rotating ring */}
          <div className={cn(
            'absolute inset-0 border-2 border-medical-blue/20 border-t-medical-blue rounded-full',
            'animate-spin'
          )} style={{
            width: size === 'sm' ? '16px' : size === 'md' ? '32px' : '48px',
            height: size === 'sm' ? '16px' : size === 'md' ? '32px' : '48px'
          }} />
        </div>
        
        {text && (
          <span className={cn(
            'text-medical-blue font-medium animate-pulse',
            size === 'sm' && 'text-xs',
            size === 'md' && 'text-sm',
            size === 'lg' && 'text-base'
          )}>
            {text}
          </span>
        )}
        
        {/* Floating particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-medical-green/40 rounded-full animate-float"
              style={{
                left: `${20 + i * 30}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: '2s'
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  // Default loader for light/dark themes
  return (
    <div className={cn(
      'flex flex-col items-center justify-center',
      containerSizeClasses[size],
      className
    )}>
      <Loader2 className={cn(
        sizeClasses[size],
        'animate-spin text-primary'
      )} />
      {text && (
        <span className={cn(
          'text-muted-foreground',
          size === 'sm' && 'text-xs',
          size === 'md' && 'text-sm',
          size === 'lg' && 'text-base'
        )}>
          {text}
        </span>
      )}
    </div>
  );
};

export default MedicalLoader;
