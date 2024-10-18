import React from "react";
import { Link } from "react-router-dom";

function NavBar() {
  return (
    <nav>
      <h1>GeoJSON Clone</h1>
      <ul>
        <>
          <li>
            <Link to="/geojson">GeoJSON Editor</Link>
          </li>
          <li>
            <button onClick={logout}>Logout</button>
          </li>
        </>
      </ul>
    </nav>
  );
}

export default NavBar;
