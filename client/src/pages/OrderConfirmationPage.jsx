import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const OrderConfirmationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  
  useEffect(() => {
    // Check if we have order data in location state
    if (location.state && location.state.order) {
      setOrder(location.state.order);
    } else {
      // If no order data, redirect to orders page
      navigate('/orders');
    }
  }, [location, navigate]);
  
  if (!order) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }
  
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-green-100 rounded-full p-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">Order Confirmed!</h1>
        <p className="text-center text-gray-600 mb-8">
          Thank you for your purchase. Your order has been received and is being processed.
        </p>
        
        <div className="border-t border-b border-gray-200 py-4 mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Order Number:</span>
            <span className="font-medium">#{order._id.substring(order._id.length - 8)}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Order Date:</span>
            <span className="font-medium">
              {new Date(order.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Total Amount:</span>
            <span className="font-medium">${order.total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Payment Method:</span>
            <span className="font-medium">
              {order.paymentMethod === 'credit_card' ? 'Credit Card' : 
               order.paymentMethod === 'paypal' ? 'PayPal' : 'Cash on Delivery'}
            </span>
          </div>
        </div>
        
        <h2 className="text-lg font-semibold mb-3">Order Summary</h2>
        <div className="space-y-3 mb-6">
          {order.items.map((item) => (
            <div key={item._id} className="flex justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-10 w-10 rounded-md overflow-hidden mr-3">
                  <img 
                    src={item.product?.imageUrl || "https://dummyimage.com/200x200/e0e0e0/333333&text=Product"} 
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <span className="font-medium">{item.name}</span>
                  <span className="text-gray-600 text-sm"> x {item.quantity}</span>
                </div>
              </div>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
        
        <div className="flex justify-between border-t border-gray-200 pt-4 mb-6">
          <span className="font-semibold">Total:</span>
          <span className="font-semibold">${order.total.toFixed(2)}</span>
        </div>
        
        <div className="text-center space-y-4">
          <Link
            to="/orders"
            className="block w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            View All Orders
          </Link>
          <Link
            to="/products"
            className="block w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;