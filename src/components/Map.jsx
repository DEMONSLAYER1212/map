import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, FeatureGroup } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";

const Map = ({ geoData, onSave }) => {
  const [map, setMap] = useState(null);
  const featureGroupRef = useRef(null);

  useEffect(() => {
    if (map && geoData) {
      loadGeoData();
    }
  }, [map, geoData]);

  const loadGeoData = () => {
    if (featureGroupRef.current) {
      featureGroupRef.current.clearLayers();

      geoData.forEach((item) => {
        if (item.data) {
          const geoJSONLayer = L.geoJSON(JSON.parse(item.data));
          geoJSONLayer.eachLayer((layer) => {
            layer.feature.properties.id = item.id;
            addClickToDownloadGeoJSON(layer);
            featureGroupRef.current.addLayer(layer);
          });
        }
      });

      const bounds = featureGroupRef.current.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds);
      }
    }
  };

  const addClickToDownloadGeoJSON = (layer) => {
    layer.on("click", (e) => {
      console.log("Layer clicked"); // Debug log
      const popupContent = `
        <div style="text-align: center;">
          <button id="downloadGeoJSON" style="
            background-color: #4CAF50;
            border: none;
            color: white;
            padding: 10px 20px;
            text-align: center;
            text-decoration: none;
            display: inline-block;
            font-size: 16px;
            margin: 4px 2px;
            cursor: pointer;
            border-radius: 5px;
          ">Save as GeoJSON</button>
        </div>
      `;
      layer.bindPopup(popupContent).openPopup();

      // Use a more reliable way to attach the click event
      layer.on("popupopen", () => {
        console.log("Popup opened"); // Debug log
        const downloadButton = document.getElementById("downloadGeoJSON");
        if (downloadButton) {
          downloadButton.onclick = () => {
            console.log("Download button clicked"); // Debug log
            downloadGeoJSON(layer.toGeoJSON());
            layer.closePopup();
          };
        } else {
          console.log("Download button not found"); // Debug log
        }
      });
    });
  };

  const downloadGeoJSON = (geoJSON) => {
    console.log("Downloading GeoJSON"); // Debug log
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(geoJSON));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "shape.geojson");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleCreated = async (e) => {
    const layer = e.layer;
    const geoJSON = layer.toGeoJSON();

    try {
      console.log(
        "Sending data to server:",
        JSON.stringify({
          action: "create",
          data: geoJSON,
        })
      );

      const response = await fetch("http://localhost:8080/api/geodata", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "create",
          data: geoJSON,
        }),
      });

      console.log("Response status:", response.status);

      if (response.ok) {
        const result = await response.json();
        console.log("Server response:", result);

        if (result && result.id) {
          layer.feature.properties.id = result.id;
          addClickToDownloadGeoJSON(layer);
          featureGroupRef.current.addLayer(layer);
          onSave(); // Optional: call fetchGeoData to refresh data
        } else {
          throw new Error("Server response missing ID");
        }
      } else {
        const errorText = await response.text();
        throw new Error(
          `Server responded with status ${response.status}: ${errorText}`
        );
      }
    } catch (error) {
      console.error("Error saving geodata:", error);
      alert(`Failed to save shape: ${error.message}`);
    }
  };

  const handleEdited = (e) => {
    const layers = e.layers;
    layers.eachLayer(async (layer) => {
      if (
        layer.feature &&
        layer.feature.properties &&
        layer.feature.properties.id
      ) {
        const geoJSON = layer.toGeoJSON();
        try {
          const response = await fetch(
            `http://localhost:8087/api/geodata/${layer.feature.properties.id}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                action: "edit",
                data: JSON.stringify(geoJSON),
              }),
            }
          );

          if (!response.ok) {
            console.error("Failed to update geodata");
          }
        } catch (error) {
          console.error("Error updating geodata:", error);
        }
      }
    });
  };

  const handleDeleted = async (e) => {
    const layers = e.layers;
    layers.eachLayer(async (layer) => {
      if (
        layer.feature &&
        layer.feature.properties &&
        layer.feature.properties.id
      ) {
        const layerId = layer.feature.properties.id;
        try {
          const response = await fetch(
            `http://localhost:8087/api/geodata/${layerId}`,
            {
              method: "DELETE",
            }
          );

          if (response.ok) {
            featureGroupRef.current.removeLayer(layer);
          } else {
            console.error("Failed to delete geodata");
          }
        } catch (error) {
          console.error("Error deleting geodata:", error);
        }
      } else {
        featureGroupRef.current.removeLayer(layer);
      }
    });
  };

  return (
    <MapContainer
      center={[20.5937, 78.9629]}
      zoom={5}
      className="h-[500px] w-full"
      whenCreated={setMap}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <FeatureGroup ref={featureGroupRef}>
        <EditControl
          position="topright"
          onCreated={handleCreated}
          onEdited={handleEdited}
          onDeleted={handleDeleted}
          draw={{
            rectangle: true,
            polygon: true,
            circle: false,
            circlemarker: false,
            marker: true,
            polyline: true,
          }}
        />
      </FeatureGroup>
    </MapContainer>
  );
};

export default Map;
