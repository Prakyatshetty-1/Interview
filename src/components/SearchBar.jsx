"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react"
import Card from "./Card"
import "./SearchBar.css"
import { BiSort } from "react-icons/bi";
import { FaFilter } from "react-icons/fa";
import ShinyText from '../react-bits/ShinyText';

export default function SearchBar() {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortOrder, setSortOrder] = useState("desc")
  const [sortBy, setSortBy] = useState("count")
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
      creator: "Rohan",
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

  

  // Get all unique topics from card data
   const processedCardData = useMemo(() => {
    return cardData.map((card) => ({
      ...card,
      title: truncateText(card.title, TITLE_CHAR_LIMIT),
      tags: truncateTags(card.tags),
      originalTitle: card.title,
      originalTags: card.tags,
    }))
  }, [])

  // Get all unique topics, statuses, and languages
  const allTopics = useMemo(() => {
    const topics = new Set()
    cardData.forEach((card) => {
      card.tags.forEach((tag) => topics.add(tag))
    })
    return Array.from(topics).sort()
  }, [])

  const allStatuses = ["Solved", "Unsolved", "Attempted"]
  const allLanguages = ["JavaScript", "Python", "Java", "C++", "Dart", "Go", "Rust"]

  // Filter topics based on search
  const filteredTopics = useMemo(() => {
    if (!topicsSearch.trim()) return allTopics
    return allTopics.filter((topic) => topic.toLowerCase().includes(topicsSearch.toLowerCase()))
  }, [allTopics, topicsSearch])

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
        const matchesTopics = selectedTopics.length === 0 || selectedTopics.some((topic) => card.originalTags.includes(topic))
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
            case "easy": return 1
            case "med.": return 2
            case "hard": return 3
            default: return 2
          }
        }
        return getDifficultyOrder(a.difficulty) - getDifficultyOrder(b.difficulty)
      })
    } else if (selectedFilter === "Hard to Easy") {
      filtered = [...filtered].sort((a, b) => {
        const getDifficultyOrder = (difficulty) => {
          switch (difficulty.toLowerCase()) {
            case "easy": return 1
            case "med.": return 2
            case "hard": return 3
            default: return 2
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
  }, [searchTerm, selectedDifficulties, selectedTopics, selectedStatus, selectedLanguages, selectedFilter, sortOrder, processedCardData, matchType])

  // Calculate pagination
  const totalPages = Math.ceil(filteredCards.length / cardsPerPage)
  const startIndex = (currentPage - 1) * cardsPerPage
  const endIndex = startIndex + cardsPerPage
  const currentCards = filteredCards.slice(startIndex, endIndex)

  // Reset to first page when filters change
  useMemo(() => {
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

  const handleDifficultyToggle = (difficulty) => {
    setSelectedDifficulties((prev) =>
      prev.includes(difficulty) ? prev.filter((d) => d !== difficulty) : [...prev, difficulty],
    )
  }

  const handleTopicToggle = (topic) => {
    setSelectedTopics((prev) => (prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]))
  }

  const handleStatusToggle = (status) => {
    setSelectedStatus((prev) => (prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]))
  }

  const handleLanguageToggle = (language) => {
    setSelectedLanguages((prev) => (prev.includes(language) ? prev.filter((l) => l !== language) : [...prev, language]))
  }

  const handleAdvancedFilterToggle = () => {
    setIsAdvancedFilterOpen(!isAdvancedFilterOpen)
  }

  const handleResetFilters = () => {
    setSelectedDifficulties([])
    setSelectedTopics([])
    setSelectedStatus([])
    setSelectedLanguages([])
    setTopicsSearch("")
    setMatchType("All")
  }

  const handleSaveAsSmartList = () => {
    // Implement save functionality
    console.log("Saving as smart list...")
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
              <BiSort style={{ width: '32px', height: '32px' }}/>
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
              <FaFilter style={{ width: '16px', height: '16px' }}/>
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
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    </div>
                    <span className="filter-label5">Status</span>
                    <select className="filter-condition5" defaultValue="is">
                      <option value="is">is</option>
                      <option value="is not">is not</option>
                    </select>
                    <select className="filter-value5" defaultValue="">
                      <option value="">Select status...</option>
                      {allStatuses.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                    <button className="remove-filter5">—</button>
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
                    <select className="filter-condition5" defaultValue="is">
                      <option value="is">is</option>
                      <option value="is not">is not</option>
                    </select>
                    <select className="filter-value5" defaultValue="">
                      <option value="">Select difficulty...</option>
                      <option value="Easy">Easy</option>
                      <option value="Med.">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                    <button className="remove-filter5">—</button>
                  </div>
                </div>

                {/* Topics Filter */}
                <div className="filter-group5">
                  <div className="filter-group-header5">
                    <div className="filter-icon5">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.63 5.84C17.27 5.33 16.67 5 16 5L5 5.01C3.9 5.01 3 5.9 3 7v10c0 1.1.9 2 2 2h11c.67 0 1.27-.33 1.63-.84L22 12l-4.37-6.16z" />
                      </svg>
                    </div>
                    <span className="filter-label5">Topics</span>
                    <select className="filter-condition5" defaultValue="is">
                      <option value="is">is</option>
                      <option value="is not">is not</option>
                    </select>
                    <select className="filter-value5" defaultValue="">
                      <option value="">Select topic...</option>
                      {allTopics.map((topic) => (
                        <option key={topic} value={topic}>{topic}</option>
                      ))}
                    </select>
                    <button className="remove-filter5">—</button>
                  </div>
                </div>

                {/* Language Filter */}
                <div className="filter-group5">
                  <div className="filter-group-header5">
                    <div className="filter-icon5">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/>
                      </svg>
                    </div>
                    <span className="filter-label5">Language</span>
                    <select className="filter-condition5" defaultValue="is">
                      <option value="is">is</option>
                      <option value="is not">is not</option>
                    </select>
                    <select className="filter-value5" defaultValue="">
                      <option value="">Select language...</option>
                      {allLanguages.map((language) => (
                        <option key={language} value={language}>{language}</option>
                      ))}
                    </select>
                    <button className="remove-filter5">—</button>
                  </div>
                </div>

                

                {/* Footer */}
                <div className="advanced-filter-footer5">
                  <button className="save-smart-list-btn5" onClick={handleSaveAsSmartList}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/>
                    </svg>
                    Save as Smart List
                  </button>
                  <button className="reset-btn5" onClick={handleResetFilters}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
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
            className='custom-class' 
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