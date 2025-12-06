import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import MediaUpload from "../components/MediaUpload";

const FieldDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [field, setField] = useState(null);
  const [stats, setStats] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [yearHistory, setYearHistory] = useState(null);
  const [availableYears, setAvailableYears] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [mediaOpen, setMediaOpen] = useState(false);
  const [yearStats, setYearStats] = useState(null);

  /* -------------------------------------------------------
        FETCH FIELD + STATS
  ------------------------------------------------------- */
  const fetchFieldStats = useCallback(async () => {
    try {
      const { data } = await api.get(`/fields/${id}/stats`);
      setField(data.field);
      setStats(data.stats);

      const harvestYears = [
        ...new Set(data.field.oilProduction.map((h) => h.year)),
      ].sort((a, b) => b - a);

      setAvailableYears(
        harvestYears.length > 0 ? harvestYears : [new Date().getFullYear()]
      );
    } catch (err) {
      console.error("Error fetching field:", err);
    }
  }, [id]);

  /* -------------------------------------------------------
        FETCH YEAR HISTORY
  ------------------------------------------------------- */
  const fetchYearHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const { data } = await api.get(
        `/fields/${id}/history?year=${selectedYear}`
      );
      setYearHistory(data);
      const statsRes = await api.get(`/fields/${id}/year-stats/${selectedYear}`);
      setYearStats(statsRes.data);
    } catch (err) {
      console.error("Error fetching year history:", err);
    }
    setLoadingHistory(false);
  }, [id, selectedYear]);

  /* -------------------------------------------------------
        FETCH PHOTOS
  ------------------------------------------------------- */
  const fetchPhotos = useCallback(async () => {
    try {
      const { data } = await api.get("/upload/photos");
      setPhotos(data.filter((p) => p.fieldId === id));
    } catch (err) {
      console.error("Error fetching photos:", err);
    }
  }, [id]);

  /* -------------------------------------------------------
        LIFECYCLE
  ------------------------------------------------------- */
  useEffect(() => {
    fetchFieldStats();
    fetchPhotos();
  }, [fetchFieldStats, fetchPhotos]);

  useEffect(() => {
    fetchYearHistory();
  }, [fetchYearHistory]);

  if (!field || !stats) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <p className="text-center text-gray-600">Loading...</p>
      </div>
    );
  }

  /* -------------------------------------------------------
        RENDER PAGE
  ------------------------------------------------------- */
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => navigate("/my-fields")}
          className="text-green-600 hover:text-green-700 mb-4 flex items-center"
        >
          ← Back to My Fields
        </button>

        {/* Field Title */}
        <h1 className="text-3xl font-bold text-gray-800">{field.name}</h1>
        <p className="text-gray-600 mb-6">{field.treeCount} trees</p>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            label="Total Production"
            value={`${stats.totalProductionKg} kg`}
          />
          <StatCard label="Total Oil" value={`${stats.totalOilLiters} L`} />
          <StatCard
            label="Oil Yield"
            value={`${stats.oilYieldPercentage}%`}
          />
          <StatCard
            label="Last Harvest"
            value={stats.lastHarvestYear || "Never"}
          />
        </div>

        {/* Year Selector */}
        <div className="bg-white rounded-lg shadow p-4 mb-6 flex items-center justify-between">
          <div>
            <label className="text-gray-700 font-medium mr-3">
              Select Year:
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="border border-gray-300 rounded-lg px-4 py-2"
            >
              {availableYears.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() =>
              navigate(`/fields/${field._id}/year/${selectedYear}`)
            }
            className="bg-yellow-500 text-white px-4 py-2 rounded shadow"
          >
            ✏️ Edit Year {selectedYear}
          </button>
        </div>

        {/* Year History Display */}
        {loadingHistory ? (
          <p className="text-center text-gray-600 py-4">Loading history…</p>
        ) : yearHistory ? (
          <div className="space-y-6">
            {/* SUMMARY */}
            <DataSection
  title={`${selectedYear} Summary`}
  data={[
    yearStats || {
      totalYieldKg: 0,
      totalOilLiters: 0,
      oilYieldPercentage: 0
    }
  ]}
  emptyMessage="No summary available"
  renderItem={(s) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <SummaryCard label="Total Yield" value={`${s.totalYieldKg} kg`} />
      <SummaryCard label="Oil Produced" value={`${s.totalOilLiters} L`} />
      <SummaryCard
        label="Oil Yield Rate"
        value={`${s.oilYieldPercentage}%`}
      />
    </div>
  )}
/>
<DataSection
  title={`${selectedYear} Summary`}
  data={[
    yearStats || {
      totalYieldKg: 0,
      totalOilLiters: 0,
      oilYieldPercentage: 0
    }
  ]}
  emptyMessage="No summary available"
  renderItem={(s) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <SummaryCard label="Total Yield" value={`${s.totalYieldKg} kg`} />
      <SummaryCard label="Oil Produced" value={`${s.totalOilLiters} L`} />
      <SummaryCard
        label="Oil Yield Rate"
        value={`${s.oilYieldPercentage}%`}
      />
    </div>
  )}
