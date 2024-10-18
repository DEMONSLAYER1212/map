// src/App.js
import React, { useState } from "react";
import Map from "./components/Map";

const App = () => {
  const [user, setUser] = useState("DefaultUser");
  const [geoData, setGeoData] = useState(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        setGeoData(JSON.parse(content)); // Make sure it's valid GeoJSON
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {user ? (
        <div className="flex flex-col">
          <h1 className="text-center text-2xl font-bold mt-4">
            Welcome, {user}!
          </h1>
          <input
            type="file"
            accept=".geojson,.kml"
            onChange={handleFileUpload}
            className="my-4 mx-auto border border-gray-300 rounded p-2"
          />
          <Map geoData={geoData} />
        </div>
      ) : (
        <div className="flex justify-center items-center h-screen">
          <h2>Please log in.</h2>
        </div>
      )}
    </div>
  );
};

export default App;
