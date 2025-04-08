import { useState, useEffect } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useAppContext } from "../context/AppContext";

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: "#32325d",
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: "antialiased",
      fontSize: "16px",
      "::placeholder": {
        color: "#aab7c4",
      },
    },
    invalid: {
      color: "#fa755a",
      iconColor: "#fa755a",
    },
  },
  hidePostalCode: true,
};

const CreditCardForm = ({
  amount,
  onPaymentSuccess,
  onPaymentError,
  disabled,
}) => {
  const { API } = useAppContext();
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [cardComplete, setCardComplete] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState("");

  useEffect(() => {
    // Create a payment intent when the component mounts or when amount changes
    if (amount > 0) {
      createPaymentIntent();
    }
  }, [amount]);

  const createPaymentIntent = async () => {
    try {
      const response = await API.post("/payment/create-payment-intent", {
        amount,
      });
      setClientSecret(response.data.clientSecret);
    } catch (err) {
      console.error("Error creating payment intent:", err);
      onPaymentError(
        err.response?.data?.message ||
          "Failed to initialize payment. Please try again."
      );
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    if (error) {
      elements.getElement("card").focus();
      return;
    }

    if (cardComplete) {
      setProcessing(true);
    }

    try {
      const { error: paymentError, paymentIntent } =
        await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: elements.getElement(CardElement),
          },
        });

      if (paymentError) {
        setError(paymentError.message);
        onPaymentError(paymentError.message);
      } else if (paymentIntent.status === "succeeded") {
        onPaymentSuccess(paymentIntent.id);
      } else {
        onPaymentError(`Payment failed: ${paymentIntent.status}`);
      }
    } catch (err) {
      console.error("Payment error:", err);
      onPaymentError("An unexpected error occurred.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Card Information
        </label>
        <div className="border border-gray-300 rounded-md p-4 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
          <CardElement
            options={CARD_ELEMENT_OPTIONS}
            onChange={(e) => {
              setError(e.error ? e.error.message : "");
              setCardComplete(e.complete);
            }}
          />
        </div>
        {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
      </div>

      <button
        type="submit"
        disabled={!stripe || processing || disabled || !cardComplete}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {processing ? "Processing..." : `Pay $${amount.toFixed(2)}`}
      </button>
    </form>
  );
};

export default CreditCardForm;
