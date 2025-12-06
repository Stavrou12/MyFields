import { useEffect, useState } from "react";
import API from "../services/api";
import { Link } from "react-router-dom";


export default function Fields() {
  const [fields, setFields] = useState([]);

  useEffect(() => {
    loadFields();
  }, []);

  const loadFields = async () => {
    const res = await API.get("/fields");
    setFields(res.data);
  };

  return (
    <div className="p-5">
      <h1 className="text-3xl font-bold mb-4">Your Fields</h1>
            {/* ADD THIS BUTTON HERE */}
      <Link
        to="/add-field"
        className="bg-green-600 text-white px-4 py-2 rounded block mb-4 text-center"
      >
        + Add Field
      </Link>

      <div className="space-y-3">
        {fields.map((f) => (
          <div key={f._id} className="p-3 border rounded">
            <p className="font-semibold">{f.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
