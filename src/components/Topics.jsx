"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import "./Topics.css";

const allTopics = [
  { name: "Full Stack", count: 1944 },
  { name: "Front End", count: 798 },
  { name: "Back End", count: 709 },
  { name: "Mobile Dev", count: 600 },
  { name: "Desktop Dev", count: 591 },
  { name: "ML", count: 457 },
  { name: "Data Science", count: 421 },
  { name: "Data Engineer", count: 328 },
  { name: "AI Research", count: 309 },
  { name: "Database", count: 308 },
  { name: "Matrix", count: 260 },
  { name: "Tree", count: 252 },
  { name: "Breadth-First Search", count: 245 },
  { name: "Bit Manipulation", count: 244 },
  { name: "Two Pointers", count: 220 },
  { name: "Prefix Sum", count: 206 },
  { name: "Heap (Priority Queue)", count: 196},
  { name: "Simulation", count: 182 },
  { name: "Binary Tree", count: 177 },
  { name: "Stack", count: 171 },
  { name: "Graph", count: 167 },
  { name: "Counting", count: 165 },
  { name: "Sliding Window", count: 153 },
  { name: "Design", count: 130 },
  { name: "Enumeration", count: 121 },
  { name: "Backtracking", count: 108 },
  { name: "Union Find", count: 88 },
  { name: "Linked List", count: 81 },
  { name: "Number Theory", count: 74 },
  { name: "Ordered Set", count: 72 },
  { name: "Monotonic Stack", count: 68 },
  { name: "Segment Tree", count: 64 },
  { name: "Trie", count: 57 },
  { name: "Combinatorics", count: 55 },
  { name: "Bitmask", count: 54 },
  { name: "Queue", count: 50 },
  { name: "Recursion", count: 49 },
  { name: "Divide and Conquer", count: 48 },
  { name: "Binary Indexed Tree", count: 43 },
  { name: "Memoization", count: 42 },
  { name: "Geometry", count: 41 },
  { name: "Hash Function", count: 40 },
  { name: "Binary Search Tree", count: 40 },
  { name: "String Matching", count: 37 },
  { name: "Topological Sort", count: 36 },
  { name: "Shortest Path", count: 35 },
  { name: "Rolling Hash", count: 31 },
  { name: "Game Theory", count: 28 },
  { name: "Interactive", count: 23 },
  { name: "Data Stream", count: 21 },
  { name: "Monotonic Queue", count: 20 },
  { name: "Brainteaser", count: 18 },
  { name: "Doubly-Linked List", count: 13 },
  { name: "Randomized", count: 12 },
  { name: "Merge Sort", count: 12 },
  { name: "Counting Sort", count: 11 },
  { name: "Iterator", count: 9 },
  { name: "Concurrency", count: 9 },
  { name: "Probability and Statistics", count: 7 },
  { name: "Quickselect", count: 7 },
  { name: "Suffix Array", count: 7 },
  { name: "Line Sweep", count: 7 },
  { name: "Bucket Sort", count: 6 },
  { name: "Minimum Spanning Tree", count: 5 },
  { name: "Shell", count: 4 },
  { name: "Reservoir Sampling", count: 4 },
  { name: "Strongly Connected Component", count: 3 },
  { name: "Eulerian Circuit", count: 3 },
  { name: "Radix Sort", count: 3 },
  { name: "Rejection Sampling", count: 2 },
  { name: "Biconnected Component", count: 1 },
]

const Topics = () => {

  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

  const visibleTopics = isExpanded ? allTopics : allTopics.slice(0, 9);

  const toggleExpanded = () => setIsExpanded(!isExpanded);

  const handleTopicClick = (topicName) => {
    try {
      console.log("Clicking topic:", topicName);
      
      // Clean and normalize the topic name for URL
      const normalizedTag = topicName.trim().toLowerCase();
      const urlSafeTag = encodeURIComponent(normalizedTag);
      
      const targetUrl = `/interviews/tag/${urlSafeTag}`;
      console.log("Navigating to:", targetUrl);
      
      navigate(targetUrl);
    } catch (error) {
      console.error("Navigation error:", error);
    }
  };

  return (
    <div className="topics-filter1">
      <div className="topics-container1">

        {visibleTopics.map((topic) => (
          <button
            key={topic.name}
            className="topic-button1 highlighted1"
            onClick={() => handleTopicClick(topic.name)}
            aria-label={`View ${topic.name} interviews`}
          >
            <span className="topic-name1">{topic.name}</span>
            <span className="topic-count1">{topic.count}</span>
          </button>
        ))}

        <button 
          className="expand-button1" 
          onClick={toggleExpanded}
          aria-expanded={isExpanded}
        >
          {isExpanded ? "Collapse" : "Expand"}
          <span className="expand-icon1">{isExpanded ? "↑" : "↓"}</span>
        </button>
      </div>
    </div>
  );
};

export default Topics;