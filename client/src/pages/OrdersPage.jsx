import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

const OrdersPage = () => {
  const { API, loading, setError } = useAppContext();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const response = await API.get("/orders");
        setOrders(response.data);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setError("Failed to load your orders.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [API, setError]);

  // Function to format date
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    let color;
    switch (status) {
      case "pending":
        color = "bg-yellow-100 text-yellow-800";
        break;
      case "processing":
        color = "bg-blue-100 text-blue-800";
        break;
      case "shipped":
        color = "bg-indigo-100 text-indigo-800";
        break;
      case "delivered":
        color = "bg-green-100 text-green-800";
        break;
      case "cancelled":
        color = "bg-red-100 text-red-800";
        break;
      default:
        color = "bg-gray-100 text-gray-800";
    }

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (isLoading || loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <p className="text-gray-600 mb-4">
            You haven't placed any orders yet.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Shop Now
          </Link>
        </div>
      ) : (
        <div className="bg-white shadow-sm overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {orders.map((order) => (
              <li key={order._id}>
                <div className="px-4 py-5 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col sm:flex-row sm:items-center">
                      <h3 className="text-sm font-medium text-gray-900 mb-1 sm:mb-0 sm:mr-4">
                        Order #{order._id.substring(order._id.length - 8)}
                      </h3>
                      <div className="text-sm text-gray-500">
                        Placed on {formatDate(order.createdAt)}
                      </div>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>

                  <div className="mt-4 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <div className="flex items-center text-sm text-gray-500">
                        <span className="mr-2">Total:</span>
                        <span className="font-medium text-gray-900">
                          ${order.total.toFixed(2)}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                        <span className="mr-2">Items:</span>
                        <span className="font-medium text-gray-900">
                          {order.items.length}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 sm:mt-0">
                      <Link
                        to={`/orders/${order._id}`}
                        className="text-sm font-medium text-blue-600 hover:text-blue-500"
                      >
                        View details
                      </Link>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flow-root">
                      <ul className="divide-y divide-gray-200">
                        {order.items.slice(0, 2).map((item) => (
                          <li key={item._id} className="py-3 flex">
                            <div className="flex-shrink-0 w-16 h-16 border border-gray-200 rounded-md overflow-hidden">
                              <img
                                src={
                                  item.product?.imageUrl ||
                                  "https://dummyimage.com/200x200/e0e0e0/333333&text=Product"
                                }
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="ml-4 flex-1 flex flex-col">
                              <div>
                                <div className="flex justify-between text-sm font-medium text-gray-900">
                                  <h4>{item.name}</h4>
                                  <p className="ml-4">
                                    ${(item.price * item.quantity).toFixed(2)}
                                  </p>
                                </div>
                                <p className="mt-1 text-sm text-gray-500">
                                  Qty: {item.quantity}
                                </p>
                              </div>
                            </div>
                          </li>
                        ))}
                        {order.items.length > 2 && (
                          <li className="py-2">
                            <Link
                              to={`/orders/${order._id}`}
                              className="text-sm text-gray-500 hover:text-gray-700"
                            >
                              + {order.items.length - 2} more item(s)
                            </Link>
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
