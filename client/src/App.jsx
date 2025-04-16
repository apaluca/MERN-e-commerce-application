import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AppProvider, useAppContext } from "./context/AppContext";
import { StripeProvider } from "./context/StripeContext";

// Custom component for improved UX
import ScrollToTop from "./components/ScrollToTop";

// Page components
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import ProfilePage from "./pages/ProfilePage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrdersPage from "./pages/OrdersPage";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import AdminDashboardPage from "./pages/admin/DashboardPage";
import AdminUsersPage from "./pages/admin/UsersPage";
import AdminProductsPage from "./pages/admin/ProductsPage";
import AdminOrdersPage from "./pages/admin/OrdersPage";
import CarouselSettingsPage from "./pages/admin/CarouselSettingsPage";
import NotFoundPage from "./pages/NotFoundPage";

// Layout components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Alert from "./components/Alert";

// Protected route wrapper
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAppContext();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" />;
  }

  return children;
};

function App() {
  return (
    <AppProvider>
      <StripeProvider>
        <Router>
          <ScrollToTop />
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <Alert />
            <main className="flex-grow">
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/products/:id" element={<ProductDetailPage />} />

                {/* Protected routes - User */}
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/cart"
                  element={
                    <ProtectedRoute>
                      <CartPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute>
                      <CheckoutPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders"
                  element={
                    <ProtectedRoute>
                      <OrdersPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/order-confirmation"
                  element={
                    <ProtectedRoute>
                      <OrderConfirmationPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders/:id"
                  element={
                    <ProtectedRoute>
                      <OrderDetailPage />
                    </ProtectedRoute>
                  }
                />

                {/* Protected routes - Admin */}
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminDashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminUsersPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/products"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminProductsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/orders"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminOrdersPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/carousel"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <CarouselSettingsPage />
                    </ProtectedRoute>
                  }
                />

                {/* 404 page */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </StripeProvider>
    </AppProvider>
  );
}

export default App;
