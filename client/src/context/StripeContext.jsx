import React, { createContext, useContext } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

// Need to change this to a valid publishable key
const stripePromise = loadStripe(
  "pk_test_51RBY9LRxSarcvt30D2rNiPsxvWx1Nh3bhRsPT69GK1LQLlD6mUYTDmnNra7q2omykMLpSnyI8UIYW0YkCVG4IKhV00eAPpCAPH"
);

const StripeContext = createContext();

export const useStripe = () => {
  return useContext(StripeContext);
};

export const StripeProvider = ({ children }) => {
  return <Elements stripe={stripePromise}>{children}</Elements>;
};
