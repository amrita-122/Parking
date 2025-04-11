import { useEffect, useState } from "react";
import axios from "axios";

export default function AdminDashboard() {
  const [spots, setSpots] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [payments, setPayments] = useState([]);
  const [lotNumber, setLotNumber] = useState("");
  const [spotNumber, setSpotNumber] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");

  const token = localStorage.getItem("token");

  const headers = {
    headers: { Authorization: `Bearer ${token}` },
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [spotsRes, reservationsRes, paymentsRes] = await Promise.all([
        axios.get("http://localhost:3000/api/parking/all", headers),
        axios.get("http://localhost:3000/api/admin/reservations", headers),
        axios.get("http://localhost:3000/api/admin/payments", headers),
      ]);
      setSpots(spotsRes.data);
      setReservations(reservationsRes.data);
      setPayments(paymentsRes.data);
    } catch (err) {
      console.error("Admin Dashboard Load Error:", err);
    }
  };

  const handleAddSpot = async () => {
    try {
      await axios.post(
        "http://localhost:3000/api/parking/add",
        { lotNumber, spotNumber, lat: parseFloat(lat), lng: parseFloat(lng) },
        headers
      );
      alert("New spot added!");
      setLotNumber("");
      setSpotNumber("");
      setLat("");
      setLng("");
      fetchAll();
    } catch (err) {
      alert("Error adding spot: " + err.response?.data?.message);
    }
  };

  const handleDeleteSpot = async (id) => {
    if (!window.confirm("Delete this parking spot?")) return;
    try {
      await axios.delete(
        `http://localhost:3000/api/parking/delete/${id}`,
        headers
      );
      fetchAll();
    } catch (err) {
      alert("Failed to delete spot.", err);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {/* Add New Spot */}
      <div className="mb-8 p-4 border rounded bg-gray-50">
        <h2 className="text-xl font-semibold mb-2">➕ Add New Parking Spot</h2>
        <input
          className="border p-2 mr-2 mb-2"
          value={lotNumber}
          onChange={(e) => setLotNumber(e.target.value)}
          placeholder="Lot Number"
        />
        <input
          className="border p-2 mr-2 mb-2"
          value={spotNumber}
          onChange={(e) => setSpotNumber(e.target.value)}
          placeholder="Spot Number"
        />
        <input
          className="border p-2 mr-2 mb-2"
          value={lat}
          onChange={(e) => setLat(e.target.value)}
          placeholder="Latitude"
        />
        <input
          className="border p-2 mr-2 mb-2"
          value={lng}
          onChange={(e) => setLng(e.target.value)}
          placeholder="Longitude"
        />
        <button
          onClick={handleAddSpot}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-800"
        >
          Add Spot
        </button>
      </div>

      {/* Spot Table */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">🅿️ All Parking Spots</h2>
        <table className="w-full border text-sm">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2">Lot</th>
              <th className="p-2">Spot</th>
              <th className="p-2">Status</th>
              <th className="p-2">Reserved By</th>
              <th className="p-2">Lat</th>
              <th className="p-2">Lng</th>
              <th className="p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {spots.map((spot) => (
              <tr key={spot._id} className="border-t">
                <td className="p-2">{spot.lotNumber}</td>
                <td className="p-2">{spot.spotNumber}</td>
                <td className="p-2">{spot.isAvailable ? "✅" : "❌"}</td>
                <td className="p-2">{spot.reservedBy ?? "-"}</td>
                <td className="p-2">{spot.lat.toFixed(5)}</td>
                <td className="p-2">{spot.lng.toFixed(5)}</td>

                <td className="p-2">
                  <button
                    onClick={() => handleDeleteSpot(spot._id)}
                    className="text-red-500 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Reservations Table */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">📋 Active Reservations</h2>
        <table className="w-full border text-sm">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2">User</th>
              <th className="p-2">Spot</th>
              <th className="p-2">Status</th>
              <th className="p-2">Start</th>
              <th className="p-2">End</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((res) => (
              <tr key={res._id} className="border-t">
                <td className="p-2">{res.userId?.email}</td>
                <td className="p-2">{res.spotId?.spotNumber}</td>
                <td className="p-2">{res.status}</td>
                <td className="p-2">
                  {new Date(res.startTime).toLocaleString()}
                </td>
                <td className="p-2">
                  {new Date(res.endTime).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Payments Table */}
      <div>
        <h2 className="text-xl font-semibold mb-2">💳 Payments</h2>
        <table className="w-full border text-sm">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2">User</th>
              <th className="p-2">Amount</th>
              <th className="p-2">Method</th>
              <th className="p-2">Time</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p._id} className="border-t">
                <td className="p-2">{p.userId?.email}</td>
                <td className="p-2">${p.amount}</td>
                <td className="p-2">{p.paymentMethod}</td>
                <td className="p-2">
                  {new Date(p.timestamp).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
