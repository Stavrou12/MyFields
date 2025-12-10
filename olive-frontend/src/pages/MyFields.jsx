import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";


export default function MyFields() {
  const [fields, setFields] = useState([]);
  const [stats, setStats] = useState({});
  const [photos, setPhotos] = useState([]);
  const [uploadFieldId, setUploadFieldId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [galleryModal, setGalleryModal] = useState(null);
  const [deletingPhoto, setDeletingPhoto] = useState(null);
  const [zoomModal, setZoomModal] = useState(null);

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

  /* ========================= Upload Media ========================= */
  const handleMediaUpload = async (fieldId, files) => {
    if (files.length === 0) return alert("Pick at least one file");
    
    for (const file of files) {
      const form = new FormData();
      form.append("media", file);
      form.append("fieldId", fieldId);
      form.append("gps", JSON.stringify({}));

      try {
        const { data } = await api.post("/upload/media", form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setPhotos((prev) => [...prev, data]);
      } catch (err) {
        console.error("Upload error:", err);
        alert(`Upload failed for ${file.name}`);
      }
    }
    setUploadFieldId(null);
  };

  /* ========================= Delete Photo ========================= */
  async function deletePhoto(photoId) {
    setDeletingPhoto(photoId);
    try {
      await api.delete(`/upload/photos/${photoId}`);
      setPhotos((prev) => prev.filter((p) => p._id !== photoId));
    } catch (err) {
      console.error("Error deleting photo:", err);
      alert("Failed to delete photo");
    } finally {
      setDeletingPhoto(null);
    }
  }

  /* ========================= Delete Field ========================= */
  async function deleteFieldHandler(fieldId) {
    setDeleting(true);
    try {
      await api.delete(`/fields/${fieldId}`);
      setFields((prev) => prev.filter((f) => f._id !== fieldId));
      setPhotos((prev) => prev.filter((p) => p.fieldId !== fieldId));
      setDeleteConfirm(null);
    } catch (err) {
      console.error("Error deleting field:", err);
      alert("Failed to delete field");
    } finally {
      setDeleting(false);
    }
  }

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
            {fields.map((field) => {
              const fieldPhotos = photos.filter((p) => p.fieldId === field._id);
              return (
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

                {/* UPLOAD MEDIA BUTTON */}
                <button
                  onClick={() => setUploadFieldId(field._id)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded mb-3 w-full"
                >
                  📸 Upload Media
                </button>

                {/* GALLERY BUTTON */}
                {fieldPhotos.length > 0 && (
                  <button
                    onClick={() => setGalleryModal(field._id)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded mb-3 w-full"
                  >
                    🖼️ Gallery ({fieldPhotos.length})
                  </button>
                )}

                {/* DELETE BUTTON */}
                <button
                  onClick={() => setDeleteConfirm(field._id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded mb-3 w-full"
                >
                  🗑️ Delete Field
                </button>

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

                      <h3 className="text-lg font-semibold mb-4">Upload Media</h3>
                      <input
                        type="file"
                        multiple
                        accept="image/*,video/*"
                        onChange={(e) => handleMediaUpload(field._id, Array.from(e.target.files))}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                    </div>
                  </div>
                )}

                {/* Gallery Modal */}
                {galleryModal === field._id && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 relative max-h-96 overflow-y-auto">
                      <button
                        onClick={() => {
                          setGalleryModal(null);
                          setZoomModal(null);
                        }}
                        className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-xl"
                      >
                        ✕
                      </button>

                      <h3 className="text-xl font-semibold mb-4">Gallery</h3>
                      
                      {/* Zoomed view */}
                      {zoomModal ? (
                        <div className="flex flex-col items-center gap-4">
                          <button
                            onClick={() => setZoomModal(null)}
                            className="self-start text-blue-600 hover:text-blue-800 mb-2"
                          >
                            ← Back to Gallery
                          </button>

                          <div className="w-full flex items-center justify-center bg-gray-100 rounded p-4">
                            {zoomModal.isVideo ? (
                              <video
                                src={zoomModal.url}
                                controls
                                className="max-h-96 max-w-full"
                              />
                            ) : (
                              <img
                                src={zoomModal.url}
                                alt="Zoomed"
                                className="max-h-96 max-w-full"
                              />
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {fieldPhotos.map((photo) => (
                            <div
                              key={photo._id}
                              className="relative group cursor-pointer"
                              onClick={() => setZoomModal(photo)}
                            >
                              {photo.isVideo ? (
                                <div className="relative">
                                  <video
                                    src={photo.url}
                                    className="w-full h-32 object-cover rounded"
                                  />
                                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded group-hover:bg-opacity-50">
                                    <span className="text-white text-2xl">▶</span>
                                  </div>
                                </div>
                              ) : (
                                <img
                                  src={photo.url}
                                  className="w-full h-32 object-cover rounded group-hover:opacity-75"
                                  alt="Field media"
                                />
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deletePhoto(photo._id);
                                }}
                                disabled={deletingPhoto === photo._id}
                                className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition disabled:opacity-50"
                                title="Delete photo"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Delete Confirmation Modal */}
                {deleteConfirm === field._id && (
                  <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">
                        Delete Field?
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Are you sure you want to delete "{field.name}"? This action cannot be undone.
                      </p>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          disabled={deleting}
                          className="flex-1 bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 disabled:opacity-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => deleteFieldHandler(field._id)}
                          disabled={deleting}
                          className="flex-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
                        >
                          {deleting ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
