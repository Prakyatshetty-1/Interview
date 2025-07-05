"use client"

import { useState } from "react"
import { List, Settings, Database, Terminal, Zap, BarChart3 } from "lucide-react"
import "./TopicFilter.css"

const topics = [
  { id: "all", label: "All Topics", icon: List, color: "gray" },
  { id: "algorithms", label: "Algorithms", icon: Settings, color: "orange" },
  { id: "database", label: "Database", icon: Database, color: "blue" },
  { id: "shell", label: "Shell", icon: Terminal, color: "green" },
  { id: "concurrency", label: "Concurrency", icon: Zap, color: "purple" },
  { id: "javascript", label: "JavaScript", icon: null, color: "blue-light" },
  { id: "pandas", label: "pandas", icon: BarChart3, color: "pink" },
]

export default function TopicFilter() {
  const [activeTopic, setActiveTopic] = useState("all")

  return (
    <div className="topic-filter-container">
      {topics.map((topic) => {
        const Icon = topic.icon
        const isActive = activeTopic === topic.id

        return (
          <div
            key={topic.id}
            onClick={() => setActiveTopic(topic.id)}
            className={`topic-button ${isActive ? "active" : ""} ${topic.color}`}
          >
            {topic.id === "javascript" ? <div className="js-icon">JS</div> : Icon && <Icon className="topic-icon" />}
            <span className="topic-label">{topic.label}</span>
          </div>
        )
      })}
    </div>
  )
}