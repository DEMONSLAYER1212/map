// src/Map.js
import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, GeoJSON, LayersControl } from "react-leaflet";
import { FeatureGroup } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import { saveAs } from "file-saver";

const { BaseLayer } = LayersControl;

const Map = ({ geoData }) => {
  const [drawnShapes, setDrawnShapes] = useState([]);

  const handleOnCreated = (e) => {
    const layer = e.layer;
    const geoJson = layer.toGeoJSON();
    setDrawnShapes((prev) => [...prev, geoJson]);
  };

  const handleDownload = () => {
    const combinedGeoJSON = {
      type: "FeatureCollection",
      features: [...drawnShapes],
    };
    const blob = new Blob([JSON.stringify(combinedGeoJSON, null, 2)], {
      type: "application/json",
    });
    saveAs(blob, "drawn_shapes.geojson");
  };

  return (
    <div className="relative">
      <MapContainer
        center={[20.5937, 78.9629]}
        zoom={5}
        className="h-[500px] w-full"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {geoData && <GeoJSON data={geoData} />}
        <FeatureGroup>
          <EditControl
            position="topright"
            onCreated={handleOnCreated}
            draw={{
              rectangle: true,
              polygon: true,
              circle: false, // Disable circle drawing if you want
              marker: true, // Allow drawing points
              polyline: false, // Disable polylines
            }}
          />
        </FeatureGroup>
      </MapContainer>
      <button
        onClick={handleDownload}
        className="absolute top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
      >
        Save Shapes
      </button>
    </div>
  );
};

export default Map;
