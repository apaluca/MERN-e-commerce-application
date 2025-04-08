const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

/**
 * Create a payment intent with Stripe
 * @param {Number} amount - Amount in cents
 * @param {String} currency - Currency code (default: 'usd')
 * @param {Object} metadata - Additional metadata for the payment
 * @returns {Promise} Stripe payment intent object
 */
const createPaymentIntent = async (amount, currency = "usd", metadata = {}) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      metadata,
      payment_method_types: ["card"],
    });

    return paymentIntent;
  } catch (error) {
    console.error("Error creating payment intent:", error);
    throw error;
  }
};

/**
 * Retrieve a payment intent by ID
 * @param {String} paymentIntentId - Stripe payment intent ID
 * @returns {Promise} Payment intent object
 */
const retrievePaymentIntent = async (paymentIntentId) => {
  try {
    return await stripe.paymentIntents.retrieve(paymentIntentId);
  } catch (error) {
    console.error("Error retrieving payment intent:", error);
    throw error;
  }
};

module.exports = {
  createPaymentIntent,
  retrievePaymentIntent,
};
