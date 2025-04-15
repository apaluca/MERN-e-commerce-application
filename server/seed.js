import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

const ProductCarousel = ({ products, autoPlay = true, interval = 4000 }) => {
  // Separate autoplay default from user preference
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(autoPlay);
  const [isHovering, setIsHovering] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const { addToCart, user } = useAppContext();
  const navigate = useNavigate();
  const autoPlayTimerRef = useRef(null);
  const minSwipeDistance = 50;

  // Handle next slide - memoized with useCallback to avoid recreating on every render
  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex === products.length - 1 ? 0 : prevIndex + 1
    );
  }, [products.length]);

  // Handle previous slide
  const prevSlide = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? products.length - 1 : prevIndex - 1
    );
  }, [products.length]);

  // Go to a specific slide
  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  // Handle add to cart
  const handleAddToCart = async (e, productId) => {
    e.preventDefault();
    e.stopPropagation();

    const result = await addToCart(productId, 1);
    if (result.success) {
      navigate("/cart");
    }
  };

  // Toggle autoplay on/off
  const toggleAutoPlay = () => {
    setAutoPlayEnabled((prev) => !prev);
  };

  // Set up auto-play - only active when autoPlayEnabled is true AND not hovering
  useEffect(() => {
    // Only run the autoplay if:
    // - There are multiple products
    // - Autoplay is explicitly enabled by the user
    // - Not currently being interacted with
    const shouldAutoPlay =
      products.length > 1 && autoPlayEnabled && !isHovering;

    if (shouldAutoPlay) {
      autoPlayTimerRef.current = setInterval(() => {
        nextSlide();
      }, interval);
    } else {
      // Clean up any existing interval
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current);
        autoPlayTimerRef.current = null;
      }
    }

    return () => {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current);
      }
    };
  }, [autoPlayEnabled, isHovering, interval, products.length, nextSlide]);

  // Pause on hover - but this doesn't change the autoPlayEnabled state
  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  // Touch event handlers for mobile swipe
  const onTouchStart = (e) => {
    setTouchEnd(null); // Reset touchEnd
    setTouchStart(e.targetTouches[0].clientX);
    setIsHovering(true); // Consider touch interaction as hovering
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }

    // Reset values
    setTouchStart(null);
    setTouchEnd(null);

    // End touch interaction after a short delay
    setTimeout(() => setIsHovering(false), 1000);
  };

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No featured products available.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Main carousel container with touch events */}
      <div
        className="relative w-full overflow-hidden rounded-xl shadow-xl bg-gradient-to-r from-blue-50 to-indigo-50"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Mobile swipe hint - only shown on mobile */}
        <div className="absolute top-2 left-2 right-2 z-30 bg-white/80 backdrop-blur-sm rounded-lg p-2 text-center text-xs text-gray-700 sm:hidden">
          Swipe to see more featured products
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-16 sm:w-24 h-16 sm:h-24 bg-blue-500 opacity-10 rounded-full -translate-x-8 -translate-y-8"></div>
        <div className="absolute bottom-0 right-0 w-20 sm:w-32 h-20 sm:h-32 bg-indigo-500 opacity-10 rounded-full translate-x-10 translate-y-10"></div>

        {/* Carousel container - adjusted height for mobile */}
        <div className="relative h-[600px] sm:h-[500px] md:h-[450px] lg:h-[500px] overflow-hidden">
          {products.map((product, index) => (
            <div
              key={product._id}
              className={`absolute top-0 left-0 w-full h-full transition-all duration-700 ease-in-out ${
                index === currentIndex
                  ? "opacity-100 z-10 translate-x-0"
                  : index < currentIndex
                    ? "opacity-0 -translate-x-full z-0"
                    : "opacity-0 translate-x-full z-0"
              }`}
            >
              {/* Stacked layout on mobile, side by side on desktop */}
              <div className="flex flex-col h-full sm:flex-row">
                {/* Product image section - entire area is now clickable */}
                <Link
                  to={`/products/${product._id}`}
                  className="w-full h-1/2 sm:w-1/2 sm:h-full relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 mix-blend-multiply z-10"></div>
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="object-cover w-full h-full transition-transform duration-10000 group-hover:scale-110"
                  />
                </Link>

                {/* Product info section */}
                <div className="w-full h-1/2 sm:w-1/2 sm:h-full p-4 sm:p-8 flex flex-col justify-center bg-white/90 backdrop-blur-sm">
                  {/* More discrete category tag */}
                  <span className="text-xs text-gray-500 tracking-wide mb-2 sm:mb-3 uppercase">
                    {product.category}
                  </span>

                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-2 sm:mb-3 leading-tight">
                    {product.name}
                  </h3>

                  <div className="h-0.5 w-12 sm:w-16 bg-gradient-to-r from-blue-500 to-indigo-600 mb-2 sm:mb-4"></div>

                  <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-6 line-clamp-2 sm:line-clamp-3">
                    {product.description}
                  </p>

                  <div className="mb-3 sm:mb-6">
                    <span className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-600">
                      ${product.price.toFixed(2)}
                    </span>
                    {product.stock <= 5 && product.stock > 0 && (
                      <span className="ml-2 sm:ml-3 text-xs sm:text-sm bg-red-100 text-red-700 px-2 py-1 rounded-full">
                        Only {product.stock} left!
                      </span>
                    )}
                  </div>

                  {/* Action buttons - only show Add to Cart/Sign in */}
                  <div className="hidden sm:flex">
                    {user && product.stock > 0 ? (
                      <button
                        onClick={(e) => handleAddToCart(e, product._id)}
                        className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full text-sm sm:text-base font-medium hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 hover:shadow-lg"
                      >
                        Add to Cart
                      </button>
                    ) : (
                      !user && (
                        <Link
                          to="/login"
                          className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full text-sm sm:text-base font-medium hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 hover:shadow-lg"
                        >
                          Sign in to Buy
                        </Link>
                      )
                    )}
                  </div>

                  {/* Mobile action button - only visible on mobile, full width */}
                  <div className="flex sm:hidden w-full mt-1">
                    {user && product.stock > 0 ? (
                      <button
                        onClick={(e) => handleAddToCart(e, product._id)}
                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-medium"
                      >
                        Add to Cart
                      </button>
                    ) : (
                      !user && (
                        <Link
                          to="/login"
                          className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-medium text-center"
                        >
                          Sign in to Buy
                        </Link>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Auto-play toggle - positioned in corner */}
        {products.length > 1 && (
          <button
            className="absolute top-10 sm:top-4 right-4 bg-white/80 hover:bg-white rounded-full w-12 h-12 sm:w-10 sm:h-10 flex items-center justify-center z-20 shadow-md hover:shadow-lg transition-all focus:outline-none"
            onClick={toggleAutoPlay}
            aria-label={autoPlayEnabled ? "Pause autoplay" : "Start autoplay"}
          >
            {autoPlayEnabled ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 sm:h-5 sm:w-5 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 sm:h-5 sm:w-5 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            )}
          </button>
        )}
      </div>

      {/* Navigation with indicators and arrows positioned below content */}
      {products.length > 1 && (
        <div className="mt-2 sm:mt-4 flex items-center justify-center">
          <button
            onClick={prevSlide}
            className="p-2 text-gray-600 hover:text-blue-600 focus:outline-none transition-colors"
            aria-label="Previous slide"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <div className="flex items-center mx-4">
            {products.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`mx-1 transition-all focus:outline-none ${
                  index === currentIndex
                    ? "w-8 h-2 bg-blue-600 rounded-full"
                    : "w-2 h-2 bg-gray-300 rounded-full hover:bg-blue-300"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          <button
            onClick={nextSlide}
            className="p-2 text-gray-600 hover:text-blue-600 focus:outline-none transition-colors"
            aria-label="Next slide"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
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
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductCarousel;
