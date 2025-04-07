import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import ReviewSection from '../components/ReviewSection';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { API, addToCart, user } = useAppContext();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImage, setCurrentImage] = useState(0);
  const [productImages, setProductImages] = useState([]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await API.get(`/products/${id}`);
        setProduct(response.data);
        
        // Just using the same image multiple times as a placeholder
        setProductImages([
          response.data.imageUrl,
          response.data.imageUrl,
          response.data.imageUrl
        ]);
      } catch (error) {
        console.error('Error fetching product:', error);
        setError('Product not found or an error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [API, id]);

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && (!product || value <= product.stock)) {
      setQuantity(value);
    }
  };

  const handleAddToCart = async () => {
    if (product && quantity > 0) {
      const result = await addToCart(product._id, quantity);
      if (result.success) {
        navigate('/cart');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-gray-500">Loading product...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Product Not Found</h2>
          <p className="text-gray-600 mb-8">{error || "The product you're looking for doesn't exist."}</p>
          <Link
            to="/products"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/2">
            <div className="relative pb-[75%] h-0">
              <img
                src={productImages[currentImage]}
                alt={product.name}
                className="absolute h-full w-full object-cover"
              />
            </div>
            
            {/* Thumbnail Gallery */}
            <div className="flex p-4 space-x-2">
              {productImages.map((image, index) => (
                <button 
                  key={index}
                  onClick={() => setCurrentImage(index)}
                  className={`w-20 h-20 border-2 rounded overflow-hidden ${
                    currentImage === index ? 'border-blue-500' : 'border-gray-200'
                  }`}
                >
                  <img src={image} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
          <div className="md:w-1/2 p-8">
            <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">
              {product.category}
            </div>
            <h1 className="mt-2 text-3xl font-bold text-gray-900">{product.name}</h1>
            <div className="mt-4">
              <span className="text-2xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
            </div>
            <div className="mt-4 space-y-6">
              <p className="text-gray-600">{product.description}</p>
            </div>
            
            <div className="mt-6">
              <div className="flex items-center">
                <div className={`mr-2 flex-shrink-0 h-3 w-3 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <p className={`text-sm ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
                </p>
              </div>
            </div>
            
            {product.stock > 0 && user && (
              <div className="mt-6">
                <div className="flex items-center space-x-4">
                  <div>
                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                      Quantity
                    </label>
                    <div className="mt-1 flex rounded-md">
                      <button
                        type="button"
                        onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                        className="px-3 py-1 border border-gray-300 bg-gray-100 text-gray-600 rounded-l-md hover:bg-gray-200"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        id="quantity"
                        name="quantity"
                        min="1"
                        max={product.stock}
                        value={quantity}
                        onChange={handleQuantityChange}
                        className="w-16 border-t border-b border-gray-300 px-2 py-1 text-center focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => quantity < product.stock && setQuantity(quantity + 1)}
                        className="px-3 py-1 border border-gray-300 bg-gray-100 text-gray-600 rounded-r-md hover:bg-gray-200"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={handleAddToCart}
                    className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            )}
            
            {!user && (
              <div className="mt-6">
                <Link
                  to="/login"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Sign in to purchase
                </Link>
              </div>
            )}
            
            <div className="mt-8 border-t border-gray-200 pt-4">
              <Link
                to="/products"
                className="text-blue-600 hover:text-blue-800 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Products
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Product Reviews Section */}
      {product && <ReviewSection productId={product._id} />}
    </div>
  );
};

export default ProductDetailPage;