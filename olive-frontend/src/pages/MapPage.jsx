import { useEffect, useState } from "react";
import { MapContainer, TileLayer, GeoJSON, Marker, Popup,LayersControl, useMap } from "react-leaflet";
import API from "../services/api";

// Component to handle zooming safely
function ZoomToField({ field }) {
  const map = useMap();

  useEffect(() => {
    if (!field || !field.location?.coordinates?.length) return;

    const coords = field.location.coordinates[0].map(([lng, lat]) => [lat, lng]);
    map.fitBounds(coords);
  }, [field, map]);

  return null;
}

export default function MapPage() {
  const [fields, setFields] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedField, setSelectedField] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const { BaseLayer } = LayersControl;

  useEffect(() => {
    // Load fields
    API.get("/fields")
      .then(res => setFields(res.data))
      .catch(err => console.error("Error loading fields:", err));

    // Load photos
    API.get("/upload/photos")
      .then(res => setPhotos(res.data))
      .catch(err => console.error("Error loading photos:", err));
  }, []);

  // Update suggestions as user types
  useEffect(() => {
    if (!searchQuery) {
      setSuggestions([]);
      return;
    }
    const matches = fields.filter(f =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setSuggestions(matches);
  }, [searchQuery, fields]);

  // When user clicks a suggestion or search button
  const handleSelect = (field) => {
    setSelectedField(field);
    setSearchQuery(field.name);
    setSuggestions([]); // hide suggestions after selection
  };

  return (
    <div className="relative w-full h-screen">
      {/* Map */}
      <MapContainer
        center={[35, 23]}
        zoom={7}
        style={{ height: "100%", width: "100%" }}
  maxZoom={20} // <-- allow zooming up to 20
  minZoom={2}  // optional: limit how far out users can zoom
      >
        <LayersControl position="topright">
          <BaseLayer checked name="Street Map">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
            maxZoom={19} 
            />
            
          </BaseLayer>
          <BaseLayer name="Satellite">
            <TileLayer url="https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}" subdomains={["mt0","mt1","mt2","mt3"]} 
            maxZoom={20} />
          </BaseLayer>
        </LayersControl>


        {/* Render field polygons */}
        {fields.map(f => (
          <GeoJSON key={f._id} data={f.location} />
        ))}

        {/* Render photo markers */}
        {photos
          .filter(p => p.gps?.lat && p.gps?.lng)
          .map(p => (
            <Marker key={p._id} position={[p.gps.lat, p.gps.lng]}>
              <Popup>
                <img
                  src={`http://localhost:5000${p.url}`}
                  alt={p.name || ""}
                  className="w-24"
                />
              </Popup>
            </Marker>
          ))}

        {/* Zoom to the selected field */}
        {selectedField && <ZoomToField field={selectedField} />}
      </MapContainer>

      {/* Search bar overlay */}
      <div className="absolute top-4 left-14 z-[1000]">
        <div className="flex gap-1 bg-white p-2 rounded shadow-md">
          <input
            type="text"
            placeholder="Search field..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 w-48 text-gray-800"
          />
          <button
            onClick={() => {
              const field = fields.find(f =>
                f.name.toLowerCase() === searchQuery.toLowerCase()
              );
              if (field) handleSelect(field);
            }}
            className="bg-green-600 text-white px-3 py-1 rounded"
          >
            Search
          </button>
        </div>

        {/* Suggestions dropdown */}
        {suggestions.length > 0 && (
          <div className="bg-white border border-gray-300 rounded mt-1 shadow-md max-h-48 overflow-y-auto">
            {suggestions.map(f => (
              <div
                key={f._id}
                className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSelect(f)}
              >
                {f.name}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
