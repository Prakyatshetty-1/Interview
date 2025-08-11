import LeetcodeMeter from '../components/LeetcodeMeter'
import './QuestionFloder.css'
import cardDataJson from "../data/CardData.json"
import { useLocation } from "react-router-dom";
import { useState, useEffect } from 'react';

export default function QuestionFolder() {
    const location = useLocation();
    const [filterData, setFilterData] = useState([]);

    useEffect(() => {
        if (location.state?.topic) {
            const topicLower = location.state.topic.toLowerCase();

            const filtered = cardDataJson.filter(card =>
                card.tags.some(tag => tag.toLowerCase() === topicLower) ||
                card.company?.toLowerCase() === topicLower
            );

            setFilterData(filtered);
        } else {
            setFilterData(cardDataJson); // If no topic, show all
        }
    }, [location.state?.topic]);
    console.log(filterData);
    const questions = filterData

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'Easy': return '#00b894';
            case 'Med.': return '#fdcb6e';
            case 'Hard': return '#e17055';
            default: return '#74b9ff';
        }
    };

    return (
        <main className="page">
            <div className="container">
                <header className="header">
                    <div className="topicIcon" aria-hidden="true">🎓</div>
                    <div>
                        <h1 className="title">{location.state.topic}</h1>
                        <p className="subtitle">LeetCode · 108 questions · 2367 Saved</p>
                    </div>
                </header>

                <section className="grid">
                    <div className="card">
                        {/* <img src="/Adobe.png?height=60&width=60" alt="Icon" /> */}
                        <div className="topicIcon1" >🎓</div>
                        <div className="header-content1">
                            <h2 className="topic-title1">{location.state.topic}</h2>
                            <p className="topic-subtitle1">LeetCode · 108 questions · 2367 Saved</p>
                        </div>
                        <LeetcodeMeter />
                    </div>

                    <div className="questions-section">
                        <div className="questions-header">
                            <h3 className="questions-title">Questions ({questions.length})</h3>
                            <div className="questions-stats">
                                <span className="solved-count">{questions.filter(q => q.solved).length} Solved</span>
                            </div>
                        </div>

                        <div className="questions-list">
                            {questions.map((q,index) => (
                                <div className="question-item" key={index}>
                                    <div className="question-left">
                                        <span className="question-number">{q.number}</span>
                                        <span className="question-title">{q.title}</span>
                                    </div>
                                    <div className="question-right">
                                        <span className="acceptance-rate">{q.acceptance}%</span>
                                        <span
                                            className="difficulty-badge"
                                            style={{ backgroundColor: getDifficultyColor(q.difficulty) }}
                                        >
                                            {q.difficulty}
                                        </span>
                                        {q.solved && <span className="solved-check">✓</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </main>
    )
}
