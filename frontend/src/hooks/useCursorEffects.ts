import { useEffect } from 'react';
import { useTheme } from '@/hooks/useTheme';

export const useCursorEffects = () => {
  const { theme } = useTheme();

  useEffect(() => {
    // Skip cursor effects on mobile devices for better performance
    const isMobile = window.matchMedia('(max-width: 768px)').matches || 
                     'ontouchstart' in window || 
                     navigator.maxTouchPoints > 0;
    
    if (isMobile) return;

    // Only add cursor trail for medical theme on desktop
    if (theme === 'medical') {
      const addCursorTrail = () => {
        const trail = document.createElement('div');
        trail.className = 'cursor-trail';
        trail.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 8px;
          height: 8px;
          background: linear-gradient(45deg, hsl(var(--medical-blue)), hsl(var(--medical-green)));
          border-radius: 50%;
          pointer-events: none;
          z-index: 9999;
          opacity: 0;
          transition: opacity 0.2s ease;
          will-change: transform, opacity;
          box-shadow: 0 0 12px hsl(var(--medical-blue) / 0.6), 0 0 20px hsl(var(--medical-green) / 0.4);
        `;
        document.body.appendChild(trail);

        let mouseX = 0;
        let mouseY = 0;
        let trailX = 0;
        let trailY = 0;
        let animationId: number;

        const updateTrail = () => {
          trailX += (mouseX - trailX) * 0.15;
          trailY += (mouseY - trailY) * 0.15;
          
          trail.style.transform = `translate3d(${trailX}px, ${trailY}px, 0)`;
          
          animationId = requestAnimationFrame(updateTrail);
        };

        const handleMouseMove = (e: MouseEvent) => {
          mouseX = e.clientX;
          mouseY = e.clientY;
          trail.style.opacity = '0.9';
        };

        const handleMouseLeave = () => {
          trail.style.opacity = '0';
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseleave', handleMouseLeave);
        updateTrail();

        return () => {
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseleave', handleMouseLeave);
          cancelAnimationFrame(animationId);
          if (document.body.contains(trail)) {
            document.body.removeChild(trail);
          }
        };
      };

      const cleanup = addCursorTrail();
      return cleanup;
    }
  }, [theme]);

  useEffect(() => {
    // Add custom cursor classes based on theme
    const body = document.body;
    body.classList.remove('cursor-light', 'cursor-dark', 'cursor-medical');
    
    // Only apply custom cursor styles for medical theme
    // Light and dark themes will use default browser cursor
    if (theme === 'medical') {
      body.classList.add('cursor-medical');
    }

    // Skip interactive effects on mobile for performance
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    if (isMobile) return;

    // Only add interactive element hover effects for medical theme on desktop
    if (theme === 'medical') {
      const interactiveElements = document.querySelectorAll('button, a, [role="button"]');
      
      const addHoverEffect = (element: Element) => {
        const handleMouseEnter = () => {
          element.classList.add('animate-pulse-medical');
        };
        
        const handleMouseLeave = () => {
          element.classList.remove('animate-pulse-medical');
        };

        element.addEventListener('mouseenter', handleMouseEnter);
        element.addEventListener('mouseleave', handleMouseLeave);

        return () => {
          element.removeEventListener('mouseenter', handleMouseEnter);
          element.removeEventListener('mouseleave', handleMouseLeave);
          element.classList.remove('animate-pulse-medical');
        };
      };

      const cleanupFunctions = Array.from(interactiveElements).map(addHoverEffect);

      return () => {
        cleanupFunctions.forEach(cleanup => cleanup());
      };
    }
  }, [theme]);
};

export default useCursorEffects;
