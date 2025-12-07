import { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";
import { config } from "../config/env.js";

const InterviewContext = createContext();

export const InterviewProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      // Check for token in cookies (client-side readable cookie)
      const token = Cookies.get("token");
      
      // Even if no client-side cookie, try to verify with server
      // (server might have httpOnly cookie)
      try {
        const res = await fetch(`${config.API_BASE_URL}/api/user/verify`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Important: sends httpOnly cookie
        });

        if (res.ok) {
          const data = await res.json();
          setIsAuthenticated(true);
          setUser(data.user || { email: data.email, id: data.userId || data.id });
          
          // Ensure client-side cookie exists for consistency
          if (data.user && !token) {
            // If we have user but no client cookie, we need to get token from server
            // But we can't read httpOnly cookie, so we'll just mark as authenticated
            // The server cookie will handle authentication
            console.log("Auth restored from server cookie");
          } else {
            console.log("Auth restored from token");
          }
        } else {
          // Token is invalid, remove client-side cookie
          if (token) {
            Cookies.remove("token");
          }
          setIsAuthenticated(false);
          setUser(null);
          console.log("Token verification failed, user logged out");
        }
      } catch (err) {
        console.error("Auth verification error:", err);
        // On error, remove client-side cookie if it exists
        if (token) {
          Cookies.remove("token");
        }
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      console.log("Attempting login for:", email);
      const res = await fetch(`${config.API_BASE_URL}/api/user/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Important for cookies
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      console.log("Login response:", { status: res.status, data });

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Server sets httpOnly cookie, but also returns token in response
      // Store token in client-side cookie as backup
      if (data.token) {
        Cookies.set("token", data.token, {
          expires: 7, // 7 days
          secure: import.meta.env.PROD, // Secure in production
          sameSite: "Lax",
        });
        console.log("Token stored in cookie");
      }

      // Check if cookie was set (might take a moment)
      const token = data.token || Cookies.get("token");
      
      if (!token) {
        console.error("No token received from server");
        throw new Error("Token not received");
      }

      setIsAuthenticated(true);
      setUser(data.user || { email, id: data.userId || data.user?.id });
      console.log("Login successful, user authenticated");
      return true;

    } catch (err) {
      console.error("LOGIN ERROR:", err.message);
      return false;
    }
  };

  const register = async (username, email, password) => {
    try {
      console.log("Attempting registration for:", email);
      const res = await fetch(`${config.API_BASE_URL}/api/user/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();
      console.log("Register response:", { status: res.status, data });

      if (!res.ok) {
        throw new Error(data.message || "Registration failed");
      }

      // Server returns token, so we can directly authenticate
      if (data.token) {
        Cookies.set("token", data.token, {
          expires: 7,
          secure: import.meta.env.PROD,
          sameSite: "Lax",
        });
        console.log("Token stored in cookie");
      }

      const token = data.token || Cookies.get("token");
      
      if (!token) {
        throw new Error("Token not received after registration");
      }

      setIsAuthenticated(true);
      setUser(data.user || { email, id: data.userId || data.user?.id });
      console.log("Registration and auto-login successful");
      return true;

    } catch (err) {
      console.error("REGISTER ERROR:", err.message);
      // Return error message in a way RegisterPage can access it
      throw new Error(err.message || "Registration failed");
    }
  };

  const logout = () => {
    Cookies.remove("token");
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <InterviewContext.Provider value={{ 
      isAuthenticated, 
      user,
      loading,
      login, 
      register,
      logout 
    }}>
      {children}
    </InterviewContext.Provider>
  );
};

export const useAuth = () => useContext(InterviewContext);
