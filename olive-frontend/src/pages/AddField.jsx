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