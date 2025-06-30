import { useState, useMemo } from "react";
import { MdFilterAlt, MdFilterAltOff } from "react-icons/md";
import Card from "./Card";
import "./SearchBar.css";

export default function SearchBar() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [sortBy, setSortBy] = useState("count");

  const cardData = [
    {
      difficulty: "Med.",
      title: "Full Stack Challenge",
      creator: "bhavith",
      tags: ["Web Dev", "Full Stack"],
      path: "/FullStackWebDev.png",
    },
    {
      difficulty: "Easy",
      title: "Frontend Basics",
      creator: "Prakyat",
      tags: ["React", "UI"],
      path: "/MLEngineering.png",
    },
    {
      difficulty: "Med.",
      title: "Full Stack Challenge",
      creator: "bhavith",
      tags: ["Web Dev", "Full Stack"],
      path: "/FrontEndDev.png",
    },
    {
      difficulty: "Easy",
      title: "Frontend Basics",
      creator: "Prakyat",
      tags: ["React", "UI"],
      path: "/DesktopDev.png",
    },
    {
      difficulty: "Med.",
      title: "Full Stack Challenge",
      creator: "bhavith",
      tags: ["Web Dev", "Full Stack"],
      path: "/BackEndDev.png",
    },
  ];

  const filteredCards = useMemo(() => {
    if (!searchTerm.trim()) return cardData;
    return cardData.filter((card) =>
      card.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const handleSortToggle = () => {
    setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"));
  };

  const handleSortByToggle = () => {
    setSortBy((prev) => (prev === "count" ? "name" : "count"));
  };

  return (
    <div className="mainclass5">
      <div className="search-bar-container5">
        <div className="search-input-wrapper5">
          <svg className="search-icon5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
              clipRule="evenodd"
            />
          </svg>
          <input
            type="text"
            placeholder="Search by title"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input5"
          />
        </div>

        <div className="filter-buttons5">
          <button
            className="filter-btn5"
            onClick={handleSortByToggle}
            title={`Sort by ${sortBy === "count" ? "Name" : "Count"}`}
          >
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 8a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1zM3 12a1 1 0 011-1h4a1 1 0 110 2H4a1 1 0 01-1-1z" />
            </svg>
          </button>

          <button
            className="filter-btn5"
            onClick={handleSortToggle}
            title={`Sort ${sortOrder === "desc" ? "Ascending" : "Descending"}`}
          >
            {sortOrder === "desc" ? <MdFilterAlt /> : <MdFilterAltOff />}
          </button>
        </div>
      </div>
      
      <div className="horizontal-divider"></div>

      {/* Card grid */}
      
      <div className="topicholder">
        {filteredCards.length > 0 ? (
          filteredCards.map((card, index) => (
            <Card key={index} {...card} />
          ))
        ) : (
          <p className="no-results5">No matching cards found.</p>
        )}
      </div>

    </div>
  );
}
