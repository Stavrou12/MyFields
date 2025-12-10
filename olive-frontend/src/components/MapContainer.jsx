// src/components/MapContainer.jsx
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import { useEffect, useRef, useState } from "react";
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

    map.on(L.Draw.Event.DELETED, () => {
      if (drawnItems.getLayers().length === 0) {
        onCreated(null);
      }
    });

    // Clear button control
    const clearControl = L.Control.extend({
      options: { position: "topleft" },
      onAdd: () => {
        const btn = L.DomUtil.create("button");
        btn.innerHTML = "🗑️ Clear";
        btn.title = "Clear drawn polygon";
        btn.style.cssText =
          "padding: 8px 12px; font-size: 14px; background: white; border: 2px solid #ccc; border-radius: 4px; cursor: pointer; margin: 50px 10px 10px 10px;";
        L.DomEvent.disableClickPropagation(btn);
        btn.onclick = () => {
          drawnItems.clearLayers();
          onCreated(null);
        };
        return btn;
      },
    });

    map.addControl(new clearControl());

    return () => map.removeControl(drawControl);
  }, [map, drawnItems, onCreated]);

  return null;
}

function MapControls() {
  const map = useMap();
  const [isSatellite, setIsSatellite] = useState(false);
  const satelliteLayer = useRef(null);
  const locateControlRef = useRef(null);

  useEffect(() => {
    map.setMaxZoom(20);

    // Create satellite layer
    satelliteLayer.current = L.tileLayer(
      "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
      { attribution: "© Google", maxZoom: 20 }
    );
  }, [map]);

  // Locate button - separate effect
  useEffect(() => {
    const locateControl = L.Control.extend({
      options: { position: "topleft" },
      onAdd: () => {
        const btn = L.DomUtil.create("button");
        btn.innerHTML = "📍";
        btn.title = "Locate me";
        btn.style.cssText =
          "padding: 8px 12px; font-size: 18px; background: white; border: 2px solid #ccc; border-radius: 4px; cursor: pointer; margin: 10px;";
        L.DomEvent.disableClickPropagation(btn);
        btn.onclick = () => {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const { latitude, longitude } = pos.coords;
              map.setView([latitude, longitude], 17);
            },
            () => alert("Unable to get location"),
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
          );
        };
        return btn;
      },
    });

    locateControlRef.current = new locateControl();
    map.addControl(locateControlRef.current);

    return () => {
      if (locateControlRef.current) {
        map.removeControl(locateControlRef.current);
      }
    };
  }, [map]);

  // Satellite toggle
  useEffect(() => {
    const satelliteControl = L.Control.extend({
      options: { position: "topleft" },
      onAdd: () => {
        const btn = L.DomUtil.create("button");
        btn.innerHTML = isSatellite ? "🗺️" : "🛰️";
        btn.title = isSatellite ? "Map view" : "Satellite view";
        btn.style.cssText =
          "padding: 8px 12px; font-size: 18px; background: white; border: 2px solid #ccc; border-radius: 4px; cursor: pointer; margin: 10px; margin-top: 45px;";
        L.DomEvent.disableClickPropagation(btn);
        btn.onclick = () => {
          if (isSatellite) {
            map.removeLayer(satelliteLayer.current);
          } else {
            map.addLayer(satelliteLayer.current);
          }
          setIsSatellite(!isSatellite);
        };
        return btn;
      },
    });

    const instance = new satelliteControl();
    map.addControl(instance);

    return () => map.removeControl(instance);
  }, [map, isSatellite]);

  return null;
}


export default function MyMap({ onPolygonCreated }) {
  const creteCenter = [35.24, 25.13]; // Crete fallback
  const [mapCenter, setMapCenter] = useState(creteCenter);

  useEffect(() => {
    // Get user location on mount
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setMapCenter([latitude, longitude]);
        },
        () => {
          // Fallback to Crete if location denied
          console.log("Location access denied, using Crete as fallback");
        }
      );
    }
  }, []);

  return (
    <MapContainer
      center={mapCenter}
      zoom={13}
      maxZoom={20}
      style={{ height: "500px", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="© OpenStreetMap contributors"
        maxZoom={22}
      />
      <MapControls />
      <DrawControl onCreated={onPolygonCreated} />
    </MapContainer>
  );
}
