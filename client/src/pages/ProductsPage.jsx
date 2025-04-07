import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const ProductsPage = () => {
  const { API, addToCart, user, setError } = useAppContext();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  
  const location = useLocation();
  
  useEffect(() => {
    // Extract category from URL query params
    const queryParams = new URLSearchParams(location.search);
    const categoryParam = queryParams.get('category');
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [location.search]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await API.get('/products');
        setProducts(response.data);
        
        // Extract unique categories
        const uniqueCategories = [...new Set(response.data.map(product => product.category))];
        setCategories(uniqueCategories);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Failed to load products.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [API, setError]);

  const handleAddToCart = async (productId) => {
    if (!user) {
      // Redirect or show login prompt
      setError('Please login to add items to cart');
      return;
    }
    
    await addToCart(productId, 1);
  };

  // Filter products by category, search query, and price range
  const filteredProducts = products
    .filter(product => !selectedCategory || product.category === selectedCategory)
    .filter(product => 
      !searchQuery || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter(product => 
      (!priceRange.min || product.price >= parseFloat(priceRange.min)) && 
      (!priceRange.max || product.price <= parseFloat(priceRange.max))
    );

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-asc') {
      return a.price - b.price;
    } else if (sortBy === 'price-desc') {
      return b.price - a.price;
    } else if (sortBy === 'name-asc') {
      return a.name.localeCompare(b.name);
    } else if (sortBy === 'name-desc') {
      return b.name.localeCompare(a.name);
    }
    return 0;
  });

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
                </select>
              </div>
            </div>
            
            {/* Price Range Filter */}
            <div className="mb-4 mt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Price Range</h3>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                  className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span>to</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                  className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => setPriceRange({ min: '', max: '' })}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Reset
                </button>
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
            <p className="text-gray-400 mt-2">Try changing your search criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {sortedProducts.map((product) => (
              <div key={product._id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow">
                <Link to={`/products/${product._id}`}>
                  <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    className="w-full h-48 object-cover"
                  />
                </Link>
                <div className="p-4">
                  <Link to={`/products/${product._id}`} className="hover:text-blue-500">
                    <h3 className="font-semibold text-lg mb-2 text-gray-800">{product.name}</h3>
                  </Link>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-800 font-bold">${product.price.toFixed(2)}</span>
                    <div className="flex items-center">
                      <span className={`text-sm mr-2 ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;