// src/pages/InterviewDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function InterviewDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchInterview() {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`/api/interview/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setInterview(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchInterview();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{color: "red"}}>{error}</p>;
  if (!interview) return <p>No interview found.</p>;

  return (
    <div style={{ padding: 20 }}>
      <button onClick={() => navigate(-1)}>← Back</button>
      <h1>{interview.title}</h1>
      <p>Category: {interview.category}</p>
      <p>Difficulty: {interview.difficulty}</p>
      <p>Tags: {interview.tags?.join(", ")}</p>

      <h2>Questions</h2>
      <ol>
        {interview.questions?.map((q, i) => (
          <li key={i} style={{ marginBottom: "10px" }}>
            <strong>{q.question}</strong>
            <div style={{ fontSize: "12px", color: "#999" }}>
              Category: {q.category} | Difficulty: {q.difficulty} | Expected Time: {q.expectedDuration} min
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
