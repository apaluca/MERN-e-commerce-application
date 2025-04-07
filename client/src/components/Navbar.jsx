import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const Navbar = () => {
  const { user, cart, logout } = useAppContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Close admin dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsAdminDropdownOpen(false);
      }
    };

    // Add event listener when dropdown is open
    if (isAdminDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    // Cleanup event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isAdminDropdownOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleAdminDropdown = () => {
    setIsAdminDropdownOpen(!isAdminDropdownOpen);
  };

  return (
    <nav className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 text-xl font-bold">
              ReactRetail
            </Link>
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-4">
                <Link to="/" className="px-3 py-2 rounded-md hover:bg-gray-700">
                  Home
                </Link>
                <Link to="/products" className="px-3 py-2 rounded-md hover:bg-gray-700">
                  Products
                </Link>
                {user && (
                  <Link to="/orders" className="px-3 py-2 rounded-md hover:bg-gray-700">
                    My Orders
                  </Link>
                )}
                {user && (
                  <Link to="/profile" className="px-3 py-2 rounded-md hover:bg-gray-700">
                    Profile
                  </Link>
                )}
                {user && user.role === 'admin' && (
                  <div className="relative" ref={dropdownRef}>
                    <button 
                      className="px-3 py-2 rounded-md hover:bg-gray-700 focus:outline-none"
                      onClick={toggleAdminDropdown}
                      aria-expanded={isAdminDropdownOpen}
                    >
                      Admin
                      <svg 
                        className={`ml-1 inline-block h-4 w-4 transition-transform ${isAdminDropdownOpen ? 'transform rotate-180' : ''}`}
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {isAdminDropdownOpen && (
                      <div 
                        className="absolute z-10 bg-gray-800 text-white mt-2 rounded-md shadow-lg py-1 min-w-max"
                      >
                        <Link 
                          to="/admin/dashboard" 
                          className="block px-4 py-2 hover:bg-gray-700 whitespace-nowrap"
                          onClick={() => setIsAdminDropdownOpen(false)}
                        >
                          Dashboard
                        </Link>
                        <Link 
                          to="/admin/users" 
                          className="block px-4 py-2 hover:bg-gray-700 whitespace-nowrap"
                          onClick={() => setIsAdminDropdownOpen(false)}
                        >
                          Manage Users
                        </Link>
                        <Link 
                          to="/admin/products" 
                          className="block px-4 py-2 hover:bg-gray-700 whitespace-nowrap"
                          onClick={() => setIsAdminDropdownOpen(false)}
                        >
                          Manage Products
                        </Link>
                        <Link 
                          to="/admin/orders" 
                          className="block px-4 py-2 hover:bg-gray-700 whitespace-nowrap"
                          onClick={() => setIsAdminDropdownOpen(false)}
                        >
                          Manage Orders
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="flex items-center">
              {user ? (
                <>
                  <Link to="/cart" className="relative px-3 py-2 rounded-md hover:bg-gray-700 mr-2">
                    Cart
                    {cart.items.length > 0 && (
                      <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-blue-500 text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {cart.items.length}
                      </span>
                    )}
                  </Link>
                  <span className="px-3 py-2 text-gray-300">
                    Hello, {user.username}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-2 rounded-md hover:bg-gray-700"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="px-3 py-2 rounded-md hover:bg-gray-700">
                    Login
                  </Link>
                  <Link to="/register" className="ml-2 px-3 py-2 bg-blue-500 rounded-md hover:bg-blue-600">
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="md:hidden flex items-center">
            {user && (
              <Link to="/cart" className="relative px-3 py-2 rounded-md hover:bg-gray-700 mr-2">
                Cart
                {cart.items.length > 0 && (
                  <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-blue-500 text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cart.items.length}
                  </span>
                )}
              </Link>
            )}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md hover:bg-gray-700 focus:outline-none"
            >
              <svg 
                className="h-6 w-6" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link 
              to="/"
              className="block px-3 py-2 rounded-md hover:bg-gray-700"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/products"
              className="block px-3 py-2 rounded-md hover:bg-gray-700"
              onClick={() => setIsMenuOpen(false)}
            >
              Products
            </Link>
            {user && (
              <Link 
                to="/orders"
                className="block px-3 py-2 rounded-md hover:bg-gray-700"
                onClick={() => setIsMenuOpen(false)}
              >
                My Orders
              </Link>
            )}
            {user && (
              <Link 
                to="/profile"
                className="block px-3 py-2 rounded-md hover:bg-gray-700"
                onClick={() => setIsMenuOpen(false)}
              >
                My Profile
              </Link>
            )}
            {user && user.role === 'admin' && (
              <>
                <div className="border-t border-gray-700 my-2 py-1"></div>
                <p className="px-3 py-1 text-sm text-gray-400">Admin Panel</p>
                <Link 
                  to="/admin/dashboard"
                  className="block px-3 py-2 rounded-md hover:bg-gray-700 pl-6"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/admin/users"
                  className="block px-3 py-2 rounded-md hover:bg-gray-700 pl-6"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Manage Users
                </Link>
                <Link 
                  to="/admin/products"
                  className="block px-3 py-2 rounded-md hover:bg-gray-700 pl-6"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Manage Products
                </Link>
                <Link 
                  to="/admin/orders"
                  className="block px-3 py-2 rounded-md hover:bg-gray-700 pl-6"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Manage Orders
                </Link>
              </>
            )}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-700">
            {user ? (
              <div className="px-2 space-y-1">
                <span className="block px-3 py-2 text-gray-300">
                  Hello, {user.username}
                </span>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md hover:bg-gray-700"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="px-2 space-y-1">
                <Link 
                  to="/login"
                  className="block px-3 py-2 rounded-md hover:bg-gray-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  to="/register"
                  className="block px-3 py-2 bg-blue-500 rounded-md hover:bg-blue-600 mt-1"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;