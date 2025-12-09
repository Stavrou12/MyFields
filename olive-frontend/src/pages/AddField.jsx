// src/pages/AddField.jsx
/*
import { useState } from "react";
import MyMap from "../components/MapContainer";
import API from "../services/api";

export default function AddField() {
  const [name, setName] = useState("");
  const [polygon, setPolygon] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleSave = async () => {
    if (!name.trim()) return setMsg("Enter field name");
    if (!polygon) return setMsg("Draw a polygon on the map");

    setLoading(true);
    setMsg("");

    try {
      await API.post("/fields", {
        name: name.trim(),
        location: polygon.geometry, // GeoJSON Polygon
      });
      setMsg("✅ Field saved!");
      setName("");
      setPolygon(null);
    } catch (err) {
      console.error(err);
      setMsg("❌ Save failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Add New Field</h1>

      <input
        type="text"
        className="w-full border rounded p-3 mb-4"
        placeholder="Field name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <div className="border rounded overflow-hidden mb-4">
        <MyMap onPolygonCreated={setPolygon} />
      </div>

      {msg && <p className="mb-3 text-center">{msg}</p>}

      <button
        onClick={handleSave}
        disabled={loading}
        className={`w-full p-3 rounded text-white ${
          loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
        }`}
      >
        {loading ? "Saving..." : "Save Field"}
      </button>
    </div>
  );
}
  */

import { useState } from "react";
import MyMap from "../components/MapContainer";
import API from "../services/api";

export default function AddField() {
  const [name, setName] = useState("");
  const [polygon, setPolygon] = useState(null);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [trees, setTrees] = useState(0);


  const saveField = async () => {
    if (!name || !polygon) return setMsg("⚠️ Fill name & draw polygon");
    setLoading(true);
    setMsg("");
    try {
      // THE CORRECT PAYLOAD
      const payload = {
        name: name.trim(),
        treeCount: Number(trees),
        location: {
          type: "Polygon",
          coordinates: polygon.geometry.coordinates,
        }
      };

      await API.post("/fields", payload);

      setMsg("✅ Field saved!");
      setName("");
      setPolygon(null);
      setShowForm(false);
      setTimeout(() => setShowForm(true), 3000); // re-show after 3s
    } catch (err) {
      console.error(err);
      setMsg("❌ Save failed");
    } finally {
      setLoading(false);
    }
  };

  if (!showForm) return null;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold text-green-800 mb-4">Add Field</h2>

      <input
        type="text"
        className="w-full p-2 border rounded mb-4"
        placeholder="Field name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="number"
        className="w-full p-2 border rounded mt-2"
        placeholder="Number of olive trees"
        value={trees}
        onChange={(e) => setTrees(e.target.value)}
      />
      <MyMap onPolygonCreated={setPolygon} />

      <button
        onClick={saveField}
        disabled={loading}
        className={`mt-4 w-full px-4 py-2 rounded text-white ${loading ? "bg-green-300" : "bg-green-600 hover:bg-green-700"
          }`}
      >
        {loading ? "Saving..." : "Save Field"}
      </button>

      {msg && (
        <div className="mt-3 text-center font-semibold text-green-700">{msg}</div>
      )}
    </div>
  );
}