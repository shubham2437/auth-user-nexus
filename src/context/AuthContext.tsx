
import { LoginRequest } from "@/types/user";
import React, { createContext, useContext, useEffect, useState } from "react";
import { login } from "@/services/api";
import { toast } from "@/components/ui/sonner";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Check if the user is already logged in
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = async (credentials: LoginRequest) => {
    try {
      setIsLoading(true);
      const response = await login(credentials);
      if (response.token) {
        localStorage.setItem("token", response.token);
        setToken(response.token);
        setIsAuthenticated(true);
        toast.success("Login successful!");
        navigate("/users");
      }
    } catch (error) {
      let errorMessage = "Login failed";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setIsAuthenticated(false);
    toast.info("Logged out successfully");
    navigate("/login");
  };

  const value = {
    isAuthenticated,
    token,
    login: handleLogin,
    logout: handleLogout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
