import { useNavigate, Link } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

const CartPage = () => {
  const { cart, updateCartItem, removeFromCart, loading } = useAppContext();
  const navigate = useNavigate();

  const handleQuantityChange = async (productId, quantity) => {
    if (quantity < 1) return;
    await updateCartItem(productId, quantity);
  };

  const handleRemoveItem = async (productId) => {
    await removeFromCart(productId);
  };

  const handleCheckout = () => {
    navigate("/checkout");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading cart...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">
        Your Shopping Cart
      </h1>

      {cart.items.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <p className="text-gray-600 mb-4">Your cart is empty.</p>
          <Link
            to="/products"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Product
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Price
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Quantity
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Total
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {cart.items.map((item) => (
                  <tr key={item.product._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <Link
                            to={`/products/${item.product._id}`}
                            title="View product details"
                          >
                            <img
                              className="h-10 w-10 rounded-md object-cover cursor-pointer hover:opacity-80 transition-opacity"
                              src={item.product.imageUrl}
                              alt={item.product.name}
                            />
                          </Link>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            <Link
                              to={`/products/${item.product._id}`}
                              className="hover:text-blue-600 transition-colors"
                              title="View product details"
                            >
                              {item.product.name}
                            </Link>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        ${item.price.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <button
                          onClick={() =>
                            handleQuantityChange(
                              item.product._id,
                              item.quantity - 1,
                            )
                          }
                          className="h-8 px-2 border border-gray-300 bg-gray-100 text-gray-600 rounded-l-md hover:bg-gray-200 flex items-center justify-center"
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            handleQuantityChange(
                              item.product._id,
                              parseInt(e.target.value) || 1,
                            )
                          }
                          className="h-8 w-12 border-t border-b border-gray-300 px-2 text-center focus:outline-none appearance-none"
                          min="1"
                          style={{
                            WebkitAppearance: "none",
                            MozAppearance: "textfield",
                          }}
                        />
                        <button
                          onClick={() =>
                            handleQuantityChange(
                              item.product._id,
                              item.quantity + 1,
                            )
                          }
                          className="h-8 px-2 border border-gray-300 bg-gray-100 text-gray-600 rounded-r-md hover:bg-gray-200 flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleRemoveItem(item.product._id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-700">
                  Subtotal (
                  {cart.items.reduce((acc, item) => acc + item.quantity, 0)}{" "}
                  items):
                </p>
                <p className="text-lg font-semibold text-gray-900">
                  ${cart.total.toFixed(2)}
                </p>
              </div>
              <div className="flex space-x-4">
                <Link
                  to="/products"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 bg-white rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Continue Shopping
                </Link>
                <button
                  onClick={handleCheckout}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
