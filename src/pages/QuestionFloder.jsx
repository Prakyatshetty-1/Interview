import LeetcodeMeter from '../components/LeetcodeMeter'
import './QuestionFloder.css'

export default function QuestionFolder() {
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
                        <h1 className="title">Backtracking</h1>
                        <p className="subtitle">LeetCode · 108 questions · 2367 Saved</p>
                    </div>
                </header>

                <section className="grid">
                    <div className="card">
                            {/* <img src="/Adobe.png?height=60&width=60" alt="Icon" /> */}
                            <div className="topicIcon1" >🎓</div>
                            <div className="header-content1">
                                <h2 className="topic-title1">Backtracking</h2>
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
                            {questions.map((q) => (
                                <div className="question-item" key={q.number}>
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
