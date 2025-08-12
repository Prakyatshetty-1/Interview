import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

export default function TagResults() {
  const { tag } = useParams();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchByTag = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token"); // if your API requires auth
        const res = await fetch(`/api/interviews/by-tag/${encodeURIComponent(tag)}`, {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (!res.ok) {
          const body = await res.text();
          throw new Error(`Fetch failed: ${res.status} ${body}`);
        }
        const data = await res.json();
        setInterviews(data);
      } catch (err) {
        console.error("Tag fetch error:", err);
        setError(err.message || "Failed to fetch");
      } finally {
        setLoading(false);
      }
    };

    fetchByTag();
  }, [tag]);

  if (loading) return <div style={{ padding: 20 }}>Loading interviews for "{tag}"...</div>;
  if (error) return <div style={{ padding: 20, color: "salmon" }}>Error: {error}</div>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Interviews tagged: "{tag}"</h2>
      {interviews.length === 0 && <p>No interview packs found for this tag.</p>}
      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", marginTop: 12 }}>
        {interviews.map((iv) => (
          <div key={iv._id || iv.id} style={{
            background: "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))",
            padding: 16, borderRadius: 12, color: "#fff", boxShadow: "0 6px 18px rgba(0,0,0,0.6)"
          }}>
            <h3 style={{ margin: 0 }}>{iv.title || "Untitled"}</h3>
            <p style={{ margin: "6px 0 0 0", fontSize: 13 }}>{iv.category} • {iv.difficulty}</p>
            {iv.tags && iv.tags.length > 0 && (
              <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
                {iv.tags.map(t => <span key={t} style={{ fontSize: 12, padding: "4px 8px", borderRadius: 16, background: "rgba(255,255,255,0.04)" }}>{t}</span>)}
              </div>
            )}
            <Link to={`/interviews/${iv._id || iv.id}`} style={{ marginTop: 12, display: "inline-block", color: "#9ae6b4" }}>
              View interview →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
