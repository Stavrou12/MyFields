import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import MediaUpload from "../components/MediaUpload";


export default function MyFields() {
  const [fields, setFields] = useState([]);
  const [stats, setStats] = useState({});
  const [photos, setPhotos] = useState([]);
  const [uploadFieldId, setUploadFieldId] = useState(null);

  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  /* ========================= Load Fields ========================= */
  useEffect(() => {
    loadFields();
    loadPhotos();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadFields() {
    try {
      
      const res = await api.get("/fields");
      const allFields = res.data;
      setFields(allFields);

      const statsObj = {};

      for (const field of allFields) {
        // 🔹 use year-specific stats for the current year
        const { data } = await api.get(
          `/fields/${field._id}/year-stats/${currentYear}`
        );
        statsObj[field._id] = data.stats;
      }

      setStats(statsObj);
    } catch (err) {
      console.error("Error fetching fields:", err);
    }
  }

  async function loadPhotos() {
    try {
      const res = await api.get("/upload/photos");
      setPhotos(res.data);
    } catch (err) {
      console.error("Error fetching photos:", err);
    }
  }

  const handleMediaAdded = (media) => {
    setPhotos((prev) => [...prev, media]);
    setUploadFieldId(null);
  };

  /* ======================= Render ======================= */

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">My Fields</h1>

          <div className="flex gap-3">
            <button
              onClick={() => navigate("/map")}
              className="bg-blue-600 text-white px-4 py-2 rounded shadow"
            >
              🌍 Map View
            </button>

            <button
              onClick={() => navigate("/add-field")}
              className="bg-green-600 text-white px-4 py-2 rounded shadow"
            >
              + Add Field
            </button>
          </div>
        </div>

        {/* If no fields */}
        {fields.length === 0 ? (
          <p className="text-gray-600 text-center mt-20">
            No fields found. Add your first one!
          </p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {fields.map((field) => (
              <div
                key={field._id}
                className="bg-white shadow-md rounded-xl p-5 relative"
              >
                {/* FIELD NAME */}
                <h2 className="text-xl font-semibold text-gray-800 mb-1">
                  {field.name}
                </h2>
                <p className="text-gray-500 mb-3">
                  {field.treeCount} trees
                </p>

                {/* FIELD STATS */}
                {stats[field._id] ? (
                  <div className="text-sm space-y-1 mb-3">
                    <p>
  <strong>Total Production ({currentYear}):</strong>{" "}
  {stats[field._id].totalProductionKg} kg
</p>

<p>
  <strong>Total Oil ({currentYear}):</strong>{" "}
  {stats[field._id].totalOilLiters} L
</p>

<p>
  <strong>Oil Yield ({currentYear}):</strong>{" "}
  {stats[field._id].oilYieldPercentage}%
</p>

<p>
  <strong>Last Harvest:</strong>{" "}
  {stats[field._id].lastHarvestYear}
</p>

                    {/* LAST ACTIVITIES FOR THAT YEAR */}
                    <div className="mt-3 pt-2 border-t border-gray-200 text-xs text-gray-600 space-y-1">
                      <p>
                        <strong>Last Fertilization:</strong>{" "}
                        {stats[field._id].lastFertilization || "None"}
                      </p>

                      <p>
                        <strong>Last Pruning:</strong>{" "}
                        {stats[field._id].lastPruning || "None"}
                      </p>

                      <p>
                        <strong>Last Spraying:</strong>{" "}
                        {stats[field._id].lastSpraying || "None"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-400 mb-3">Loading stats…</p>
                )}

                {/* EDIT YEAR BUTTON */}
                <button
                  onClick={() =>
                    navigate(`/fields/${field._id}/year/${currentYear}`)
                  }
                  className="bg-yellow-500 text-white px-3 py-1 rounded mb-3 w-full"
                >
                  ✏️ Edit {currentYear}
                </button>

                {/* MEDIA UPLOAD BUTTON */}
                <button
                  onClick={() => setUploadFieldId(field._id)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded mb-3 w-full"
                >
                  Upload Media
                </button>

                {/* MEDIA PREVIEW */}
                <div className="grid grid-cols-2 gap-2">
                  {photos
                    .filter((p) => p.fieldId === field._id)
                    .slice(0, 4)
                    .map((p) =>
                      p.isVideo ? (
                        <video
                          key={p._id}
                          src={`http://localhost:5000${p.url}`}
                          className="w-full h-24 object-cover rounded"
                        />
                      ) : (
                        <img
                          key={p._id}
                          src={`http://localhost:5000${p.url}`}
                          className="w-full h-24 object-cover rounded"
                          alt=""
                        />
                      )
                    )}
                </div>

                {/* Media Upload Modal */}
                {uploadFieldId === field._id && (
                  <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
                      <button
                        onClick={() => setUploadFieldId(null)}
                        className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
                      >
                        ✕
                      </button>

                      <MediaUpload
                        fieldId={field._id}
                        onMedia={handleMediaAdded}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
