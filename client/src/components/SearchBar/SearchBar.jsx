import React, { useState } from "react";
import "./SearchBar.css";

function SearchBar() {
  const [whereValue, setWhereValue] = useState("");

  return (
    <section className="search-section">
      <div className="search-container">
        <h1 className="search-headline">
          Not sure where to go? Perfect.
        </h1>

        <p className="search-subheadline">
          Explore thousands of unique properties. Book with confidence and enjoy your stay.
        </p>

        {/* Unified Pill Search Bar */}
        <div className="search-bar-pill">

          {/* WHERE FIELD */}
          <div className="search-field search-where">
            <label>Where</label>
            <input
              type="text"
              placeholder="Search destinations"
              value={whereValue}
              onChange={(e) => setWhereValue(e.target.value)}
            />
          </div>

          <div className="search-divider"></div>

          {/* CHECK IN FIELD */}
          <div className="search-field search-checkin">
            <label>Check in</label>
            <div className="search-display">Add dates</div>
          </div>

          <div className="search-divider"></div>

          {/* CHECK OUT FIELD */}
          <div className="search-field search-checkout">
            <label>Check out</label>
            <div className="search-display">Add dates</div>
          </div>

          <div className="search-divider"></div>

          {/* WHO FIELD */}
          <div className="search-field search-who">
            <label>Who</label>
            <div className="search-display">Add guests</div>
          </div>

          {/* SEARCH BUTTON */}
          <button
            className="search-button-round"
            type="button"
            aria-label="Search"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7 13A6 6 0 1 0 7 1a6 6 0 0 0 0 12zM15 15l-3.35-3.35"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>

        </div>
      </div>
    </section>
  );
}

export default SearchBar;