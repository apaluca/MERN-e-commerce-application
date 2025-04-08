import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import CreditCardForm from "../components/CreditCardForm";

const CheckoutPage = () => {
  const { cart, createOrder, loading } = useAppContext();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    street: "",
    city: "",
    postalCode: "",
    country: "",
    paymentMethod: "credit_card",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentStep, setPaymentStep] = useState("shipping"); // shipping or payment
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  if (cart.items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <p className="text-gray-600 mb-4">
            Your cart is empty. Add some products to checkout.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            View Products
          </Link>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear error when field is edited
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateShippingForm = () => {
    const newErrors = {};

    // Street validation
    if (!formData.street.trim()) {
      newErrors.street = "Street address is required";
    } else if (formData.street.trim().length < 5) {
      newErrors.street = "Please enter a valid street address";
    }

    // City validation
    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    } else if (formData.city.trim().length < 2) {
      newErrors.city = "Please enter a valid city name";
    }

    // Postal code validation
    if (!formData.postalCode.trim()) {
      newErrors.postalCode = "Postal code is required";
    } else if (!/^[a-zA-Z0-9]{3,10}$/.test(formData.postalCode.trim())) {
      newErrors.postalCode = "Please enter a valid postal code";
    }

    // Country validation
    if (!formData.country.trim()) {
      newErrors.country = "Country is required";
    } else if (formData.country.trim().length < 2) {
      newErrors.country = "Please enter a valid country name";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = (field) => {
    // Validate specific field on blur
    const newErrors = { ...errors };

    switch (field) {
      case "street":
        if (!formData.street.trim()) {
          newErrors.street = "Street address is required";
        } else if (formData.street.trim().length < 5) {
          newErrors.street = "Please enter a valid street address";
        } else {
          delete newErrors.street;
        }
        break;
      case "city":
        if (!formData.city.trim()) {
          newErrors.city = "City is required";
        } else if (formData.city.trim().length < 2) {
          newErrors.city = "Please enter a valid city name";
        } else {
          delete newErrors.city;
        }
        break;
      case "postalCode":
        if (!formData.postalCode.trim()) {
          newErrors.postalCode = "Postal code is required";
        } else if (!/^[a-zA-Z0-9]{3,10}$/.test(formData.postalCode.trim())) {
          newErrors.postalCode = "Please enter a valid postal code";
        } else {
          delete newErrors.postalCode;
        }
        break;
      case "country":
        if (!formData.country.trim()) {
          newErrors.country = "Country is required";
        } else if (formData.country.trim().length < 2) {
          newErrors.country = "Please enter a valid country name";
        } else {
          delete newErrors.country;
        }
        break;
      default:
        break;
    }

    setErrors(newErrors);
  };

  const handleShippingSubmit = (e) => {
    e.preventDefault();

    if (!validateShippingForm()) {
      return;
    }

    // Move to payment step
    setPaymentStep("payment");
  };

  const handlePaymentSuccess = async (paymentIntentId) => {
    try {
      setPaymentProcessing(true);

      const shippingAddress = {
        street: formData.street,
        city: formData.city,
        postalCode: formData.postalCode,
        country: formData.country,
      };

      const paymentDetails = {
        paymentIntentId,
        paymentStatus: "succeeded",
      };

      const result = await createOrder(
        shippingAddress,
        formData.paymentMethod,
        paymentDetails
      );

      if (result.success) {
        // Navigate to order confirmation with the order data
        navigate("/order-confirmation", { state: { order: result.order } });
      }
    } catch (error) {
      console.error("Error processing payment and creating order:", error);
    } finally {
      setPaymentProcessing(false);
    }
  };

  const handlePaymentError = (errorMessage) => {
    setErrors({ payment: errorMessage });
    setPaymentProcessing(false);
  };

  // For cash on delivery option
  const handleCashOnDeliverySubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const shippingAddress = {
        street: formData.street,
        city: formData.city,
        postalCode: formData.postalCode,
        country: formData.country,
      };

      const result = await createOrder(shippingAddress, "cash_on_delivery");

      if (result.success) {
        // Navigate to order confirmation with the order data
        navigate("/order-confirmation", { state: { order: result.order } });
      }
    } catch (error) {
      console.error("Error placing order:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">Checkout</h1>

      <div className="md:flex md:space-x-8">
        <div className="md:w-2/3 mb-8 md:mb-0">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            {paymentStep === "shipping" ? (
              <>
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Shipping Address
                </h2>

                <form onSubmit={handleShippingSubmit}>
                  <div className="grid grid-cols-1 gap-y-4">
                    <div>
                      <label
                        htmlFor="street"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Street Address
                      </label>
                      <input
                        type="text"
                        id="street"
                        name="street"
                        value={formData.street}
                        onChange={handleChange}
                        onBlur={() => handleBlur("street")}
                        className={`mt-1 block w-full border ${errors.street ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                      />
                      {errors.street && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.street}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="city"
                        className="block text-sm font-medium text-gray-700"
                      >
                        City
                      </label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        onBlur={() => handleBlur("city")}
                        className={`mt-1 block w-full border ${errors.city ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                      />
                      {errors.city && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.city}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="postalCode"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Postal Code
                        </label>
                        <input
                          type="text"
                          id="postalCode"
                          name="postalCode"
                          value={formData.postalCode}
                          onChange={handleChange}
                          onBlur={() => handleBlur("postalCode")}
                          className={`mt-1 block w-full border ${errors.postalCode ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                        />
                        {errors.postalCode && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.postalCode}
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="country"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Country
                        </label>
                        <input
                          type="text"
                          id="country"
                          name="country"
                          value={formData.country}
                          onChange={handleChange}
                          onBlur={() => handleBlur("country")}
                          className={`mt-1 block w-full border ${errors.country ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                        />
                        {errors.country && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.country}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-8">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">
                      Payment Method
                    </h2>

                    <div className="space-y-4">
                      <div className="flex items-center">
                        <input
                          id="credit_card"
                          name="paymentMethod"
                          type="radio"
                          value="credit_card"
                          checked={formData.paymentMethod === "credit_card"}
                          onChange={handleChange}
                          className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <label
                          htmlFor="credit_card"
                          className="ml-3 block text-sm font-medium text-gray-700"
                        >
                          Credit Card (Stripe)
                        </label>
                      </div>

                      <div className="flex items-center">
                        <input
                          id="cash_on_delivery"
                          name="paymentMethod"
                          type="radio"
                          value="cash_on_delivery"
                          checked={
                            formData.paymentMethod === "cash_on_delivery"
                          }
                          onChange={handleChange}
                          className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <label
                          htmlFor="cash_on_delivery"
                          className="ml-3 block text-sm font-medium text-gray-700"
                        >
                          Cash on Delivery
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex justify-between">
                    <Link
                      to="/cart"
                      className="inline-flex items-center px-4 py-2 border border-gray-300 bg-white rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Back to Cart
                    </Link>

                    <button
                      type="submit"
                      className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Continue to Payment
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Payment Details
                </h2>

                <div className="mb-6 bg-gray-50 p-4 rounded-md">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Shipping to:
                  </h3>
                  <p className="text-sm text-gray-800">
                    {formData.street}
                    <br />
                    {formData.city}, {formData.postalCode}
                    <br />
                    {formData.country}
                  </p>
                </div>

                {formData.paymentMethod === "credit_card" ? (
                  <>
                    <h3 className="text-md font-medium text-gray-800 mb-4">
                      Credit Card Payment
                    </h3>

                    {/* Display any payment errors */}
                    {errors.payment && (
                      <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                        {errors.payment}
                      </div>
                    )}

                    <CreditCardForm
                      amount={cart.total}
                      onPaymentSuccess={handlePaymentSuccess}
                      onPaymentError={handlePaymentError}
                      disabled={paymentProcessing || isSubmitting}
                    />
                  </>
                ) : (
                  <form onSubmit={handleCashOnDeliverySubmit}>
                    <div className="bg-yellow-50 p-4 rounded-md mb-6">
                      <p className="text-yellow-800">
                        You will pay when your order is delivered. Please have
                        the exact amount ready.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting || loading}
                      className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {isSubmitting || loading
                        ? "Processing..."
                        : "Place Order"}
                    </button>
                  </form>
                )}

                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => setPaymentStep("shipping")}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    ← Back to Shipping Information
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="md:w-1/3">
          <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Order Summary
            </h2>

            <div className="flow-root">
              <ul className="divide-y divide-gray-200">
                {cart.items.map((item) => (
                  <li key={item.product._id} className="py-4 flex">
                    <div className="flex-shrink-0 w-16 h-16 border border-gray-200 rounded-md overflow-hidden">
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="ml-4 flex-1 flex flex-col">
                      <div>
                        <div className="flex justify-between text-sm font-medium text-gray-900">
                          <h3>{item.product.name}</h3>
                          <p className="ml-4">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                          Qty {item.quantity}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-gray-200 py-4 mt-4">
              <div className="flex justify-between text-sm text-gray-600">
                <p>Subtotal</p>
                <p>${cart.total.toFixed(2)}</p>
              </div>
              <div className="flex justify-between text-sm text-gray-600 mt-2">
                <p>Shipping</p>
                <p>Free</p>
              </div>
              <div className="flex justify-between text-base font-medium text-gray-900 mt-4">
                <p>Total</p>
                <p>${cart.total.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