/>


            {/* HARVESTS */}
            <DataSection
              title="Harvests"
              data={yearHistory.yields}
              emptyMessage="No harvests recorded"
              renderItem={(y) => (
                <div className="border-l-4 border-green-500 pl-4">
                  <p className="font-medium text-gray-800">
                    {new Date(y.date).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    {y.kg} kg → {y.liters} L
                  </p>
                </div>
              )}
            />

            {/* FERTILIZATION */}
            <DataSection
              title="Fertilization"
              data={yearHistory.fertilizations}
              emptyMessage="No fertilization recorded"
              renderItem={(f) => (
                <div className="border-l-4 border-blue-500 pl-4">
                  <p className="font-medium text-gray-800">
                    {new Date(f.date).toLocaleDateString()} —{" "}
                    {f.fertilizerType}
                  </p>
                  <p className="text-sm text-gray-600">
                    {f.fertilizerName} — {f.trees} trees
                  </p>
                  {f.notes && (
                    <p className="text-xs text-gray-500">{f.notes}</p>
                  )}
                </div>
              )}
            />

            {/* PRUNING */}
            <DataSection
              title="Pruning"
              data={yearHistory.pruning}
              emptyMessage="No pruning recorded"
              renderItem={(p) => (
                <div className="border-l-4 border-purple-500 pl-4">
                  <p className="font-medium text-gray-800">
                    {new Date(p.date).toLocaleDateString()} —{" "}
                    {p.pruningType}
                  </p>
                  <p className="text-sm text-gray-600">
                    {p.treesPruned} trees pruned
                  </p>
                  {p.notes && (
                    <p className="text-xs text-gray-500">{p.notes}</p>
                  )}
                </div>
              )}
            />

            {/* SPRAYING */}
            <DataSection
              title="Spraying"
              data={yearHistory.sprayings}
              emptyMessage="No spraying recorded"
              renderItem={(s) => (
                <div className="border-l-4 border-yellow-500 pl-4">
                  <p className="font-medium text-gray-800">
                    {new Date(s.date).toLocaleDateString()} — {s.sprayType}
                  </p>
                  <p className="text-sm text-gray-600">
                    {s.product} — {s.trees} trees
                  </p>
                  {s.notes && (
                    <p className="text-xs text-gray-500">{s.notes}</p>
                  )}
                </div>
              )}
            />
          </div>
        ) : null}

        {/* MEDIA UPLOAD */}
        <div className="mt-6">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded shadow"
            onClick={() => setMediaOpen(true)}
          >
            + Upload Media
          </button>
        </div>

        {mediaOpen && (
          <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
              <button
                className="absolute top-2 right-2 text-gray-500"
                onClick={() => setMediaOpen(false)}
              >
                ✕
              </button>
              <MediaUpload
                fieldId={id}
                onMedia={() => {
                  fetchPhotos();
                  setMediaOpen(false);
                }}
              />
            </div>
          </div>
        )}

        {/* MEDIA GRID */}
        {photos.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
            {photos.map((p) => (
              <div key={p._id} className="rounded shadow overflow-hidden">
                {p.isVideo ? (
                  <video
                    controls
                    className="w-full h-32 object-cover"
                    src={`http://localhost:5000${p.url}`}
                  />
                ) : (
                  <img
                    src={`http://localhost:5000${p.url}`}
                    alt=""
                    className="w-full h-32 object-cover"
                  />
                )}

                {p.gps?.lat && (
                  <p className="text-xs text-gray-600 p-1">
                    📍 {p.gps.lat.toFixed(5)}, {p.gps.lng.toFixed(5)}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* -------------------------------------------------------
        SMALL COMPONENTS
------------------------------------------------------- */

const StatCard = ({ label, value }) => (
  <div className="bg-white rounded-lg shadow p-4">
    <p className="text-sm text-gray-500 mb-1">{label}</p>
    <p className="text-2xl font-bold text-gray-800">{value}</p>
  </div>
);

const SummaryCard = ({ label, value }) => (
  <div>
    <p className="text-sm text-gray-500">{label}</p>
    <p className="text-2xl font-semibold text-gray-800">{value}</p>
  </div>
);

const DataSection = ({ title, data, emptyMessage, renderItem }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <h2 className="text-xl font-bold text-gray-800 mb-4">{title}</h2>

    {data && data.length > 0 ? (
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={item._id || index}>{renderItem(item)}</div>
        ))}
      </div>
    ) : (
      <p className="text-gray-500 text-center py-4">{emptyMessage}</p>
    )}
  </div>
);

export default FieldDetails;
