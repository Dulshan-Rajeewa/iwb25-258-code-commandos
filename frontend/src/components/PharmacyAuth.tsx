import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface PharmacyAuthProps {
  onClose: () => void;
  onLogin: () => void;
}

export const PharmacyAuth = ({ onClose, onLogin }: PharmacyAuthProps) => {
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    pharmacyName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    license: "",
    address: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await api.pharmacyLogin(loginData.email, loginData.password);
      if (response.success) {
        // Store token in localStorage
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('userType', response.userType);
        localStorage.setItem('userId', response.userId);
        
        toast({
          title: "Login Successful",
          description: "Welcome back to your pharmacy dashboard!",
        });
        
        onLogin();
      } else {
        setError(response.message || "Login failed");
        toast({
          title: "Login Failed",
          description: response.message || "Please check your credentials and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = "Network error occurred. Please try again.";
      setError(errorMessage);
      toast({
        title: "Network Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (registerData.password !== registerData.confirmPassword) {
      const errorMessage = "Passwords do not match";
      setError(errorMessage);
      toast({
        title: "Registration Failed",
        description: errorMessage,
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.pharmacyRegister({
        name: registerData.pharmacyName,
        email: registerData.email,
        password: registerData.password,
        phone: registerData.phone,
        license: registerData.license,
        address: registerData.address || "",
      });
      
      if (response.success) {
        // Store token in localStorage
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('userType', response.userType);
        localStorage.setItem('userId', response.userId);
        
        toast({
          title: "Registration Successful",
          description: "Welcome to MediHunt! Your pharmacy has been registered successfully.",
        });
        
        onLogin();
      } else {
        setError(response.message || "Registration failed");
        toast({
          title: "Registration Failed",
          description: response.message || "Please try again with different details.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      let errorMessage = "Network error occurred. Please try again.";
      
      // Handle specific error messages
      if (error instanceof Error) {
        if (error.message.includes('already exists')) {
          errorMessage = "A pharmacy with this email already exists. Please use a different email or try logging in.";
        } else if (error.message.includes('HTTP')) {
          errorMessage = "Registration failed. Please check your details and try again.";
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
      toast({
        title: "Registration Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto">
      <div className="w-full max-w-md my-4 sm:my-8 flex flex-col min-h-0">
        <Card className="responsive-modal w-full relative flex-1 max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl border-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="modal-close-btn absolute right-2 top-2 p-2 z-10 hover:bg-red-100 hover:text-red-600 transition-all duration-200 rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center touch-manipulation"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>

          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl sm:text-2xl bg-gradient-to-r from-medical-blue to-medical-green bg-clip-text text-transparent">
              Pharmacy Portal
            </CardTitle>
            <CardDescription className="text-sm">
              Manage your pharmacy inventory and profile
            </CardDescription>
          </CardHeader>

          <CardContent className="px-4 sm:px-6 pb-6">
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
                {error}
              </div>
            )}
            
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="login" className="text-sm">Login</TabsTrigger>
                <TabsTrigger value="register" className="text-sm">Register</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-sm">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="pharmacy@example.com"
                      value={loginData.email}
                      onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                      required
                      disabled={isLoading}
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-sm">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      value={loginData.password}
                      onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                      required
                      disabled={isLoading}
                      className="h-10"
                    />
                  </div>
                  <Button type="submit" variant="medical" className="w-full h-10" disabled={isLoading}>
                    {isLoading ? "Signing In..." : "Sign In"}
                  </Button>
                  <div className="text-center">
                    <Button variant="link" className="text-sm h-auto p-0">
                      Forgot password?
                    </Button>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="register" className="space-y-3">
                <form onSubmit={handleRegister} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="pharmacy-name" className="text-sm">Pharmacy Name</Label>
                      <Input
                        id="pharmacy-name"
                        placeholder="Your Pharmacy Name"
                        value={registerData.pharmacyName}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, pharmacyName: e.target.value }))}
                        required
                        disabled={isLoading}
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="register-email" className="text-sm">Email</Label>
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="pharmacy@example.com"
                        value={registerData.email}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                        required
                        disabled={isLoading}
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm">Phone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        value={registerData.phone}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, phone: e.target.value }))}
                        required
                        disabled={isLoading}
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="license" className="text-sm">License #</Label>
                      <Input
                        id="license"
                        placeholder="License Number"
                        value={registerData.license}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, license: e.target.value }))}
                        required
                        disabled={isLoading}
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address" className="text-sm">Address</Label>
                      <Input
                        id="address"
                        placeholder="Pharmacy Address"
                        value={registerData.address}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, address: e.target.value }))}
                        disabled={isLoading}
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-password" className="text-sm">Password</Label>
                      <Input
                        id="register-password"
                        type="password"
                        value={registerData.password}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                        required
                        disabled={isLoading}
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password" className="text-sm">Confirm</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={registerData.confirmPassword}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        required
                        disabled={isLoading}
                        className="h-10"
                      />
                    </div>
                  </div>
                  <Button type="submit" variant="medical" className="w-full h-10 mt-4" disabled={isLoading}>
                    {isLoading ? "Creating Account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};