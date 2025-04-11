import { useEffect, useState } from "react";
import axios from "axios";

export default function SettingsPage() {
  const [userData, setUserData] = useState({ name: "", email: "", phoneNumber: "" });
  const [status, setStatus] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await axios.get("http://localhost:3000/app/settings", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserData({
          name: res.data.name,
          email: res.data.email,
          phoneNumber: res.data.phoneNumber,
        });
      } catch (err) {
        console.error("Failed to fetch user:", err);
        setStatus("Failed to load user data.");
      }
    };
    fetchUserData();
  }, []);

  const handleSave = async () => {
    try {
      const res = await axios.put(
        "http://localhost:3000/app/settings",
        { ...userData },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStatus("✅ Updated successfully!");
    } catch (err) {
      console.error("Update failed:", err);
      setStatus("❌ Update failed.");
    }
  };

  const handleChange = (e) => {
    setUserData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">⚙️ Account Settings</h2>

      <label className="block mb-1">Name</label>
      <input
        className="w-full border p-2 mb-4 rounded"
        type="text"
        name="name"
        value={userData.name}
        onChange={handleChange}
      />

      <label className="block mb-1">Email</label>
      <input
        className="w-full border p-2 mb-4 rounded"
        type="email"
        name="email"
        value={userData.email}
        onChange={handleChange}
      />

      <label className="block mb-1">Phone Number</label>
      <input
        className="w-full border p-2 mb-4 rounded"
        type="text"
        name="phoneNumber"
        value={userData.phoneNumber}
        onChange={handleChange}
      />

      <button
        onClick={handleSave}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Save Changes
      </button>

      {status && (
        <p className="mt-4 text-sm font-medium text-center text-gray-700">{status}</p>
      )}
    </div>
  );
}
