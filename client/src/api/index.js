import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:3000" });

// Request interceptor to include the token in all requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle unauthorized errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect to login for auth errors with status 401
    // Exclude non-auth-related API errors
    if (
      error.response &&
      error.response.status === 401 &&
      !error.config.url.includes("/products")
    ) {
      // Redirect to login (can be handled by app)
      console.log("Authentication required. Please log in.");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// Auth API calls
export const login = (formData) => API.post("/auth/login", formData);
export const register = (formData) => API.post("/auth/register", formData);
export const getCurrentUser = () => API.get("/auth/me");

// Product API calls
export const fetchProducts = () => API.get("/products");
export const fetchProductById = (id) => API.get(`/products/${id}`);
export const createProduct = (productData) =>
  API.post("/products", productData);
export const updateProduct = (id, productData) =>
  API.put(`/products/${id}`, productData);
export const deleteProduct = (id) => API.delete(`/products/${id}`);

// Cart API calls
export const fetchCart = () => API.get("/cart");
export const addToCart = (productId, quantity) =>
  API.post("/cart/add", { productId, quantity });
export const updateCartItem = (productId, quantity) =>
  API.put("/cart/update", { productId, quantity });
export const removeFromCart = (productId) =>
  API.delete(`/cart/remove/${productId}`);
export const clearCart = () => API.delete("/cart/clear");

// Order API calls
export const fetchOrders = () => API.get("/orders");
export const fetchAllOrders = () => API.get("/orders/all");
export const fetchOrderById = (id) => API.get(`/orders/${id}`);
export const createOrder = (orderData) => API.post("/orders", orderData);
export const updateOrderStatus = (id, status) =>
  API.put(`/orders/${id}/status`, { status });

// Admin API calls
export const fetchUsers = () => API.get("/admin/users");
export const fetchUserById = (id) => API.get(`/admin/users/${id}`);
export const updateUserRole = (id, role) =>
  API.put(`/admin/users/${id}/role`, { role });
export const updateUserStatus = (id, active) =>
  API.put(`/admin/users/${id}/status`, { active });
export const deleteUser = (id) => API.delete(`/admin/users/${id}`);

export default API;
