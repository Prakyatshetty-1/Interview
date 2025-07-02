"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import { MdFilterAlt, MdFilterAltOff } from "react-icons/md"
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react"
import Card from "./Card"
import "./SearchBar.css"

export default function SearchBar() {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortOrder, setSortOrder] = useState("desc")
  const [sortBy, setSortBy] = useState("count")
  const [currentPage, setCurrentPage] = useState(1)
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [difficultySort, setDifficultySort] = useState("none")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState("All")
  const filterRef = useRef(null)
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

  const cardData = [
    {
      difficulty: "Easy",
      title: "React Component Basics",
      creator: "Arjun",
      tags: ["Front End", "React"],
      path: "/FrontEndDev.png",
    },
    {
      difficulty: "Med.",
      title: "API Development Challenge",
      creator: "Priya",
      tags: ["Back End", "Node.js"],
      path: "/BackEndDev.png",
    },
    {
      difficulty: "Hard",
      title: "Complete Web Application",
      creator: "Rahul",
      tags: ["Full Stack", "MERN"],
      path: "/FullStackWebDev.png",
    },
    {
      difficulty: "Med.",
      title: "Cross-Platform Desktop App",
      creator: "Sneha",
      tags: ["Desktop Dev", "Electron"],
      path: "/DesktopDev.png",
    },
    {
      difficulty: "Easy",
      title: "Mobile UI Components",
      creator: "Vikram",
      tags: ["Mobile Dev", "Flutter"],
      path: "/MobileDev.png",
    },
    {
      difficulty: "Hard",
      title: "Neural Network Implementation",
      creator: "Ananya",
      tags: ["ML Engineer", "Deep Learning"],
      path: "/MLEngineering.png",
    },
    {
      difficulty: "Med.",
      title: "Data Analysis Project",
      creator: "Karthik",
      tags: ["Data Scientist", "Python"],
      path: "/DataScientist.png",
    },
    {
      difficulty: "Med.",
      title: "ETL Pipeline Design",
      creator: "Meera",
      tags: ["Data Engineer", "Apache Spark"],
      path: "/DataEngineer.png",
    },
    {
      difficulty: "Hard",
      title: "Research Paper Implementation",
      creator: "Rohan",
      tags: ["AI Researcher", "PyTorch"],
      path: "/AIResearch.png",
    },
    {
      difficulty: "Med.",
      title: "CI/CD Pipeline Setup",
      creator: "Divya",
      tags: ["DevOps Engineer", "Docker"],
      path: "/DevOpsEngineer.png",
    },
    {
      difficulty: "Easy",
      title: "CSS Animation Workshop",
      creator: "Amit",
      tags: ["Front End", "CSS"],
      path: "/FrontEndDev.png",
    },
    {
      difficulty: "Hard",
      title: "Microservices Architecture",
      creator: "Nidhi",
      tags: ["Back End", "Kubernetes"],
      path: "/BackEndDev.png",
    },
    {
      difficulty: "Med.",
      title: "E-commerce Platform",
      creator: "Suresh",
      tags: ["Full Stack", "Vue.js"],
      path: "/FullStackWebDev.png",
    },
    {
      difficulty: "Easy",
      title: "Desktop Calculator App",
      creator: "Pooja",
      tags: ["Desktop Dev", "Python"],
      path: "/DesktopDev.png",
    },
    {
      difficulty: "Med.",
      title: "Native Mobile App",
      creator: "Ajay",
      tags: ["Mobile Dev", "React Native"],
      path: "/MobileDev.png",
    },
    {
      difficulty: "Hard",
      title: "Computer Vision Model",
      creator: "Shruti",
      tags: ["ML Engineer", "OpenCV"],
      path: "/MLEngineering.png",
    },
    {
      difficulty: "Easy",
      title: "Statistical Analysis",
      creator: "Manoj",
      tags: ["Data Scientist", "R"],
      path: "/DataScientist.png",
    },
    {
      difficulty: "Med.",
      title: "Real-time Data Processing",
      creator: "Kavya",
      tags: ["Data Engineer", "Kafka"],
      path: "/DataEngineer.png",
    },
    {
      difficulty: "Hard",
      title: "Transformer Architecture Study",
      creator: "Arun",
      tags: ["AI Researcher", "Transformers"],
      path: "/AIResearch.png",
    },
    {
      difficulty: "Med.",
      title: "Infrastructure Monitoring",
      creator: "Ravi",
      tags: ["Site Reliability Engineer", "Prometheus"],
      path: "/SiteReliabilityEngineer.png",
    },
    {
      difficulty: "Easy",
      title: "JavaScript DOM Manipulation",
      creator: "Lakshmi",
      tags: ["Front End", "JavaScript"],
      path: "/FrontEndDev.png",
    },
    {
      difficulty: "Med.",
      title: "GraphQL API Design",
      creator: "Sanjay",
      tags: ["Back End", "GraphQL"],
      path: "/BackEndDev.png",
    },
    {
      difficulty: "Hard",
      title: "Social Media Platform",
      creator: "Deepika",
      tags: ["Full Stack", "Next.js"],
      path: "/FullStackWebDev.png",
    },
    {
      difficulty: "Med.",
      title: "File Management System",
      creator: "Varun",
      tags: ["Desktop Dev", "C#"],
      path: "/DesktopDev.png",
    },
    {
      difficulty: "Easy",
      title: "Mobile Weather App",
      creator: "Sunita",
      tags: ["Mobile Dev", "Swift"],
      path: "/MobileDev.png",
    },
    {
      difficulty: "Hard",
      title: "Recommendation System",
      creator: "Prakash",
      tags: ["ML Engineer", "Scikit-learn"],
      path: "/MLEngineering.png",
    },
    {
      difficulty: "Med.",
      title: "Business Intelligence Dashboard",
      creator: "Rashmi",
      tags: ["Data Scientist", "Tableau"],
      path: "/DataScientist.png",
    },
    {
      difficulty: "Med.",
      title: "Data Warehouse Design",
      creator: "Gopal",
      tags: ["Data Engineer", "Snowflake"],
      path: "/DataEngineer.png",
    },
    {
      difficulty: "Hard",
      title: "Reinforcement Learning Agent",
      creator: "Kriti",
      tags: ["AI Researcher", "Gym"],
      path: "/AIResearch.png",
    },
    {
      difficulty: "Easy",
      title: "AWS EC2 Setup",
      creator: "Nitin",
      tags: ["Cloud Engineer", "AWS"],
      path: "/CloudEngineering.png",
    },
    {
      difficulty: "Med.",
      title: "Responsive Web Design",
      creator: "Jyoti",
      tags: ["Front End", "Bootstrap"],
      path: "/FrontEndDev.png",
    },
    {
      difficulty: "Hard",
      title: "Distributed Database System",
      creator: "Harsh",
      tags: ["Back End", "MongoDB"],
      path: "/BackEndDev.png",
    },
    {
      difficulty: "Med.",
      title: "Project Management Tool",
      creator: "Swati",
      tags: ["Full Stack", "Angular"],
      path: "/FullStackWebDev.png",
    },
    {
      difficulty: "Easy",
      title: "Text Editor Application",
      creator: "Rohit",
      tags: ["Desktop Dev", "Java"],
      path: "/DesktopDev.png",
    },
    {
      difficulty: "Med.",
      title: "Fitness Tracking App",
      creator: "Neha",
      tags: ["Mobile Dev", "Kotlin"],
      path: "/MobileDev.png",
    },
    {
      difficulty: "Hard",
      title: "Natural Language Processing",
      creator: "Sandeep",
      tags: ["ML Engineer", "NLTK"],
      path: "/MLEngineering.png",
    },
    {
      difficulty: "Easy",
      title: "Data Visualization Basics",
      creator: "Usha",
      tags: ["Data Scientist", "Matplotlib"],
      path: "/DataScientist.png",
    },
    {
      difficulty: "Med.",
      title: "Stream Processing Pipeline",
      creator: "Vinod",
      tags: ["Data Engineer", "Flink"],
      path: "/DataEngineer.png",
    },
    {
      difficulty: "Hard",
      title: "Generative AI Model",
      creator: "Ishita",
      tags: ["AI Researcher", "GANs"],
      path: "/AIResearch.png",
    },
    {
      difficulty: "Med.",
      title: "Security Vulnerability Assessment",
      creator: "Rajesh",
      tags: ["Security Engineer", "Penetration Testing"],
      path: "/SecurityEngineering.png",
    },
    {
      difficulty: "Easy",
      title: "HTML5 Semantics",
      creator: "Lata",
      tags: ["Front End", "HTML5"],
      path: "/FrontEndDev.png",
    },
    {
      difficulty: "Med.",
      title: "RESTful API Security",
      creator: "Mukesh",
      tags: ["Back End", "JWT"],
      path: "/BackEndDev.png",
    },
    {
      difficulty: "Hard",
      title: "Real-time Chat Application",
      creator: "Gayatri",
      tags: ["Full Stack", "Socket.io"],
      path: "/FullStackWebDev.png",
    },
    {
      difficulty: "Med.",
      title: "Game Development Framework",
      creator: "Vishal",
      tags: ["Desktop Dev", "Unity"],
      path: "/DesktopDev.png",
    },
    {
      difficulty: "Easy",
      title: "Mobile Photo Gallery",
      creator: "Archana",
      tags: ["Mobile Dev", "Xamarin"],
      path: "/MobileDev.png",
    },
    {
      difficulty: "Hard",
      title: "Time Series Forecasting",
      creator: "Kishore",
      tags: ["ML Engineer", "LSTM"],
      path: "/MLEngineering.png",
    },
    {
      difficulty: "Med.",
      title: "A/B Testing Analysis",
      creator: "Priyanka",
      tags: ["Data Scientist", "Hypothesis Testing"],
      path: "/DataScientist.png",
    },
    {
      difficulty: "Med.",
      title: "Data Lake Architecture",
      creator: "Satish",
      tags: ["Data Engineer", "Hadoop"],
      path: "/DataEngineer.png",
    },
    {
      difficulty: "Hard",
      title: "Multi-Agent System",
      creator: "Madhuri",
      tags: ["AI Researcher", "Multi-Agent"],
      path: "/AIResearch.png",
    },
    {
      difficulty: "Easy",
      title: "Load Balancer Configuration",
      creator: "Ashok",
      tags: ["Site Reliability Engineer", "Nginx"],
      path: "/SiteReliabilityEngineer.png",
    },
    {
      difficulty: "Med.",
      title: "Progressive Web App",
      creator: "Chitra",
      tags: ["Front End", "PWA"],
      path: "/FrontEndDev.png",
    },
    {
      difficulty: "Hard",
      title: "Event-Driven Architecture",
      creator: "Deepak",
      tags: ["Back End", "Event Sourcing"],
      path: "/BackEndDev.png",
    },
    {
      difficulty: "Med.",
      title: "Learning Management System",
      creator: "Vidya",
      tags: ["Full Stack", "Django"],
      path: "/FullStackWebDev.png",
    },
    {
      difficulty: "Easy",
      title: "Simple Database GUI",
      creator: "Mohan",
      tags: ["Desktop Dev", "Tkinter"],
      path: "/DesktopDev.png",
    },
    {
      difficulty: "Med.",
      title: "Augmented Reality App",
      creator: "Shilpa",
      tags: ["Mobile Dev", "ARKit"],
      path: "/MobileDev.png",
    },
    {
      difficulty: "Hard",
      title: "Object Detection System",
      creator: "Naveen",
      tags: ["ML Engineer", "YOLO"],
      path: "/MLEngineering.png",
    },
    {
      difficulty: "Easy",
      title: "Exploratory Data Analysis",
      creator: "Radha",
      tags: ["Data Scientist", "Pandas"],
      path: "/DataScientist.png",
    },
    {
      difficulty: "Med.",
      title: "Change Data Capture",
      creator: "Sunil",
      tags: ["Data Engineer", "Debezium"],
      path: "/DataEngineer.png",
    },
    {
      difficulty: "Hard",
      title: "Neural Architecture Search",
      creator: "Smita",
      tags: ["AI Researcher", "AutoML"],
      path: "/AIResearch.png",
    },
    {
      difficulty: "Med.",
      title: "Container Orchestration",
      creator: "Raju",
      tags: ["DevOps Engineer", "Kubernetes"],
      path: "/DevOpsEngineer.png",
    },
    {
      difficulty: "Easy",
      title: "Form Validation Library",
      creator: "Kavita",
      tags: ["Front End", "Validation"],
      path: "/FrontEndDev.png",
    },
    {
      difficulty: "Med.",
      title: "Message Queue Implementation",
      creator: "Anil",
      tags: ["Back End", "RabbitMQ"],
      path: "/BackEndDev.png",
    },
    {
      difficulty: "Hard",
      title: "Blockchain Application",
      creator: "Preeti",
      tags: ["Full Stack", "Web3"],
      path: "/FullStackWebDev.png",
    },
    {
      difficulty: "Med.",
      title: "3D Graphics Application",
      creator: "Yogesh",
      tags: ["Desktop Dev", "OpenGL"],
      path: "/DesktopDev.png",
    },
    {
      difficulty: "Easy",
      title: "Location-Based Service",
      creator: "Anusha",
      tags: ["Mobile Dev", "GPS"],
      path: "/MobileDev.png",
    },
    {
      difficulty: "Hard",
      title: "Anomaly Detection Model",
      creator: "Subash",
      tags: ["ML Engineer", "Isolation Forest"],
      path: "/MLEngineering.png",
    },
    {
      difficulty: "Med.",
      title: "Customer Segmentation",
      creator: "Rekha",
      tags: ["Data Scientist", "Clustering"],
      path: "/DataScientist.png",
    },
    {
      difficulty: "Med.",
      title: "Data Quality Framework",
      creator: "Pavan",
      tags: ["Data Engineer", "Great Expectations"],
      path: "/DataEngineer.png",
    },
    {
      difficulty: "Hard",
      title: "Federated Learning System",
      creator: "Nisha",
      tags: ["AI Researcher", "Federated Learning"],
      path: "/AIResearch.png",
    },
    {
      difficulty: "Easy",
      title: "Terraform Infrastructure",
      creator: "Kiran",
      tags: ["Cloud Engineer", "Terraform"],
      path: "/CloudEngineering.png",
    },
    {
      difficulty: "Med.",
      title: "Component Library",
      creator: "Geetha",
      tags: ["Front End", "Storybook"],
      path: "/FrontEndDev.png",
    },
    {
      difficulty: "Hard",
      title: "Scalable Web Service",
      creator: "Ramesh",
      tags: ["Back End", "Load Balancing"],
      path: "/BackEndDev.png",
    },
    {
      difficulty: "Med.",
      title: "Content Management System",
      creator: "Seema",
      tags: ["Full Stack", "Strapi"],
      path: "/FullStackWebDev.png",
    },
    {
      difficulty: "Easy",
      title: "Image Viewer Application",
      creator: "Ganesh",
      tags: ["Desktop Dev", "Qt"],
      path: "/DesktopDev.png",
    },
    {
      difficulty: "Med.",
      title: "Push Notification Service",
      creator: "Savita",
      tags: ["Mobile Dev", "Firebase"],
      path: "/MobileDev.png",
    },
    {
      difficulty: "Hard",
      title: "Speech Recognition System",
      creator: "Bala",
      tags: ["ML Engineer", "Speech Processing"],
      path: "/MLEngineering.png",
    },
    {
      difficulty: "Easy",
      title: "Statistical Modeling",
      creator: "Vandana",
      tags: ["Data Scientist", "Regression"],
      path: "/DataScientist.png",
    },
    {
      difficulty: "Med.",
      title: "Streaming Analytics",
      creator: "Mahesh",
      tags: ["Data Engineer", "Storm"],
      path: "/DataEngineer.png",
    },
    {
      difficulty: "Hard",
      title: "Quantum Computing Algorithm",
      creator: "Pallavi",
      tags: ["AI Researcher", "Quantum ML"],
      path: "/AIResearch.png",
    },
    {
      difficulty: "Med.",
      title: "Application Security Testing",
      creator: "Santosh",
      tags: ["Application Security Engineer", "SAST"],
      path: "/SecurityEngineering.png",
    },
    {
      difficulty: "Easy",
      title: "Accessibility Compliance",
      creator: "Mala",
      tags: ["Front End", "WCAG"],
      path: "/FrontEndDev.png",
    },
    {
      difficulty: "Med.",
      title: "Caching Strategy Implementation",
      creator: "Bharat",
      tags: ["Back End", "Redis"],
      path: "/BackEndDev.png",
    },
    {
      difficulty: "Hard",
      title: "Multi-tenant SaaS Platform",
      creator: "Indira",
      tags: ["Full Stack", "Multi-tenancy"],
      path: "/FullStackWebDev.png",
    },
    {
      difficulty: "Med.",
      title: "Cross-platform GUI Framework",
      creator: "Dilip",
      tags: ["Desktop Dev", "Flutter Desktop"],
      path: "/DesktopDev.png",
    },
    {
      difficulty: "Easy",
      title: "Offline-first Mobile App",
      creator: "Bharati",
      tags: ["Mobile Dev", "Offline Storage"],
      path: "/MobileDev.png",
    },
    {
      difficulty: "Hard",
      title: "AutoML Pipeline",
      creator: "Venkat",
      tags: ["ML Engineer", "Pipeline Automation"],
      path: "/MLEngineering.png",
    },
    {
      difficulty: "Med.",
      title: "Predictive Analytics Model",
      creator: "Shobha",
      tags: ["Data Scientist", "Forecasting"],
      path: "/DataScientist.png",
    },
    {
      difficulty: "Med.",
      title: "Data Mesh Architecture",
      creator: "Jagdish",
      tags: ["Data Engineer", "Data Mesh"],
      path: "/DataEngineer.png",
    },
    {
      difficulty: "Hard",
      title: "Explainable AI System",
      creator: "Sushma",
      tags: ["AI Researcher", "XAI"],
      path: "/AIResearch.png",
    },
    {
      difficulty: "Easy",
      title: "Service Mesh Setup",
      creator: "Naresh",
      tags: ["Site Reliability Engineer", "Istio"],
      path: "/SiteReliabilityEngineering.png",
    },
    {
      difficulty: "Med.",
      title: "Micro-frontend Architecture",
      creator: "Sanjana",
      tags: ["Front End", "Module Federation"],
      path: "/FrontEndDev.png",
    },
    {
      difficulty: "Hard",
      title: "Event Streaming Platform",
      creator: "Balaji",
      tags: ["Back End", "Apache Kafka"],
      path: "/BackEndDev.png",
    },
    {
      difficulty: "Med.",
      title: "Headless CMS Implementation",
      creator: "Padma",
      tags: ["Full Stack", "Headless CMS"],
      path: "/FullStackWebDev.png",
    },
    {
      difficulty: "Easy",
      title: "System Tray Application",
      creator: "Ramana",
      tags: ["Desktop Dev", "System Integration"],
      path: "/DesktopDev.png",
    },
    {
      difficulty: "Med.",
      title: "IoT Mobile Dashboard",
      creator: "Sunitha",
      tags: ["Mobile Dev", "IoT"],
      path: "/MobileDev.png",
    },
    {
      difficulty: "Hard",
      title: "Distributed ML Training",
      creator: "Chandrashekhar",
      tags: ["ML Engineer", "Distributed Computing"],
      path: "/MLEngineering.png",
    },
    {
      difficulty: "Easy",
      title: "Data Profiling Tool",
      creator: "Latha",
      tags: ["Data Scientist", "Data Profiling"],
      path: "/DataScientist.png",
    },
    {
      difficulty: "Med.",
      title: "Real-time ETL Pipeline",
      creator: "Srikanth",
      tags: ["Data Engineer", "Real-time Processing"],
      path: "/DataEngineer.png",
    },
    {
      difficulty: "Hard",
      title: "Neuromorphic Computing Model",
      creator: "Shweta",
      tags: ["AI Researcher", "Neuromorphic"],
      path: "/AIResearch.png",
    },
    {
      difficulty: "Med.",
      title: "Zero Trust Security Model",
      creator: "Praveen",
      tags: ["Security Engineer", "Zero Trust"],
      path: "/SecurityEngineering.png",
    },
    {
      difficulty: "Easy",
      title: "State Management Library",
      creator: "Anjali",
      tags: ["Front End", "State Management"],
      path: "/FrontEndDev.png",
    },
    {
      difficulty: "Med.",
      title: "Serverless API Gateway",
      creator: "Sudhir",
      tags: ["Cloud Engineer", "Serverless"],
      path: "/CloudEngineering.png",
    },
    {
      difficulty: "Hard",
      title: "Multi-modal AI System",
      creator: "Kavitha",
      tags: ["AI Researcher", "Multi-modal"],
      path: "/AIResearch.png",
    },
  ]

  // Process card data with character limits
  const processedCardData = useMemo(() => {
    return cardData.map((card) => ({
      ...card,
      title: truncateText(card.title, TITLE_CHAR_LIMIT),
      tags: truncateTags(card.tags),
      originalTitle: card.title, // Keep original for search purposes
      originalTags: card.tags, // Keep original for search purposes
    }))
  }, [])

  // Helper function to get difficulty order value
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

  const filteredCards = useMemo(() => {
    let filtered = processedCardData

    // Apply tag search if any (search on original tags)
    if (searchTerm.trim()) {
      filtered = filtered.filter((card) =>
        card.originalTags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    // Apply category filter (use original tags for filtering)
    if (categoryFilter === "frontend") {
      filtered = filtered.filter((card) => card.originalTags.some((tag) => tag.toLowerCase() === "front end"))
    } else if (categoryFilter === "backend") {
      filtered = filtered.filter((card) => card.originalTags.some((tag) => tag.toLowerCase() === "back end"))
    }

    // Apply difficulty sorting
    if (difficultySort === "easy-to-hard") {
      filtered = [...filtered].sort((a, b) => {
        return getDifficultyOrder(a.difficulty) - getDifficultyOrder(b.difficulty)
      })
    } else if (difficultySort === "hard-to-easy") {
      filtered = [...filtered].sort((a, b) => {
        return getDifficultyOrder(b.difficulty) - getDifficultyOrder(a.difficulty)
      })
    } else {
      // Apply original sorting by title if no difficulty sort is applied
      filtered = [...filtered].sort((a, b) => {
        const aVal = a.originalTitle.toLowerCase()
        const bVal = b.originalTitle.toLowerCase()
        return sortOrder === "asc" ? bVal.localeCompare(aVal) : aVal.localeCompare(bVal)
      })
    }

    return filtered
  }, [searchTerm, sortOrder, categoryFilter, difficultySort, processedCardData])

  // Calculate pagination
  const totalPages = Math.ceil(filteredCards.length / cardsPerPage)
  const startIndex = (currentPage - 1) * cardsPerPage
  const endIndex = startIndex + cardsPerPage
  const currentCards = filteredCards.slice(startIndex, endIndex)

  // Reset to first page when search changes
  useMemo(() => {
    setCurrentPage(1)
  }, [searchTerm])

  // Calculate pagination range (show 5 pages at a time)
  const getPaginationRange = () => {
    const maxPagesToShow = 5
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2))
    const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1)

    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1)
    }

    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i)
  }

  const handleSortToggle = () => {
    setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"))
  }

  const handleSortByToggle = () => {
    setSortBy((prev) => (prev === "count" ? "name" : "count"))
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

  const handleFilterSelect = (filterType, filterValue, displayName) => {
    if (filterType === "category") {
      setCategoryFilter(filterValue)
      setDifficultySort("none")
    } else if (filterType === "difficulty") {
      setDifficultySort(filterValue)
      setCategoryFilter("all")
    }
    setSelectedFilter(displayName)
    setIsFilterOpen(false)
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
          <div className="custom-filter-dropdown" ref={filterRef}>
            <button className="filter-dropdown-btn" onClick={() => setIsFilterOpen(!isFilterOpen)}>
              {selectedFilter}
              <ChevronDown className={`filter-dropdown-icon ${isFilterOpen ? "rotated" : ""}`} />
            </button>

            {isFilterOpen && (
              <div className="filter-dropdown-menu">
                <div className="filter-dropdown-item" onClick={() => handleFilterSelect("category", "all", "All")}>
                  All
                </div>
                <div
                  className="filter-dropdown-item"
                  onClick={() => handleFilterSelect("category", "frontend", "Frontend")}
                >
                  Frontend
                </div>
                <div
                  className="filter-dropdown-item"
                  onClick={() => handleFilterSelect("category", "backend", "Backend")}
                >
                  Backend
                </div>
                <div
                  className="filter-dropdown-item"
                  onClick={() => handleFilterSelect("difficulty", "easy-to-hard", "Easy to Hard")}
                >
                  Easy to Hard
                </div>
                <div
                  className="filter-dropdown-item"
                  onClick={() => handleFilterSelect("difficulty", "hard-to-easy", "Hard to Easy")}
                >
                  Hard to Easy
                </div>
              </div>
            )}
          </div>

          <button
            className="filter-btn5"
            onClick={handleSortToggle}
            title={`Sort ${sortOrder === "desc" ? "Ascending" : "Descending"}`}
          >
            {sortOrder === "desc" ? <MdFilterAlt /> : <MdFilterAltOff />}
          </button>
        </div>
      </div>

      {/* Results info */}
      {filteredCards.length > 0 && (
        <div className="results-info">
          <p className="results-text">
            Showing {startIndex + 1}-{Math.min(endIndex, filteredCards.length)} of {filteredCards.length} results
          </p>
        </div>
      )}

      {/* Card grid */}
      <div className="topicholder">
        {currentCards.length > 0 ? (
          currentCards.map((card, index) => <Card key={startIndex + index} {...card} />)
        ) : (
          <p className="no-results5">No matching cards found.</p>
        )}
      </div>

      {/* Pagination */}
      {filteredCards.length > cardsPerPage && (
        <div className="pagination-container">
          <button
            className="pagination-btn pagination-nav"
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            title="Previous page"
          >
            <ChevronLeft size={16} />
            Previous
          </button>

          <div className="pagination-numbers">
            {/* Show first page if not in current range */}
            {getPaginationRange()[0] > 1 && (
              <>
                <button className="pagination-btn pagination-number" onClick={() => handlePageChange(1)}>
                  1
                </button>
                {getPaginationRange()[0] > 2 && <span className="pagination-ellipsis">...</span>}
              </>
            )}

            {/* Show current range */}
            {getPaginationRange().map((page) => (
              <button
                key={page}
                className={`pagination-btn pagination-number ${currentPage === page ? "active" : ""}`}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </button>
            ))}

            {/* Show last page if not in current range */}
            {getPaginationRange()[getPaginationRange().length - 1] < totalPages && (
              <>
                {getPaginationRange()[getPaginationRange().length - 1] < totalPages - 1 && (
                  <span className="pagination-ellipsis">...</span>
                )}
                <button className="pagination-btn pagination-number" onClick={() => handlePageChange(totalPages)}>
                  {totalPages}
                </button>
              </>
            )}
          </div>

          <button
            className="pagination-btn pagination-nav"
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
