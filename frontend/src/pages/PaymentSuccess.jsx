import { Link } from "react-router-dom";

export default function PaymentSuccess() {
  return (
    <div className="h-screen flex flex-col justify-center items-center bg-green-50 text-center">
      <h1 className="text-3xl font-bold text-green-700 mb-4">✅ Payment Successful!</h1>
      <p className="text-lg mb-6">Your parking spot has been reserved and payment confirmed.</p>
      <Link to="/" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
        Go to Dashboard
      </Link>
    </div>
  );
}
