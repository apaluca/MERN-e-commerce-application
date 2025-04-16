import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

// Create context
const AppContext = createContext();

// Custom hook to use the app context
export const useAppContext = () => {
  return useContext(AppContext);
};

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize axios with auth token
  const API = axios.create({ baseURL: "http://localhost:3000" });

  // Setup axios interceptor for token
  API.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Load user from token
  const loadUser = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        setUser(null);
        setCart({ items: [], total: 0 });
        setLoading(false);
        return;
      }

      const res = await API.get("/auth/me");

      // Add logging to debug user data
      console.log("User data from API:", res.data);

      // Ensure we're setting the complete user data with the correct structure
      setUser({
        ...res.data,
        // Ensure active is a boolean
        active: res.data.active === true,
        // Ensure createdAt is a valid date string
        createdAt: res.data.createdAt ? res.data.createdAt : null,
      });

      // Load cart if user is authenticated
      if (res.data) {
        try {
          const cartRes = await API.get("/cart");
          setCart(cartRes.data);
        } catch (cartError) {
          console.error("Error loading cart:", cartError);
          // Don't set error for cart loading issues
        }
      }
    } catch (err) {
      // Clear token if invalid
      localStorage.removeItem("token");
      setUser(null);
      setCart({ items: [], total: 0 });
      console.error("Auth error:", err);
      // Don't set error for auth loading issues on initial load
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      setLoading(true);
      const res = await API.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      setUser(res.data.user);

      // Load cart
      try {
        const cartRes = await API.get("/cart");
        setCart(cartRes.data);
      } catch (cartError) {
        console.error("Error loading cart after login:", cartError);
      }

      return { success: true };
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
      return {
        success: false,
        message: err.response?.data?.message || "Login failed",
      };
    } finally {
      setLoading(false);
    }
  };

  // Register user
  const register = async (username, email, password) => {
    try {
      setLoading(true);
      const res = await API.post("/auth/register", {
        username,
        email,
        password,
      });
      localStorage.setItem("token", res.data.token);
      setUser(res.data.user);

      // Initialize cart
      try {
        const cartRes = await API.get("/cart");
        setCart(cartRes.data);
      } catch (cartError) {
        console.error("Error loading cart after registration:", cartError);
      }

      return { success: true };
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
      return {
        success: false,
        message: err.response?.data?.message || "Registration failed",
      };
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setCart({ items: [], total: 0 });
  };

  // Add to cart - requires authentication
  const addToCart = async (productId, quantity = 1) => {
    try {
      if (!user) {
        setError("Please login to add items to cart");
        return { success: false, message: "Please login to add items to cart" };
      }

      setLoading(true);
      const res = await API.post("/cart/add", { productId, quantity });
      setCart(res.data);
      return { success: true };
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add to cart");
      return {
        success: false,
        message: err.response?.data?.message || "Failed to add to cart",
      };
    } finally {
      setLoading(false);
    }
  };

  // Update cart item
  const updateCartItem = async (productId, quantity) => {
    try {
      setLoading(true);
      const res = await API.put("/cart/update", { productId, quantity });
      setCart(res.data);
      return { success: true };
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update cart");
      return {
        success: false,
        message: err.response?.data?.message || "Failed to update cart",
      };
    } finally {
      setLoading(false);
    }
  };

  // Remove from cart
  const removeFromCart = async (productId) => {
    try {
      setLoading(true);
      const res = await API.delete(`/cart/remove/${productId}`);
      setCart(res.data);
      return { success: true };
    } catch (err) {
      setError(err.response?.data?.message || "Failed to remove from cart");
      return {
        success: false,
        message: err.response?.data?.message || "Failed to remove from cart",
      };
    } finally {
      setLoading(false);
    }
  };

  // Clear cart
  const clearCart = async () => {
    try {
      setLoading(true);
      const res = await API.delete("/cart/clear");
      setCart(res.data);
      return { success: true };
    } catch (err) {
      setError(err.response?.data?.message || "Failed to clear cart");
      return {
        success: false,
        message: err.response?.data?.message || "Failed to clear cart",
      };
    } finally {
      setLoading(false);
    }
  };

  // Create order
  const createOrder = async (
    shippingAddress,
    paymentMethod,
    paymentDetails = null,
  ) => {
    try {
      setLoading(true);
      const orderData = {
        shippingAddress,
        paymentMethod,
      };

      // Add payment details if provided
      if (paymentDetails) {
        orderData.paymentDetails = paymentDetails;
      }

      const res = await API.post("/orders", orderData);

      // Clear cart state since backend clears it
      setCart({ items: [], total: 0 });
      return { success: true, order: res.data };
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create order");
      return {
        success: false,
        message: err.response?.data?.message || "Failed to create order",
      };
    } finally {
      setLoading(false);
    }
  };

  // Load user on initial mount
  useEffect(() => {
    loadUser();
  }, []);

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Context value
  const value = {
    user,
    cart,
    loading,
    error,
    setError,
    login,
    register,
    logout,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    createOrder,
    API,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppProvider;
