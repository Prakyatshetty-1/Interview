import LeetcodeMeter from '../components/LeetcodeMeter'
import './QuestionFolder.css'
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Dock from "../react-bits/Dock";

export default function QuestionFolder() {
    const location = useLocation();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Get topic from navigation state
    const { topic, count } = location.state || { topic: "Unknown Topic", count: 0 };

    // Fetch interviews for the selected topic
    useEffect(() => {
        const fetchInterviews = async () => {
            if (!topic || topic === "Unknown Topic") {
                setError("No topic selected");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                console.log('Fetching interviews for topic:', topic);
                
                const response = await fetch(`http://localhost:5000/api/interviews/by-tag/${encodeURIComponent(topic)}`);
                console.log('Response status:', response.status);
                
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Server response:', errorText);
                    throw new Error(`Server Error ${response.status}: ${errorText}`);
                }
                
                const data = await response.json();
                console.log('Received data:', data);
                setInterviews(data);
                setError(null);
            } catch (err) {
                console.error('Error fetching interviews:', err);
                setError(`Failed to fetch interviews: ${err.message}`);
                setInterviews([]);
            } finally {
                setLoading(false);
            }
        };

        fetchInterviews();
    }, [topic]);

    // Static questions for the LeetCode meter (keep existing logic)
    const questions = [
        { number: 17, title: "Letter Combinations of a Phone Number", acceptance: 64.2, difficulty: "Med.", solved: true },
        { number: 22, title: "Generate Parentheses", acceptance: 77.4, difficulty: "Med.", solved: true },
        { number: 37, title: "Sudoku Solver", acceptance: 64.1, difficulty: "Hard", solved: true },
        { number: 39, title: "Combination Sum", acceptance: 75.1, difficulty: "Med.", solved: true },
        { number: 40, title: "Combination Sum II", acceptance: 58.0, difficulty: "Med.", solved: true },
        { number: 46, title: "Permutations", acceptance: 80.9, difficulty: "Med.", solved: true },
        { number: 47, title: "Permutations II", acceptance: 61.9, difficulty: "Med.", solved: true },
        { number: 51, title: "N-Queens", acceptance: 73.5, difficulty: "Hard", solved: true },
        { number: 52, title: "N-Queens II", acceptance: 77.1, difficulty: "Hard", solved: true },
        { number: 77, title: "Combinations", acceptance: 73.2, difficulty: "Med.", solved: true },
        { number: 78, title: "Subsets", acceptance: 81.2, difficulty: "Med.", solved: true },
        { number: 79, title: "Word Search", acceptance: 45.7, difficulty: "Med.", solved: true },
        { number: 89, title: "Gray Code", acceptance: 62.3, difficulty: "Med.", solved: true },
    ];

    // Filter interviews based on search term
    const filteredInterviews = interviews.filter(interview =>
        interview.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        interview.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        interview.difficulty.toLowerCase().includes(searchTerm.toLowerCase()) ||
        interview.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const getDifficultyColor = (difficulty) => {
        switch (difficulty?.toLowerCase()) {
            case 'easy': return '#00b894';
            case 'medium': return '#fdcb6e';
            case 'hard': return '#e17055';
            default: return '#74b9ff';
        }
    };

    const handleInterviewClick = (interviewId) => {
        navigate(`/interview/${interviewId}`);
    };

    const items = [
        {
            icon: <img src="/homeicon.png" alt="Home" style={{ width: '48px', height: '48px' }} />,
            label: "Home",
            onClick: () => navigate('/dashboard'),
        },
        {
            icon: <img src="/interviewicon.png" alt="Interviews" style={{ width: '48px', height: '48px' }} />,
            label: "Interviews",
            onClick: () => navigate('/Interview'),
        },
        {
            icon: <img src="/createicon.png" alt="Create" style={{ width: '48px', height: '48px' }} />,
            label: "Create",
            onClick: () => navigate('/Create'),
        },
        {
            icon: <img src="/favicon.png" alt="Saves" style={{ width: '48px', height: '48px' }} />,
            label: "Saves",
            onClick: () => navigate('/Saves'),
        },
        {
            icon: <img src="/profileicon.png" alt="Profile" style={{ width: '48px', height: '48px' }} />,
            label: "Profile",
            onClick: () => navigate('/Profile'),
        },
        {
            icon: <img src="/ViewProfile.png" alt="Settings" style={{ width: '48px', height: '48px' }} />,
            label: "Explore",
            onClick: () => navigate('/ViewProfile'),
        },
    ];

    return (
        <main className="page">
            <div className="dashboard-bg-orbs">
                <div className="dashboard-orb dashboard-orb1"></div>
                <div className="dashboard-orb dashboard-orb2"></div>
                <div className="dashboard-orb dashboard-orb3"></div>
                <div className="dashboard-orb dashboard-orb4"></div>
                <div className="dashboard-orb dashboard-orb5"></div>
            </div>
            <div className="containerques">
                <div className="logo-containernew">
                    <span className="logonew">Askora</span>
                </div>

                <section className="grid">
                    <div className="cardques">
                        <div className="topicIcon1">🎓</div>
                        <div className="header-content1">
                            <h2 className="topic-title1">{topic}</h2>
                            <p className="topic-subtitle1">Askora · {interviews.length} interviews · {count} questions</p>
                        </div>
                        <button className="bookmarkBtn">
                            <span className="IconContainer">
                                <svg viewBox="0 0 384 512" height="0.9em" className="icon">
                                    <path
                                        d="M0 48V487.7C0 501.1 10.9 512 24.3 512c5 0 9.9-1.5 14-4.4L192 400 345.7 507.6c4.1 2.9 9 4.4 14 4.4c13.4 0 24.3-10.9 24.3-24.3V48c0-26.5-21.5-48-48-48H48C21.5 0 0 21.5 0 48z"
                                    ></path>
                                </svg>
                            </span>
                            <p className="text">Save</p>
                        </button>
                        <div className="neon-line-basic"></div>

                        <h1 className='progsss'>Progress</h1>
                        <LeetcodeMeter />
                    </div>

                    <div className="questions-section">
                        <div className="questions-header">
                            <div className="search-container">
                                <div className="search-wrapper">
                                    <div className="search-icon">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search interviews by title, category, or difficulty"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="search-input"
                                    />
                                </div>
                            </div>
                            <div className="questions-stats">
                                <span className="solved-count">{filteredInterviews.length} Interviews Found</span>
                                {searchTerm && (
                                    <span className="search-results-count">
                                        {filteredInterviews.length} of {interviews.length} interviews
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="questions-list">
                            {loading ? (
                                <div className="loading-state">
                                    <p>Loading interviews...</p>
                                </div>
                            ) : error ? (
                                <div className="error-state">
                                    <p>{error}</p>
                                </div>
                            ) : filteredInterviews.length > 0 ? (
                                filteredInterviews.map((interview) => (
                                    <div 
                                        className="question-item interview-card" 
                                        key={interview._id}
                                        onClick={() => handleInterviewClick(interview._id)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <div className="question-left">
                                            <span className="interview-title">{interview.title}</span>
                                            <span className="interview-category">{interview.category}</span>
                                            <div className="interview-tags">
                                                {interview.tags.slice(0, 3).map((tag, index) => (
                                                    <span key={index} className="tag-badge">{tag}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="question-right">
                                            <span className="question-count">{interview.questions.length} questions</span>
                                            <span
                                                className="difficulty-badge"
                                                style={{ color: getDifficultyColor(interview.difficulty) }}
                                            >
                                                {interview.difficulty}
                                            </span>
                                            <span className="interview-duration">{interview.duration || 30}min</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="no-results">
                                    <p>No interviews found for "{topic}" {searchTerm && `matching "${searchTerm}"`}</p>
                                    <p>Try a different search term or check back later for new interviews.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </div>
            <Dock
                items={items}
                panelHeight={78}
                baseItemSize={60}
                magnification={80}
            />
        </main>
    )
}