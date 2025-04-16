import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import ProductCarousel from "../components/ProductCarousel";

const HomePage = () => {
  const { API, user } = useAppContext();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [carouselSettings, setCarouselSettings] = useState({
    autoPlay: true,
    interval: 4000,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch featured products for carousel
        const response = await API.get("/products?featured=true");

        // Check if the response has the expected structure
        if (response.data && response.data.products) {
          setFeaturedProducts(response.data.products);
        } else {
          // Fallback in case the API returns just an array of products
          setFeaturedProducts(
            Array.isArray(response.data)
              ? response.data.filter((p) => p.featured)
              : [],
          );
        }

        // Fetch carousel settings
        try {
          const settingsRes = await API.get("/settings/carousel");
          if (settingsRes.data) {
            setCarouselSettings(settingsRes.data);
          }
        } catch (settingsError) {
          console.error("Error fetching carousel settings:", settingsError);
          // Use default settings on error
        }

        // Fetch categories
        const categoryRes = await API.get("/products");

        if (categoryRes.data && categoryRes.data.products) {
          // Extract unique categories
          const uniqueCategories = [
            ...new Set(
              categoryRes.data.products.map((product) => product.category),
            ),
          ];
          setCategories(uniqueCategories);
        } else if (Array.isArray(categoryRes.data)) {
          // Fallback for the old format
          const uniqueCategories = [
            ...new Set(categoryRes.data.map((product) => product.category)),
          ];
          setCategories(uniqueCategories);
        } else {
          setCategories([]);
        }
      } catch (error) {
        console.error("Error fetching homepage data:", error);
        setFeaturedProducts([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [API]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="flex flex-col items-center">
            <div className="w-full text-center">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-4">
                Welcome to ReactRetail
              </h1>
              <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
                Your one-stop shop for all your shopping needs. Find the best
                products at the best prices.
              </p>
              <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <Link
                  to="/products"
                  className="bg-white text-blue-600 font-semibold px-6 py-3 rounded-md shadow hover:bg-gray-100 transition-colors text-center"
                >
                  Shop Now
                </Link>
                {!user && (
                  <Link
                    to="/register"
                    className="bg-blue-700 text-white font-semibold px-6 py-3 rounded-md shadow hover:bg-blue-800 transition-colors text-center"
                  >
                    Sign Up
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Products Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Featured Products
        </h2>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-500">Loading products...</div>
          </div>
        ) : featuredProducts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No featured products available.</p>
            {user && user.role === "admin" && (
              <Link
                to="/admin/carousel"
                className="text-blue-500 hover:underline mt-2 inline-block"
              >
                Configure featured products
              </Link>
            )}
          </div>
        ) : (
          <ProductCarousel
            products={featuredProducts}
            autoPlay={carouselSettings.autoPlay}
            interval={carouselSettings.interval}
          />
        )}

        <div className="mt-8 text-center">
          <Link
            to="/products"
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            View All Products
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="ml-2 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
      </div>

      {/* Categories Section */}
      <div className="bg-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Shop by Category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.slice(0, 8).map((category) => (
              <Link
                key={category}
                to={`/products?category=${category}`}
                className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow group"
              >
                <div className="text-center">
                  <span className="block text-xl text-gray-800 font-medium group-hover:text-blue-500 capitalize">
                    {category}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
