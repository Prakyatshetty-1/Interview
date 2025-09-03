import LeetcodeMeter from '../components/LeetcodeMeter'
import styles from './Questionfolder.module.css' // Import CSS module
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
                
                const response = await fetch(`${import.meta.env.VITE_API_BASE}/api/interviews/by-tag/${encodeURIComponent(topic)}`);
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
    
    const getDifficultyClass = (difficulty) => {
        switch (difficulty?.toLowerCase()) {
            case 'easy':
                return styles.difficultyEasy1;
            case 'medium':
                return styles.difficultyMedium1;  
            case 'hard':
                return styles.difficultyHard1;
            default:
                return styles.difficultyDefault1;
        }
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
        <main className={styles.page}>
            <div className="dashboard-bg-orbs">
                <div className="dashboard-orb dashboard-orb1"></div>
                <div className="dashboard-orb dashboard-orb2"></div>
                <div className="dashboard-orb dashboard-orb3"></div>
                <div className="dashboard-orb dashboard-orb4"></div>
                <div className="dashboard-orb dashboard-orb5"></div>
            </div>
            <div className={styles.containerques}>
                <div className="logo-containernew">
                    <span className="logonew">Askora</span>
                </div>

                <section className={styles.grid}>
                    <div className={styles.cardques}>
                        <div className={styles.topicIcon1}>🎓</div>
                        <div className={styles.headerContent1}>
                            <h2 className={styles.topicTitle1}>{topic}</h2>
                            <p className={styles.topicSubtitle1}>Askora  ------------ {interviews.length} interviews</p>
                        </div>
                        
                        <div className={styles.neonLineBasic}></div>

                        <h1 className={styles.progsss}>Progress</h1>
                        <LeetcodeMeter />
                    </div>

                    <div className={styles.questionsSection}>
                        <div className={styles.questionsHeader}>
                            <div className={styles.searchContainer}>
                                <div className={styles.searchWrapper}>
                                    <div className={styles.searchIcon}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search interviews by title, category, or difficulty"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className={styles.searchInput}
                                    />
                                </div>
                            </div>
                            <div className={styles.questionsStats}>
                                <span className={styles.solvedCount}>{filteredInterviews.length} Interviews Found</span>
                                {searchTerm && (
                                    <span className={styles.searchResultsCount}>
                                        {filteredInterviews.length} of {interviews.length} interviews
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className={styles.questionsList}>
                            {loading ? (
                                <div className={styles.loadingState}>
                                    <p>Loading interviews...</p>
                                </div>
                            ) : error ? (
                                <div className={styles.errorState}>
                                    <p>{error}</p>
                                </div>
                            ) : filteredInterviews.length > 0 ? (
                                filteredInterviews.map((interview) => (
                                    <div 
                                        className={`${styles.interviewCard}`}
                                        key={interview._id}
                                        onClick={() => handleInterviewClick(interview._id)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <div className={styles.questionLeft}>
                                            <div className={styles.theinterviewtitlebox}>
                                            <span className={styles.interviewTitle}>{interview.title}</span>
                                            <span className={styles.interviewCategory}>{interview.category}</span>
                                            </div>
                                            <div className={styles.interviewTags}>
                                                {interview.tags.slice(0, 3).map((tag, index) => (
                                                    <span key={index} className={styles.tagBadge}>{tag}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className={styles.questionRight}>
                                            
                                            <span className={`${styles.difficultyBadge1} ${getDifficultyClass(interview.difficulty)}`}>
                                                {interview.difficulty}
                                            </span>
                                           
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className={styles.noResults}>
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