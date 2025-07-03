"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Card from "./Card"
import "./SearchBar.css"
import { BiSort } from "react-icons/bi"
import { FaFilter } from "react-icons/fa"
import ShinyText from "../react-bits/ShinyText"
import cardDataJson from "../data/CardData.json"

export default function SearchBar() {
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
  const [matchType, setMatchType] = useState("All") // "All" or "Any"

  // CHANGE 1: Updated advanced filter form state - changed topics to use array instead of single value
  const [advancedFilters, setAdvancedFilters] = useState({
    status: { condition: "is", value: "" },
    difficulty: { condition: "is", value: "" },
    topics: { condition: "is", values: [] }, // Changed from 'value' to 'values' array
    language: { condition: "is", value: "" },
  })

  const filterRef = useRef(null)
  const advancedFilterRef = useRef(null)
  const cardsPerPage = 25

  // Character limits configuration
  const TITLE_CHAR_LIMIT = 20
  const TAG_CHAR_LIMIT = 10

  // Close dropdown when clicking outside
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
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Helper function to truncate text
  const truncateText = (text, limit) => {
    if (text.length <= limit) return text
    return text.substring(0, limit) + "..."
  }

  // Helper function to truncate tags
  const truncateTags = (tags) => {
    return tags.map((tag) => truncateText(tag, TAG_CHAR_LIMIT))
  }

  useEffect(() => {
    setCardData(cardDataJson)
  }, [])

  const processedCardData = useMemo(() => {
    return cardData.map((card) => ({
      ...card,
      title: truncateText(card.title, TITLE_CHAR_LIMIT),
      tags: truncateTags(card.tags),
      originalTitle: card.title,
      originalTags: card.tags,
    }))
  }, [cardData])

  const allTopics = useMemo(() => {
    const topics = new Set()
    cardData.forEach((card) => {
      card.tags.forEach((tag) => topics.add(tag))
    })
    return Array.from(topics).sort()
  }, [cardData])

  // CHANGE 2: Added filtered topics based on search functionality
  const filteredTopics = useMemo(() => {
    if (!topicsSearch.trim()) return allTopics
    return allTopics.filter((topic) => topic.toLowerCase().includes(topicsSearch.toLowerCase()))
  }, [allTopics, topicsSearch])

  const allStatuses = ["Solved", "Unsolved", "Attempted"]
  const allLanguages = ["JavaScript", "Python", "Java", "C++", "Dart", "Go", "Rust"]

  const filteredCards = useMemo(() => {
    let filtered = processedCardData

    // Apply search term filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (card) =>
          card.originalTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
          card.originalTags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    // Apply filters based on match type
    if (matchType === "All") {
      // All filters must match
      if (selectedDifficulties.length > 0) {
        filtered = filtered.filter((card) => selectedDifficulties.includes(card.difficulty))
      }
      if (selectedTopics.length > 0) {
        filtered = filtered.filter((card) => selectedTopics.some((topic) => card.originalTags.includes(topic)))
      }
      if (selectedStatus.length > 0) {
        filtered = filtered.filter((card) => selectedStatus.includes(card.status))
      }
      if (selectedLanguages.length > 0) {
        filtered = filtered.filter((card) => selectedLanguages.includes(card.language))
      }
    } else {
      // Any filter can match
      filtered = filtered.filter((card) => {
        const matchesDifficulty = selectedDifficulties.length === 0 || selectedDifficulties.includes(card.difficulty)
        const matchesTopics =
          selectedTopics.length === 0 || selectedTopics.some((topic) => card.originalTags.includes(topic))
        const matchesStatus = selectedStatus.length === 0 || selectedStatus.includes(card.status)
        const matchesLanguage = selectedLanguages.length === 0 || selectedLanguages.includes(card.language)

        return matchesDifficulty || matchesTopics || matchesStatus || matchesLanguage
      })
    }

    // Apply sorting
    if (selectedFilter === "Easy to Hard") {
      filtered = [...filtered].sort((a, b) => {
        const getDifficultyOrder = (difficulty) => {
          switch (difficulty.toLowerCase()) {
            case "easy":
              return 1
            case "med.":
              return 2
            case "hard":
              return 3
            default:
              return 2
          }
        }
        return getDifficultyOrder(a.difficulty) - getDifficultyOrder(b.difficulty)
      })
    } else if (selectedFilter === "Hard to Easy") {
      filtered = [...filtered].sort((a, b) => {
        const getDifficultyOrder = (difficulty) => {
          switch (difficulty.toLowerCase()) {
            case "easy":
              return 1
            case "med.":
              return 2
            case "hard":
              return 3
            default:
              return 2
          }
        }
        return getDifficultyOrder(b.difficulty) - getDifficultyOrder(a.difficulty)
      })
    } else {
      filtered = [...filtered].sort((a, b) => {
        const aVal = a.originalTitle.toLowerCase()
        const bVal = b.originalTitle.toLowerCase()
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
  ])

  // Calculate pagination
  const totalPages = Math.ceil(filteredCards.length / cardsPerPage)
  const startIndex = (currentPage - 1) * cardsPerPage
  const endIndex = startIndex + cardsPerPage
  const currentCards = filteredCards.slice(startIndex, endIndex)

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedDifficulties, selectedTopics, selectedStatus, selectedLanguages, selectedFilter])

  // Calculate pagination range
  const getPaginationRange = () => {
    const maxPagesToShow = 5
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2))
    const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1)
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1)
    }
    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i)
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1))
  }

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
  }

  const handleFilterSelect = (filterValue, displayName) => {
    setSelectedFilter(displayName)
    setIsFilterOpen(false)
  }

  const handleAdvancedFilterToggle = () => {
    setIsAdvancedFilterOpen(!isAdvancedFilterOpen)
  }

  // Handle advanced filter changes
  const handleAdvancedFilterChange = (filterType, field, value) => {
    setAdvancedFilters((prev) => ({
      ...prev,
      [filterType]: {
        ...prev[filterType],
        [field]: value,
      },
    }))
  }

  // CHANGE 3: Added new function to handle topic chip selection/deselection
  const handleTopicChipToggle = (topic) => {
    setAdvancedFilters((prev) => ({
      ...prev,
      topics: {
        ...prev.topics,
        values: prev.topics.values.includes(topic)
          ? prev.topics.values.filter((t) => t !== topic)
          : [...prev.topics.values, topic],
      },
    }))
  }

  // CHANGE 4: Updated save function to handle topics array instead of single value
  const handleSaveAsSmartList = () => {
    // Reset existing filters
    setSelectedDifficulties([])
    setSelectedTopics([])
    setSelectedStatus([])
    setSelectedLanguages([])

    // Apply filters based on advanced filter selections
    const newDifficulties = []
    const newTopics = []
    const newStatuses = []
    const newLanguages = []

    // Process each advanced filter
    Object.entries(advancedFilters).forEach(([filterType, filterData]) => {
      if (filterType === "topics") {
        // CHANGE 4a: Special handling for topics array
        if (filterData.values && filterData.values.length > 0) {
          const shouldInclude = filterData.condition === "is"
          if (shouldInclude) {
            newTopics.push(...filterData.values)
          }
        }
      } else if (filterData.value) {
        const shouldInclude = filterData.condition === "is"

        switch (filterType) {
          case "difficulty":
            if (shouldInclude) {
              newDifficulties.push(filterData.value)
            }
            break
          case "status":
            if (shouldInclude) {
              newStatuses.push(filterData.value)
            }
            break
          case "language":
            if (shouldInclude) {
              newLanguages.push(filterData.value)
            }
            break
        }
      }
    })

    // Update the main filter states
    setSelectedDifficulties(newDifficulties)
    setSelectedTopics(newTopics)
    setSelectedStatus(newStatuses)
    setSelectedLanguages(newLanguages)

    // Close the advanced filter dropdown
    setIsAdvancedFilterOpen(false)

    console.log("Smart list saved with filters:", {
      difficulties: newDifficulties,
      topics: newTopics,
      statuses: newStatuses,
      languages: newLanguages,
      matchType,
    })
  }

  // CHANGE 5: Updated reset function to handle topics array
  const handleResetFilters = () => {
    setSelectedDifficulties([])
    setSelectedTopics([])
    setSelectedStatus([])
    setSelectedLanguages([])
    setTopicsSearch("")
    setMatchType("All")
    setAdvancedFilters({
      status: { condition: "is", value: "" },
      difficulty: { condition: "is", value: "" },
      topics: { condition: "is", values: [] }, // Reset to empty array
      language: { condition: "is", value: "" },
    })
  }

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
          {/* Simple Filter Button */}
          <div className="custom-filter-dropdown5" ref={filterRef}>
            <button className="filter-icon-btn5" onClick={() => setIsFilterOpen(!isFilterOpen)}>
              <BiSort style={{ width: "32px", height: "32px" }} />
            </button>
            {isFilterOpen && (
              <div className="filter-dropdown-menu5">
                <div
                  className={`filter-dropdown-item5 ${selectedFilter === "All" ? "selected" : ""}`}
                  onClick={() => handleFilterSelect("all", "All")}
                >
                  <span>All</span>
                  <svg
                    className={`tick-mark5 ${selectedFilter === "All" ? "" : "hidden"}`}
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                </div>
                <div
                  className={`filter-dropdown-item5 ${selectedFilter === "Easy to Hard" ? "selected" : ""}`}
                  onClick={() => handleFilterSelect("easy-to-hard", "Easy to Hard")}
                >
                  <span>Easy to Hard</span>
                  <svg
                    className={`tick-mark5 ${selectedFilter === "Easy to Hard" ? "" : "hidden"}`}
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                </div>
                <div
                  className={`filter-dropdown-item5 ${selectedFilter === "Hard to Easy" ? "selected" : ""}`}
                  onClick={() => handleFilterSelect("hard-to-easy", "Hard to Easy")}
                >
                  <span>Hard to Easy</span>
                  <svg
                    className={`tick-mark5 ${selectedFilter === "Hard to Easy" ? "" : "hidden"}`}
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                </div>
                <div
                  className={`filter-dropdown-item5 ${selectedFilter === "Popular Questions" ? "selected" : ""}`}
                  onClick={() => handleFilterSelect("popular", "Popular Questions")}
                >
                  <span>Popular Questions</span>
                  <svg
                    className={`tick-mark5 ${selectedFilter === "Popular Questions" ? "" : "hidden"}`}
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                </div>
              </div>
            )}
          </div>

          {/* Advanced Filter Button */}
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

                {/* CHANGE 6: Completely replaced Topics Filter section with Chip Interface */}
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
                    {/* CHANGE 6a: Added topics chip container with search and chips */}
                    <div className="topics-chip-container5">
                      {/* Topics Search */}
                      <div className="topics-search-wrapper5">
                        <svg className="topics-search-icon5" viewBox="0 0 20 20" fill="currentColor">
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
                          className="topics-search-input5"
                        />
                      </div>

                      {/* Topics Chips */}
                      <div className="topics-chips-grid5">
                        {filteredTopics.map((topic) => (
                          <button
                            key={topic}
                            className={`topic-chip5 ${advancedFilters.topics.values.includes(topic) ? "selected" : ""}`}
                            onClick={() => handleTopicChipToggle(topic)}
                          >
                            {topic}
                            {/* CHANGE 6b: Added count indicator for selected chips */}
                            {advancedFilters.topics.values.includes(topic) && (
                              <span className="topic-chip-count5">
                                +{advancedFilters.topics.values.filter((t) => t === topic).length}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                    {/* CHANGE 6c: Updated remove button to clear topics array */}
                    <button
                      className="remove-filter5"
                      onClick={() => handleAdvancedFilterChange("topics", "values", [])}
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
          </div>
        </div>
      </div>

      {/* Results info */}
      {filteredCards.length > 0 && (
        <div className="results-info5">
          <ShinyText
            text={`Showing ${startIndex + 1}-${Math.min(endIndex, filteredCards.length)} of ${filteredCards.length} results`}
            disabled={false}
            speed={3}
            className="custom-class"
          />
        </div>
      )}

      {/* Card grid */}
      <div className="topicholder5">
        {currentCards.length > 0 ? (
          currentCards.map((card, index) => <Card key={startIndex + index} {...card} />)
        ) : (
          <p className="no-results5">No matching cards found.</p>
        )}
      </div>

      {/* Pagination */}
      {filteredCards.length > cardsPerPage && (
        <div className="pagination-container5">
          <button
            className="pagination-btn5 pagination-nav5"
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            title="Previous page"
          >
            <ChevronLeft size={16} />
            Previous
          </button>
          <div className="pagination-numbers5">
            {getPaginationRange()[0] > 1 && (
              <>
                <button className="pagination-btn5 pagination-number5" onClick={() => handlePageChange(1)}>
                  1
                </button>
                {getPaginationRange()[0] > 2 && <span className="pagination-ellipsis">...</span>}
              </>
            )}
            {getPaginationRange().map((page) => (
              <button
                key={page}
                className={`pagination-btn5 pagination-number5 ${currentPage === page ? "active" : ""}`}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </button>
            ))}
            {getPaginationRange()[getPaginationRange().length - 1] < totalPages && (
              <>
                {getPaginationRange()[getPaginationRange().length - 1] < totalPages - 1 && (
                  <span className="pagination-ellipsis">...</span>
                )}
                <button className="pagination-btn5 pagination-number5" onClick={() => handlePageChange(totalPages)}>
                  {totalPages}
                </button>
              </>
            )}
          </div>
          <button
            className="pagination-btn5 pagination-nav5"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            title="Next page"
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  )
}
