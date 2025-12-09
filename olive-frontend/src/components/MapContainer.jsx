// src/components/MapContainer.jsx
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-draw";

function DrawControl({ onCreated }) {
  const map = useMap();
  const drawnItems = useRef(L.featureGroup()).current;

  useEffect(() => {
    map.addLayer(drawnItems);

    const drawControl = new L.Control.Draw({
      edit: { featureGroup: drawnItems },
      draw: {
        polygon: true,
        rectangle: false,
        circle: false,
        marker: false,
        polyline: false,
        circlemarker: false,
      },
    });

    map.addControl(drawControl);

    map.on(L.Draw.Event.CREATED, (e) => {
      const layer = e.layer;
      drawnItems.addLayer(layer);
      onCreated(layer.toGeoJSON());
    });

    return () => map.removeControl(drawControl);
  }, [map, drawnItems, onCreated]);

  return null;
}

export default function MyMap({ onPolygonCreated }) {
  const center = [35.0, 23.0]; // Greece fallback

  return (
    <MapContainer
      center={center}
      zoom={17}
      style={{ height: "500px", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <DrawControl onCreated={onPolygonCreated} />
    </MapContainer>
  );
}