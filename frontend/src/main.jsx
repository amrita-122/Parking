import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import React from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { GoogleOAuthProvider } from "@react-oauth/google";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY); // Put your key in .env
const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <Elements stripe={stripePromise}>
        <App />
      </Elements>
    </GoogleOAuthProvider>
    ,
  </StrictMode>
);
