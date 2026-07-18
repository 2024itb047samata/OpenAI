import React, { createContext, useContext, useState, useEffect } from "react";

export interface AuthUser {
  email: string;
  name: string;
  avatarUrl?: string;
  role?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  signup: (email: string, name: string, password: string) => Promise<AuthUser>;
  forgotPassword: (email: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check localStorage on load
    try {
      const stored = localStorage.getItem("codestory_user");
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to parse stored auth user:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<AuthUser> => {
    setIsLoading(true);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simple simulation validation
        if (!email || !email.includes("@")) {
          setIsLoading(false);
          reject(new Error("Please enter a valid email address."));
          return;
        }
        if (!password || password.length < 6) {
          setIsLoading(false);
          reject(new Error("Password must be at least 6 characters."));
          return;
        }

        // Mock success with a premium name derived from email or default
        const namePart = email.split("@")[0];
        const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
        const newUser: AuthUser = {
          email,
          name: formattedName || "Developer",
          avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
          role: "ArchOps Engineer",
        };

        localStorage.setItem("codestory_user", JSON.stringify(newUser));
        setUser(newUser);
        setIsLoading(false);
        resolve(newUser);
      }, 1000); // 1s realistic network delay simulation
    });
  };

  const signup = async (email: string, name: string, password: string): Promise<AuthUser> => {
    setIsLoading(true);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!email || !email.includes("@")) {
          setIsLoading(false);
          reject(new Error("Please enter a valid email address."));
          return;
        }
        if (!name || name.trim().length < 2) {
          setIsLoading(false);
          reject(new Error("Name must be at least 2 characters."));
          return;
        }
        if (!password || password.length < 6) {
          setIsLoading(false);
          reject(new Error("Password must be at least 6 characters."));
          return;
        }

        const newUser: AuthUser = {
          email,
          name: name.trim(),
          avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
          role: "Developer Partner",
        };

        localStorage.setItem("codestory_user", JSON.stringify(newUser));
        setUser(newUser);
        setIsLoading(false);
        resolve(newUser);
      }, 1000);
    });
  };

  const forgotPassword = async (email: string): Promise<void> => {
    setIsLoading(true);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!email || !email.includes("@")) {
          setIsLoading(false);
          reject(new Error("Please enter a valid email address."));
          return;
        }
        setIsLoading(false);
        resolve();
      }, 1000);
    });
  };

  const logout = () => {
    localStorage.removeItem("codestory_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        forgotPassword,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
