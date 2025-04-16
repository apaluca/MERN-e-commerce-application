import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import Pagination from "../components/Pagination";

const ProductCard = ({ product, handleAddToCart, user }) => {
  // Get main image and any additional images
  const mainImage = product.imageUrl;
  const hasMultipleImages = product.images && product.images.length > 0;

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow">
      <Link to={`/products/${product._id}`} className="block relative">
        <img
          src={mainImage}
          alt={product.name}
          className="w-full h-48 object-cover"
        />
        {hasMultipleImages && (
          <span className="absolute bottom-1 right-1 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-md">
            +{product.images.length} photos
          </span>
        )}
      </Link>
      <div className="p-4">
        <Link to={`/products/${product._id}`} className="hover:text-blue-500">
          <h3 className="font-semibold text-lg mb-2 text-gray-800">
            {product.name}
          </h3>
        </Link>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {product.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-gray-800 font-bold">
            ${product.price.toFixed(2)}
          </span>
          <div className="flex items-center">
            <span
              className={`text-sm mr-2 ${product.stock > 0 ? "text-green-600" : "text-red-600"}`}
            >
              {product.stock > 0
                ? `In Stock (${product.stock})`
                : "Out of Stock"}
            </span>
            {user && product.stock > 0 ? (
              <button
                onClick={() => handleAddToCart(product._id)}
                className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-600 transition-colors"
              >
                Add to Cart
              </button>
            ) : !user ? (
              <Link
                to="/login"
                className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-600 transition-colors"
              >
                Sign in
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

const ProductsPage = () => {
  const { API, addToCart, user, setError } = useAppContext();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const navigate = useNavigate();
  const location = useLocation();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  useEffect(() => {
    // Get query parameters
    const queryParams = new URLSearchParams(location.search);
    const categoryParam = queryParams.get("category");
    const pageParam = queryParams.get("page");
    const perPageParam = queryParams.get("perPage");
    const searchParam = queryParams.get("search");
    const sortParam = queryParams.get("sort");
    const minPriceParam = queryParams.get("minPrice");
    const maxPriceParam = queryParams.get("maxPrice");

    // Apply params if they exist
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }

    if (pageParam && !isNaN(parseInt(pageParam))) {
      setCurrentPage(parseInt(pageParam));
    }

    if (perPageParam && !isNaN(parseInt(perPageParam))) {
      setItemsPerPage(parseInt(perPageParam));
    }

    if (searchParam) {
      setSearchQuery(searchParam);
    }

    if (sortParam) {
      setSortBy(sortParam);
    }

    if (minPriceParam) {
      setPriceRange((prev) => ({ ...prev, min: minPriceParam }));
    }

    if (maxPriceParam) {
      setPriceRange((prev) => ({ ...prev, max: maxPriceParam }));
    }
  }, [location.search]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Get all products for client-side filtering
        const response = await API.get("/products");

        // Now, response.data has a structure with products and pagination
        if (response.data && response.data.products) {
          setProducts(response.data.products);

          // Extract unique categories from the products array
          const uniqueCategories = [
            ...new Set(
              response.data.products.map((product) => product.category)
            ),
          ];
          setCategories(uniqueCategories);
        } else {
          console.error("Unexpected API response format:", response.data);
          setError("Received an unexpected response format from the server");
          setProducts([]);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        setError("Failed to load products.");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [API, setError]);

  // Update URL with current filters and pagination
  useEffect(() => {
    const queryParams = new URLSearchParams();

    if (selectedCategory) {
      queryParams.set("category", selectedCategory);
    }

    if (currentPage > 1) {
      queryParams.set("page", currentPage.toString());
    }

    if (itemsPerPage !== 12) {
      // Default value
      queryParams.set("perPage", itemsPerPage.toString());
    }

    if (searchQuery) {
      queryParams.set("search", searchQuery);
    }

    if (sortBy) {
      queryParams.set("sort", sortBy);
    }

    if (priceRange.min) {
      queryParams.set("minPrice", priceRange.min);
    }

    if (priceRange.max) {
      queryParams.set("maxPrice", priceRange.max);
    }

    const queryString = queryParams.toString();
    const newUrl = queryString ? `?${queryString}` : "";

    // Replace state to avoid pushing a new history entry for each filter change
    navigate(`/products${newUrl}`, { replace: true });
  }, [
    navigate,
    selectedCategory,
    currentPage,
    itemsPerPage,
    searchQuery,
    sortBy,
    priceRange,
  ]);

  // Scroll to top whenever pagination changes
  useEffect(() => {
    // Add a small delay to ensure the DOM has updated
    const timeoutId = setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }, 50);

    return () => clearTimeout(timeoutId);
  }, [currentPage, itemsPerPage]);

  const handleAddToCart = async (productId) => {
    if (!user) {
      setError("Please login to add items to cart");
      return;
    }

    const result = await addToCart(productId, 1);
    if (result.success) {
      navigate("/cart"); // Redirect to cart on success
    }
  };

  // Filter products
  const filteredProducts = products
    .filter(
      (product) => !selectedCategory || product.category === selectedCategory
    )
    .filter(
      (product) =>
        !searchQuery ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter(
      (product) =>
        (!priceRange.min || product.price >= parseFloat(priceRange.min)) &&
        (!priceRange.max || product.price <= parseFloat(priceRange.max))
    );

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price-asc") {
      return a.price - b.price;
    } else if (sortBy === "price-desc") {
      return b.price - a.price;
    } else if (sortBy === "name-asc") {
      return a.name.localeCompare(b.name);
    } else if (sortBy === "name-desc") {
      return b.name.localeCompare(a.name);
    } else if (sortBy === "newest") {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const indexOfLastProduct = currentPage * itemsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
  const currentProducts = sortedProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery, priceRange, sortBy]);

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(value);
    setCurrentPage(1); // Reset to page 1 when changing items per page
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSelectedCategory("");
    setSortBy("");
    setSearchQuery("");
    setPriceRange({ min: "", max: "" });
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Products</h1>

        <div className="mb-8">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="md:flex md:justify-between md:items-center">
              {/* Search Bar */}
              <div className="mb-4 md:mb-0 md:w-1/3">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                {/* Category Filter */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>

                {/* Sort Options */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sort By</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name-asc">Name: A to Z</option>
                  <option value="name-desc">Name: Z to A</option>
                  <option value="newest">Newest First</option>
                </select>
              </div>
            </div>

            {/* Price Range Filter */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Price Range
                </h3>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) =>
                      setPriceRange({ ...priceRange, min: e.target.value })
                    }
                    className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span>to</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) =>
                      setPriceRange({ ...priceRange, max: e.target.value })
                    }
                    className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-end justify-between">
                <div className="text-sm text-gray-600">
                  <p>Showing {sortedProducts.length} products</p>
                  {(selectedCategory ||
                    searchQuery ||
                    priceRange.min ||
                    priceRange.max ||
                    sortBy) && (
                    <p>
                      {selectedCategory && (
                        <span className="mr-2">
                          Category: {selectedCategory}
                        </span>
                      )}
                      {searchQuery && (
                        <span className="mr-2">Search: "{searchQuery}"</span>
                      )}
                      {(priceRange.min || priceRange.max) && (
                        <span className="mr-2">
                          Price: {priceRange.min || "0"} -{" "}
                          {priceRange.max || "∞"}
                        </span>
                      )}
                    </p>
                  )}
                </div>

                {(selectedCategory ||
                  searchQuery ||
                  priceRange.min ||
                  priceRange.max ||
                  sortBy) && (
                  <button
                    onClick={handleClearFilters}
                    className="px-3 py-2 text-sm text-blue-600 hover:text-blue-800"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-500">Loading products...</div>
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-xl">No products found.</p>
            <p className="text-gray-400 mt-2">
              Try changing your search criteria.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {currentProducts.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  handleAddToCart={handleAddToCart}
                  user={user}
                />
              ))}
            </div>

            {/* Using the reusable Pagination component */}
            {sortedProducts.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={handleItemsPerPageChange}
                itemsPerPageOptions={[12, 24, 36, 48]}
                itemsLabel="products"
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
