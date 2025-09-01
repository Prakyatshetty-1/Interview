import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Card from "../components/Card";
import "./InterviewsByTag.css";

export default function InterviewsByTag() {
  const { tag } = useParams();
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // This is the decoded, pretty version for display
  const displayTag = decodeURIComponent(tag)
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  useEffect(() => {
    const fetchByTag = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("token");
        // Send lowercased tag to backend for consistent matching
        const normalizedTag = decodeURIComponent(tag).trim().toLowerCase();

        const url = `${import.meta.env.VITE_API_BASE}/api/interviews/by-tag/${encodeURIComponent(normalizedTag)}`;
        console.log("Fetching:", url);

        const res = await fetch(url, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Server error: ${res.status} - ${errorText}`);
        }

        const data = await res.json();
        setInterviews(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message || "Failed to fetch interviews");
      } finally {
        setLoading(false);
      }
    };

    fetchByTag();
  }, [tag]);

  return (
    <div className="interviews-by-tag-container">
      <button 
        onClick={() => navigate(-1)} 
        className="back-button"
        aria-label="Go back"
      >
        ← Back
      </button>
      
      <h2>Interviews tagged: "{displayTag}"</h2>

      {loading && <p className="loading-message">Loading...</p>}
      {error && <p className="error-message">{error}</p>}

      {!loading && !error && interviews.length === 0 && (
        <p className="no-results">No interview packs found for this tag.</p>
      )}

      <div className="interview-grid">
        {interviews.map((interview) => (
          <Card key={interview._id} className="interview-card">
            <div className="card-content">
              <h3>{interview.title || "Untitled"}</h3>
              <p className="meta-info">
                Category: {interview.category || "—"} • Difficulty: {interview.difficulty || "—"}
              </p>
              {interview.tags?.length > 0 && (
                <div className="tags-container">
                  {interview.tags.map(t => (
                    <span key={t} className="tag-item">{t}</span>
                  ))}
                </div>
              )}
              <div className="action-buttons">
                <button 
                  onClick={() => navigate(`/interview/${interview._id}`)}
                  className="view-button"
                >
                  View
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
