import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import NavBar from "./components/NavBar";
import Login from "./components/LoginPage";
import Register from "./components/Register";
import Map from "./components/Map";

const App = () => {
  const [user, setUser] = useState(null);
  const [geoData, setGeoData] = useState([]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchGeoData();
    }
  }, [user]);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  const fetchGeoData = async () => {
    try {
      const response = await fetch("http://localhost:8087/api/geodata");
      if (response.ok) {
        const data = await response.json();
        setGeoData(data);
      } else {
        console.error("Failed to fetch geodata");
      }
    } catch (error) {
      console.error("Error fetching geodata:", error);
    }
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <NavBar user={user} onLogout={handleLogout} />
        <Routes>
          <Route
            path="/login"
            element={
              user ? <Navigate to="/" replace /> : <Login setUser={setUser} />
            }
          />
          <Route
            path="/register"
            element={
              user ? (
                <Navigate to="/" replace />
              ) : (
                <Register setUser={setUser} />
              )
            }
          />
          <Route
            path="/"
            element={
              user ? (
                <div className="flex flex-col">
                  <h1 className="text-center text-2xl font-bold mt-4">
                    Welcome, {user.username}!
                  </h1>
                  <Map geoData={geoData} onSave={fetchGeoData} />
                </div>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
