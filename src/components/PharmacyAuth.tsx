import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X } from "lucide-react";
import { api } from "@/lib/api";

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
    license: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

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
        onLogin();
      } else {
        setError(response.message || "Login failed");
      }
    } catch (error) {
      console.error('Login error:', error);
      setError("Network error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (registerData.password !== registerData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.pharmacyRegister({
        name: registerData.pharmacyName,
        email: registerData.email,
        password: registerData.password,
        phone: registerData.phone,
        license: registerData.license
      });
      
      if (response.success) {
        // Store token in localStorage
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('userType', response.userType);
        localStorage.setItem('userId', response.userId);
        onLogin();
      } else {
        setError(response.message || "Registration failed");
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError("Network error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="absolute right-2 top-2 p-2"
        >
          <X className="h-4 w-4" />
        </Button>

        <CardHeader className="text-center">
          <CardTitle className="text-2xl bg-gradient-to-r from-medical-blue to-medical-green bg-clip-text text-transparent">
            Pharmacy Portal
          </CardTitle>
          <CardDescription>
            Manage your pharmacy inventory and profile
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
              {error}
            </div>
          )}
          
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="pharmacy@example.com"
                    value={loginData.email}
                    onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                    required
                    disabled={isLoading}
                  />
                </div>
                <Button type="submit" variant="medical" className="w-full" disabled={isLoading}>
                  {isLoading ? "Signing In..." : "Sign In"}
                </Button>
                <div className="text-center">
                  <Button variant="link" className="text-sm">
                    Forgot password?
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="register" className="space-y-4">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pharmacy-name">Pharmacy Name</Label>
                  <Input
                    id="pharmacy-name"
                    placeholder="Your Pharmacy Name"
                    value={registerData.pharmacyName}
                    onChange={(e) => setRegisterData(prev => ({ ...prev, pharmacyName: e.target.value }))}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="pharmacy@example.com"
                    value={registerData.email}
                    onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={registerData.phone}
                    onChange={(e) => setRegisterData(prev => ({ ...prev, phone: e.target.value }))}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="license">Pharmacy License Number</Label>
                  <Input
                    id="license"
                    placeholder="License Number"
                    value={registerData.license}
                    onChange={(e) => setRegisterData(prev => ({ ...prev, license: e.target.value }))}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password">Password</Label>
                  <Input
                    id="register-password"
                    type="password"
                    value={registerData.password}
                    onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={registerData.confirmPassword}
                    onChange={(e) => setRegisterData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    required
                    disabled={isLoading}
                  />
                </div>
                <Button type="submit" variant="medical" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};