import Maps from "../components/Maps";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const Home = () => {
  const [nearestSpot, setNearestSpot] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setCurrentLocation({ lat, lng });

        const res = await axios.get(
          `http://localhost:3000/api/parking/nearest?lat=${lat}&lng=${lng}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setNearestSpot(res.data);
      },
      (error) => {
        console.error("Location error", error);
        alert("Location access denied");
      },
      { enableHighAccuracy: true }
    );
  }, []);

  const navigateToSpot = () => {
    if (nearestSpot) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${nearestSpot.lat},${nearestSpot.lng}&travelmode=driving`;
      window.open(url, "_blank");
    }
  };

  return (
    <div className="h-screen relative">
      <Maps
        highlightLocation={
          nearestSpot ? { lat: nearestSpot.lat, lng: nearestSpot.lng } : null
        }
      />

      {nearestSpot && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white shadow-md p-4 rounded-xl z-50 w-80">
          <h2 className="text-lg font-semibold mb-2 text-center text-blue-700">
            🚗 Nearest Available Spot
          </h2>
          <p className="text-sm text-gray-700 text-center">
            Lot: <strong>{nearestSpot.lotNumber}</strong>, Spot:{" "}
            <strong>{nearestSpot.spotNumber}</strong>
          </p>
          <button
            onClick={navigateToSpot}
            className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 w-full rounded"
          >
            Navigate
          </button>
        </div>
      )}
    </div>
  );
};
