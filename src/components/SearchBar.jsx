
"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Card from "./Card"
import "./SearchBar.css"
import { BiSort } from "react-icons/bi"
import { FaFilter } from "react-icons/fa"
import ShinyText from "../react-bits/ShinyText"


export default function SearchBar({ onCardClick }) {

  const [searchTerm, setSearchTerm] = useState("")
  const [sortOrder, setSortOrder] = useState("desc")
  const [cardData, setCardData] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState("All")
  const [selectedDifficulties, setSelectedDifficulties] = useState([])
  const [selectedTopics, setSelectedTopics] = useState([])
  const [selectedStatus, setSelectedStatus] = useState([])
  const [selectedLanguages, setSelectedLanguages] = useState([])
  const [topicsSearch, setTopicsSearch] = useState("")

  const [matchType, setMatchType] = useState("All")
  const [isTopicsExpanded, setIsTopicsExpanded] = useState(false)
  const [isTopicsModalOpen, setIsTopicsModalOpen] = useState(false)

  const categoryImageMap = {
    "accounting": "https://res.cloudinary.com/dmbavexyg/image/upload/v1756975018/askora_public/Accounting.png",
    "ai research": "https://res.cloudinary.com/dmbavexyg/image/upload/v1756975027/askora_public/AIResearch.png",
    "aerospace engineer": "https://res.cloudinary.com/dmbavexyg/image/upload/v1756975023/askora_public/AerospaceEngineer.png",
    "application security engineer": "https://res.cloudinary.com/dmbavexyg/image/upload/v1756975039/askora_public/ApplicationSecurityEngineer.png",
    "back end": "/BackEndDev.png",
    "chemical engineer": "/ChemicalEngineer.png",
    "civil engineer": "/CivilEngineer.png",
    "cloud engineer": "/CloudEngineering.png",
    "cyber security": "/CyberSecurity.png",
    "data engineer": "/DataEngineer.png",
    "data scientist": "/DataScientist.png",
    "desktop dev": "/DesktopDev.png",
    "devops engineer": "/DevOpsEngineer.png",
    "electrical engineering": "/ElectricalEngineering.png",
    "electronics engineer": "/ElectronicsEngineer.png",
    "front end": "https://res.cloudinary.com/dmbavexyg/image/upload/f_auto,q_auto/v1756975099/askora_public/FrontEndDev.png",
    "full stack": "/FullStackWebDev.png",
    "game development": "/GameDeveloper.png",
    "ml engineer": "/MLEngineering.png",
    "mechanical engineering": "/MechanicalEngineering.png",
    "mobile dev": "/MobileDev.png",
    "robotics engineer": "/Robotics.png",
    "security engineer": "/SecurityEngineering.png",
    "site reliability engineer": "/SiteReliabilityEngineer.png",
  };

  const getImageForCategory = (category) => {
  if (!category) return "/default.png";
  const key = String(category).toLowerCase();
  return categoryImageMap[key] || "/default.png";
};

  const [advancedFilters, setAdvancedFilters] = useState({
    status: { condition: "is", value: "" },
    difficulty: { condition: "is", value: "" },
    topics: { condition: "is", values: [] },
    language: { condition: "is", value: "" },
  })



  const [excludeFilters, setExcludeFilters] = useState({
    status: false,
    difficulty: false,
    topics: false,
    language: false,
  })

  const filterRef = useRef(null)
  const advancedFilterRef = useRef(null)
  const cardsPerPage = 25


  const TITLE_CHAR_LIMIT = 20
  const TAG_CHAR_LIMIT = 10
  const MAX_TAGS_DISPLAY = 2 // New constant for maximum tags to display


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsFilterOpen(false)
      }
      if (advancedFilterRef.current && !advancedFilterRef.current.contains(event.target)) {
        setIsAdvancedFilterOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)

    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const truncateText = (text = "", limit) => {
    if (!text) return ""
    return text.length <= limit ? text : text.substring(0, limit) + "..."
  }

  // Updated function to limit tags to maximum 3 and truncate text
  const truncateTags = (tags = []) => {
    if (!Array.isArray(tags)) return []
    
    // First limit to MAX_TAGS_DISPLAY, then truncate text of each tag
    return tags
      .slice(0, MAX_TAGS_DISPLAY)
      .map((t) => truncateText(t, TAG_CHAR_LIMIT))
  }

  // fetch backend packs and map them to card shape
  useEffect(() => {
  const fetchPacks = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // Prefer env var if set, otherwise fallback to localhost
      const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";
      const res = await fetch(`${API_BASE}/api/interviews/all`, { headers });

      // If response isn't JSON, read text so we can debug unexpected HTML (e.g. index.html)
      const text = await res.text().catch(() => "");
      if (!res.ok) {
        // include response body in thrown error for debugging
        throw new Error(`Fetch failed: ${res.status} ${text}`);
      }

      // Try parsing JSON from text (some servers may return text even when 200)
      let data;
      try {
        data = text ? JSON.parse(text) : [];
      } catch (e) {
        // couldn't parse JSON -> probably HTML or broken JSON
        console.warn("SearchBar: response text (not valid JSON):", text);
        data = [];
      }

      // Accept an array or object with .packs
      let packsArray = [];
      if (Array.isArray(data)) packsArray = data;
      else if (data && Array.isArray(data.packs)) packsArray = data.packs;
      else packsArray = [];

      // Map to card shape and attach category image
      const mapped = packsArray.map((pack) => ({
        id: pack._id || pack.id || String(Math.random()).slice(2),
        title: pack.title || "Untitled",
        originalTitle: pack.title || "Untitled",
        originalTags: Array.isArray(pack.tags) ? pack.tags : pack.tags ? [pack.tags] : pack.category ? [pack.category] : [],
        tags: Array.isArray(pack.tags) ? pack.tags : pack.tags ? [pack.tags] : pack.category ? [pack.category] : [],
        difficulty: pack.difficulty || "Med.",
        status: pack.status || "",
        language: pack.language || "",
        creator: pack.user?.name || pack.creator || "Unknown",
        category: pack.category || "",
        // Use your helper to choose an image by category
        path: getImageForCategory(pack.category),
      }));

      setCardData(mapped);
    } catch (err) {
      console.error("Error fetching packs in SearchBar:", err);
      setCardData([]);
    }
  };

  fetchPacks();
}, []);
  

  const processedCardData = useMemo(() => {
    return (cardData || []).map((card) => ({
      ...card,
      title: truncateText(card.title || card.originalTitle || "", TITLE_CHAR_LIMIT),
      tags: truncateTags(card.originalTags || card.tags || []),
      originalTitle: card.originalTitle || card.title || "",
      originalTags: card.originalTags || card.tags || [],

    }))
  }, [cardData])

  const allTopics = useMemo(() => {
    const topics = new Set()

    ;(cardData || []).forEach((card) => {
      ;(card.originalTags || card.tags || []).forEach((tag) => topics.add(tag))

    })
    return Array.from(topics).sort()
  }, [cardData])

  const filteredTopics = useMemo(() => {
    if (!topicsSearch.trim()) return allTopics
    return allTopics.filter((topic) => topic.toLowerCase().includes(topicsSearch.toLowerCase()))
  }, [allTopics, topicsSearch])

  const allStatuses = ["Solved", "Unsolved", "Attempted"]
  const allLanguages = ["JavaScript", "Python", "Java", "C++", "Dart", "Go", "Rust"]


  const filteredCards = useMemo(() => {
    let filtered = processedCardData || []

    if (searchTerm.trim()) {
      const s = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (card) =>
          (card.originalTitle || "").toLowerCase().includes(s) ||
          (card.originalTags || []).some((tag) => (tag || "").toLowerCase().includes(s)),
      )
    }

    if (matchType === "All") {
      if (selectedDifficulties.length > 0) {
        filtered = excludeFilters.difficulty
          ? filtered.filter((card) => !selectedDifficulties.includes(card.difficulty))
          : filtered.filter((card) => selectedDifficulties.includes(card.difficulty))
      }

      if (selectedTopics.length > 0) {
        filtered = excludeFilters.topics
          ? filtered.filter((card) => !(selectedTopics.some((topic) => (card.originalTags || []).includes(topic))))
          : filtered.filter((card) => selectedTopics.some((topic) => (card.originalTags || []).includes(topic)))
      }

      if (selectedStatus.length > 0) {
        filtered = excludeFilters.status ? filtered.filter((card) => !selectedStatus.includes(card.status)) : filtered.filter((card) => selectedStatus.includes(card.status))
      }

      if (selectedLanguages.length > 0) {
        filtered = excludeFilters.language ? filtered.filter((card) => !selectedLanguages.includes(card.language)) : filtered.filter((card) => selectedLanguages.includes(card.language))
      }
    } else {
      filtered = filtered.filter((card) => {
        const matchesDifficulty =
          selectedDifficulties.length === 0 ||
          (excludeFilters.difficulty ? !selectedDifficulties.includes(card.difficulty) : selectedDifficulties.includes(card.difficulty))

        const matchesTopics =
          selectedTopics.length === 0 ||
          (excludeFilters.topics ? !selectedTopics.some((topic) => (card.originalTags || []).includes(topic)) : selectedTopics.some((topic) => (card.originalTags || []).includes(topic)))

        const matchesStatus =
          selectedStatus.length === 0 || (excludeFilters.status ? !selectedStatus.includes(card.status) : selectedStatus.includes(card.status))

        const matchesLanguage =
          selectedLanguages.length === 0 || (excludeFilters.language ? !selectedLanguages.includes(card.language) : selectedLanguages.includes(card.language))


        return matchesDifficulty || matchesTopics || matchesStatus || matchesLanguage
      })
    }


    if (selectedFilter === "Easy to Hard") {
      const order = (d) => {
        switch ((d || "").toLowerCase()) {
          case "easy":
            return 1
          case "med.":
          case "medium":
            return 2
          case "hard":
            return 3
          default:
            return 2
        }
      }
      filtered = [...filtered].sort((a, b) => order(a.difficulty) - order(b.difficulty))
    } else if (selectedFilter === "Hard to Easy") {
      const order = (d) => {
        switch ((d || "").toLowerCase()) {
          case "easy":
            return 1
          case "med.":
          case "medium":
            return 2
          case "hard":
            return 3
          default:
            return 2
        }
      }
      filtered = [...filtered].sort((a, b) => order(b.difficulty) - order(a.difficulty))
    } else {
      filtered = [...filtered].sort((a, b) => {
        const aVal = (a.originalTitle || "").toLowerCase()
        const bVal = (b.originalTitle || "").toLowerCase()

        return sortOrder === "asc" ? bVal.localeCompare(aVal) : aVal.localeCompare(bVal)
      })
    }

    return filtered
  }, [
    searchTerm,
    selectedDifficulties,
    selectedTopics,
    selectedStatus,
    selectedLanguages,
    selectedFilter,
    sortOrder,
    processedCardData,
    matchType,

    excludeFilters,
  ])

  const totalPages = Math.max(1, Math.ceil((filteredCards || []).length / cardsPerPage))
  const startIndex = (currentPage - 1) * cardsPerPage
  const endIndex = startIndex + cardsPerPage
  const currentCards = (filteredCards || []).slice(startIndex, endIndex)

  useEffect(() => setCurrentPage(1), [searchTerm, selectedDifficulties, selectedTopics, selectedStatus, selectedLanguages, selectedFilter])


  const getPaginationRange = () => {
    const maxPagesToShow = 5
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2))
    const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1)
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1)
    }
    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i)
  }


  const handlePageChange = (page) => setCurrentPage(page)
  const handlePrevPage = () => setCurrentPage((p) => Math.max(p - 1, 1))
  const handleNextPage = () => setCurrentPage((p) => Math.min(p + 1, totalPages))


  const handleFilterSelect = (filterValue, displayName) => {
    setSelectedFilter(displayName)
    setIsFilterOpen(false)
  }


  const handleAdvancedFilterToggle = () => setIsAdvancedFilterOpen((s) => !s)

  const handleAdvancedFilterChange = (filterType, field, value) =>
    setAdvancedFilters((prev) => ({ ...prev, [filterType]: { ...prev[filterType], [field]: value } }))

  const handleTopicChipToggle = (topic) =>

    setAdvancedFilters((prev) => ({
      ...prev,
      topics: {
        ...prev.topics,

        values: prev.topics.values.includes(topic) ? prev.topics.values.filter((t) => t !== topic) : [...prev.topics.values, topic],
      },
    }))

  const handleSaveAsSmartList = () => {

    setSelectedDifficulties([])
    setSelectedTopics([])
    setSelectedStatus([])
    setSelectedLanguages([])


    const newExcludeFilters = { status: false, difficulty: false, topics: false, language: false }

    const newDifficulties = []
    const newTopics = []
    const newStatuses = []
    const newLanguages = []



    Object.entries(advancedFilters).forEach(([filterType, filterData]) => {
      if (filterType === "topics") {
        if (filterData.values && filterData.values.length > 0) {
          newTopics.push(...filterData.values)
          newExcludeFilters.topics = filterData.condition === "is not"
        }
      } else if (filterData.value) {
        const isExclude = filterData.condition === "is not"

        switch (filterType) {
          case "difficulty":
            newDifficulties.push(filterData.value)
            newExcludeFilters.difficulty = isExclude
            break
          case "status":
            newStatuses.push(filterData.value)
            newExcludeFilters.status = isExclude
            break
          case "language":
            newLanguages.push(filterData.value)
            newExcludeFilters.language = isExclude
            break
        }
      }
    })


    setSelectedDifficulties(newDifficulties)
    setSelectedTopics(newTopics)
    setSelectedStatus(newStatuses)
    setSelectedLanguages(newLanguages)
    setExcludeFilters(newExcludeFilters)

    setIsAdvancedFilterOpen(false)
    setIsTopicsModalOpen(false)
  }


  const handleResetFilters = () => {
    setSelectedDifficulties([])
    setSelectedTopics([])
    setSelectedStatus([])
    setSelectedLanguages([])
    setTopicsSearch("")
    setMatchType("All")

    setIsTopicsExpanded(false)
    setExcludeFilters({ status: false, difficulty: false, topics: false, language: false })
    setAdvancedFilters({ status: { condition: "is", value: "" }, difficulty: { condition: "is", value: "" }, topics: { condition: "is", values: [] }, language: { condition: "is", value: "" } })

  }

  return (
    <div className="mainclass5">
      <div className="search-bar-container5">
        <div className="search-input-wrapper5">
          <svg className="search-icon5" viewBox="0 0 20 20" fill="currentColor">

            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
          <input type="text" placeholder="Search by title" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="search-input5" />
        </div>

        <div className="filter-buttons5">
          <div className="custom-filter-dropdown5" ref={filterRef}>
            <button className="filter-icon-btn5" onClick={() => setIsFilterOpen((s) => !s)}><BiSort style={{ width: "32px", height: "32px" }} /></button>
            {isFilterOpen && (
              <div className="filter-dropdown-menu5">
                <div className={`filter-dropdown-item5 ${selectedFilter === "All" ? "selected" : ""}`} onClick={() => handleFilterSelect("all", "All")}>
                  <span>All</span>
                </div>
                <div className={`filter-dropdown-item5 ${selectedFilter === "Easy to Hard" ? "selected" : ""}`} onClick={() => handleFilterSelect("easy-to-hard", "Easy to Hard")}>
                  <span>Easy to Hard</span>
                </div>
                <div className={`filter-dropdown-item5 ${selectedFilter === "Hard to Easy" ? "selected" : ""}`} onClick={() => handleFilterSelect("hard-to-easy", "Hard to Easy")}>
                  <span>Hard to Easy</span>
                </div>
                <div className={`filter-dropdown-item5 ${selectedFilter === "Popular Questions" ? "selected" : ""}`} onClick={() => handleFilterSelect("popular", "Popular Questions")}>
                  <span>Popular Questions</span>

                </div>
              </div>
            )}
          </div>


          <div className="advanced-filter-dropdown5" ref={advancedFilterRef}>
            <button className="filter-btn5" onClick={handleAdvancedFilterToggle}>
              <FaFilter style={{ width: "16px", height: "16px" }} />
            </button>
            {isAdvancedFilterOpen && (
              <div className="advanced-filter-menu5">
                {/* Header */}
                <div className="advanced-filter-header5">
                  <div className="match-selector5">
                    <span>Match</span>
                    <select
                      value={matchType}
                      onChange={(e) => setMatchType(e.target.value)}
                      className="match-dropdown5"
                    >
                      <option value="All">All</option>
                      <option value="Any">Any</option>
                    </select>
                  </div>
                  <span className="filter-description5">of the following filters:</span>
                </div>

                {/* Status Filter */}
                <div className="filter-group5">
                  <div className="filter-group-header5">
                    <div className="filter-icon5">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                      </svg>
                    </div>
                    <span className="filter-label5">Status</span>
                    <select
                      className="filter-condition5"
                      value={advancedFilters.status.condition}
                      onChange={(e) => handleAdvancedFilterChange("status", "condition", e.target.value)}
                    >
                      <option value="is">is</option>
                      <option value="is not">is not</option>
                    </select>
                    <select
                      className="filter-value5"
                      value={advancedFilters.status.value}
                      onChange={(e) => handleAdvancedFilterChange("status", "value", e.target.value)}
                    >
                      <option value="">Select status...</option>
                      {allStatuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                    <button
                      className="remove-filter5"
                      onClick={() => handleAdvancedFilterChange("status", "value", "")}
                    >
                      —
                    </button>
                  </div>
                </div>

                {/* Difficulty Filter */}
                <div className="filter-group5">
                  <div className="filter-group-header5">
                    <div className="filter-icon5">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    </div>
                    <span className="filter-label5">Difficulty</span>
                    <select
                      className="filter-condition5"
                      value={advancedFilters.difficulty.condition}
                      onChange={(e) => handleAdvancedFilterChange("difficulty", "condition", e.target.value)}
                    >
                      <option value="is">is</option>
                      <option value="is not">is not</option>
                    </select>
                    <select
                      className="filter-value5"
                      value={advancedFilters.difficulty.value}
                      onChange={(e) => handleAdvancedFilterChange("difficulty", "value", e.target.value)}
                    >
                      <option value="">Select difficulty...</option>
                      <option value="Easy">Easy</option>
                      <option value="Med.">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                    <button
                      className="remove-filter5"
                      onClick={() => handleAdvancedFilterChange("difficulty", "value", "")}
                    >
                      —
                    </button>
                  </div>
                </div>

                {/* Topics Filter with Modal */}
                <div className="filter-group5">
                  <div className="filter-group-header5">
                    <div className="filter-icon5">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.63 5.84C17.27 5.33 16.67 5 16 5L5 5.01C3.9 5.01 3 5.9 3 7v10c0 1.1.9 2 2 2h11c.67 0 1.27-.33 1.63-.84L22 12l-4.37-6.16z" />
                      </svg>
                    </div>
                    <span className="filter-label5">Topics</span>
                    <select
                      className="filter-condition5"
                      value={advancedFilters.topics.condition}
                      onChange={(e) => handleAdvancedFilterChange("topics", "condition", e.target.value)}
                    >
                      <option value="is">is</option>
                      <option value="is not">is not</option>
                    </select>

                    {/* Topics Modal Trigger Button */}
                    <button className="topics-modal-trigger5" onClick={() => setIsTopicsModalOpen(true)}>
                      {advancedFilters.topics.values.length > 0
                        ? `${advancedFilters.topics.values.length} selected`
                        : "Select topics..."}
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M7 10l5 5 5-5z" />
                      </svg>
                    </button>

                    <button
                      className="remove-filter5"
                      onClick={() => {
                        handleAdvancedFilterChange("topics", "values", [])
                      }}
                    >
                      —
                    </button>
                  </div>
                </div>

                {/* Language Filter */}
                <div className="filter-group5">
                  <div className="filter-group-header5">
                    <div className="filter-icon5">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z" />
                      </svg>
                    </div>
                    <span className="filter-label5">Language</span>
                    <select
                      className="filter-condition5"
                      value={advancedFilters.language.condition}
                      onChange={(e) => handleAdvancedFilterChange("language", "condition", e.target.value)}
                    >
                      <option value="is">is</option>
                      <option value="is not">is not</option>
                    </select>
                    <select
                      className="filter-value5"
                      value={advancedFilters.language.value}
                      onChange={(e) => handleAdvancedFilterChange("language", "value", e.target.value)}
                    >
                      <option value="">Select language...</option>
                      {allLanguages.map((language) => (
                        <option key={language} value={language}>
                          {language}
                        </option>
                      ))}
                    </select>
                    <button
                      className="remove-filter5"
                      onClick={() => handleAdvancedFilterChange("language", "value", "")}
                    >
                      —
                    </button>
                  </div>
                </div>

                {/* Footer */}
                <div className="advanced-filter-footer5">
                  <button className="save-smart-list-btn5" onClick={handleSaveAsSmartList}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z" />
                    </svg>
                    Save as Smart List
                  </button>
                  <button className="reset-btn5" onClick={handleResetFilters}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
                    </svg>
                    Reset
                  </button>
                </div>
              </div>
            )}

            {/* Topics Selection Panel - positioned beside filter */}
            {isTopicsModalOpen && (
              <div className="topics-panel-beside5">
                <div className="topics-modal-header5">
                  <div className="topics-modal-search-wrapper5">
                    <svg className="topics-modal-search-icon5" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <input
                      type="text"
                      placeholder="search"
                      value={topicsSearch}
                      onChange={(e) => setTopicsSearch(e.target.value)}
                      className="topics-modal-search-input5"
                    />
                  </div>
                  
                </div>

                <div className="topics-modal-grid5">
                  {filteredTopics.map((topic) => (
                    <button
                      key={topic}
                      className={`topics-modal-chip5 ${advancedFilters.topics.values.includes(topic) ? "selected" : ""}`}
                      onClick={() => handleTopicChipToggle(topic)}
                    >
                      {topic}
                    </button>
                  ))}
                </div>

                <div className="topics-modal-footer5">
                  <button
                    className="topics-modal-reset5"
                    onClick={() => {
                      handleAdvancedFilterChange("topics", "values", [])
                      setTopicsSearch("")
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
                    </svg>
                    Reset
                  </button>
                  <button className="topics-modal-done5" onClick={() => setIsTopicsModalOpen(false)}>
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>


      {(filteredCards || []).length > 0 && (
        <div className="results-info5">
          <ShinyText text={`Showing ${startIndex + 1}-${Math.min(endIndex, (filteredCards || []).length)} of ${(filteredCards || []).length} results`} disabled={false} speed={3} className="custom-class" />
        </div>
      )}

    <div className="topicholder5">
      {currentCards.length > 0 ? (
        currentCards.map((card, index) => (
          <Card
            key={card.id || startIndex + index}
            {...card}
            onClick={() => onCardClick(card.id)}
          />
        ))
      ) : (
        <p className="no-results5">No matching cards found.</p>
      )}
    </div>

      {(filteredCards || []).length > cardsPerPage && (
        <div className="pagination-container5">
          <button className="pagination-btn5 pagination-nav5" onClick={handlePrevPage} disabled={currentPage === 1} title="Previous page"><ChevronLeft size={16} /> Previous</button>
          <div className="pagination-numbers5">
            {getPaginationRange()[0] > 1 && (
              <>
                <button className="pagination-btn5 pagination-number5" onClick={() => handlePageChange(1)}>1</button>

                {getPaginationRange()[0] > 2 && <span className="pagination-ellipsis">...</span>}
              </>
            )}
            {getPaginationRange().map((page) => (

              <button key={page} className={`pagination-btn5 pagination-number5 ${currentPage === page ? "active" : ""}`} onClick={() => handlePageChange(page)}>{page}</button>
            ))}
            {getPaginationRange()[getPaginationRange().length - 1] < totalPages && (
              <>
                {getPaginationRange()[getPaginationRange().length - 1] < totalPages - 1 && <span className="pagination-ellipsis">...</span>}
                <button className="pagination-btn5 pagination-number5" onClick={() => handlePageChange(totalPages)}>{totalPages}</button>
              </>
            )}
          </div>
          <button className="pagination-btn5 pagination-nav5" onClick={handleNextPage} disabled={currentPage === totalPages} title="Next page">Next <ChevronRight size={16} /></button>

        </div>
      )}
    </div>
  )
}
