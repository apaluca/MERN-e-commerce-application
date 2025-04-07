import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const OrderStatusStepper = ({ status }) => {
  const steps = ['pending', 'processing', 'shipped', 'delivered'];
  
  // Get the current step index (or default to cancelled)
  const currentStepIndex = steps.indexOf(status);
  const isCancelled = status === 'cancelled';
  
  return (
    <div className="w-full py-6">
      {isCancelled ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <strong className="font-bold">Cancelled:</strong>
          <span className="block sm:inline"> This order has been cancelled.</span>
        </div>
      ) : (
        <div className="w-full">
          <div className="flex items-center w-full">
            {steps.map((step, index) => (
              <div key={step} className="relative flex-1 flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  index <= currentStepIndex ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {index + 1}
                </div>
                <div className="text-xs mt-2 text-center capitalize">
                  {step}
                </div>
                
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className={`absolute top-5 left-1/2 w-full h-0.5 ${
                    index < currentStepIndex ? 'bg-blue-600' : 'bg-gray-200'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { API, setError } = useAppContext();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await API.get(`/orders/${id}`);
        setOrder(response.data);
      } catch (error) {
        console.error('Error fetching order:', error);
        setError('Failed to load order details.');
        navigate('/orders');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrder();
  }, [API, id, navigate, setError]);
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading order details...</div>
      </div>
    );
  }
  
  if (!order) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Order Not Found</h2>
          <p className="text-gray-600 mb-8">The order you're looking for doesn't exist or you don't have permission to view it.</p>
          <Link
            to="/orders"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Order Details</h1>
        <Link
          to="/orders"
          className="text-blue-600 hover:text-blue-800 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Orders
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                Order #{order._id.substring(order._id.length - 8)}
              </h2>
              <p className="text-sm text-gray-600">Placed on {formatDate(order.createdAt)}</p>
            </div>
            <div className="mt-2 sm:mt-0 flex items-center">
              <span className="mr-2 text-sm text-gray-600">Status:</span>
              <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                order.status === 'delivered' ? 'bg-green-100 text-green-800' : 
                order.status === 'shipped' ? 'bg-blue-100 text-blue-800' : 
                order.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                'bg-yellow-100 text-yellow-800'
              }`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <OrderStatusStepper status={order.status} />
          
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-base font-medium text-gray-900 mb-2">Shipping Address</h3>
              <address className="not-italic">
                <p>{order.shippingAddress.street}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                <p>{order.shippingAddress.country}</p>
              </address>
            </div>
            
            <div>
              <h3 className="text-base font-medium text-gray-900 mb-2">Payment Information</h3>
              <p className="text-gray-800">
                <span className="font-medium">Method: </span>
                {order.paymentMethod === 'credit_card' ? 'Credit Card' : 
                 order.paymentMethod === 'paypal' ? 'PayPal' : 'Cash on Delivery'}
              </p>
              <p className="text-gray-800 mt-2">
                <span className="font-medium">Total: </span>
                ${order.total.toFixed(2)}
              </p>
            </div>
          </div>
          
          <div className="mt-8">
            <h3 className="text-base font-medium text-gray-900 mb-4">Order Items</h3>
            <div className="border rounded-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {order.items.map((item) => (
                    <tr key={item._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-md overflow-hidden">
                            <img 
                              src={item.product?.imageUrl || "https://dummyimage.com/200x200/e0e0e0/333333&text=Product"} 
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{item.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">${item.price.toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{item.quantity}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">${(item.price * item.quantity).toFixed(2)}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end">
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Subtotal:</span>
                <span className="text-gray-900">${order.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Shipping:</span>
                <span className="text-gray-900">Free</span>
              </div>
              <div className="flex justify-between font-medium mt-2 pt-2 border-t border-gray-200">
                <span className="text-gray-900">Total:</span>
                <span className="text-gray-900">${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-center space-x-4 mt-8">
        <Link
          to="/orders"
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          Back to Orders
        </Link>
        <Link
          to="/products"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default OrderDetailPage;