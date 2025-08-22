import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import useCursorEffects from "@/hooks/useCursorEffects";
import toast, { Toaster as HotToaster } from 'react-hot-toast';
import Index from "./pages/Index";
import HowItWorks from "./pages/HowItWorks";
import About from "./pages/About";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  // Apply cursor effects globally
  useCursorEffects();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/about" element={<About />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="medihunt-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <HotToaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#333',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '500',
            },
            success: {
              style: {
                border: '1px solid #10b981',
              },
            },
            error: {
              style: {
                border: '1px solid #ef4444',
              },
            },
          }}
        />
        <AppContent />
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
