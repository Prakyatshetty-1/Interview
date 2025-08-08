
import './ProfileCard.css';
import { useNavigate } from 'react-router-dom';

function ProfileCard (props) {
    const navigate=useNavigate();

    function handleClick(){
        navigate('/Profile')

    }
    return (
        <div className="profile-card">
            <div className="card-content">
                <div className="card-header">
                    <div className="gradient-bars">
                        {Array.from({ length: 20 }, (_, i) => (
                            <div key={i} className="bar" style={{ animationDelay: `${i * 0.1}s` }}></div>
                        ))}
                        <div className="profile-image">
                    <img src="/profilepic1.png?height=60&width=60" alt="Lia Hartwell" />
                    </div>
                    </div>
                  
                </div>
                
                <div className="user-info">
                    <div className="name-section">
                        <h2 className="name">{props.profile.name}</h2>
                        <div className="verified-badge">✓</div>
                        <div className="status">
                            <div className="status-dot"></div>
                            <span>Online</span>
                        </div>
                    </div>
                    <p className="title">Middle Graphic Designer</p>
                </div>

                <div className="stats">
                    <div className="stat">
                        <div className="stat-value">4.9</div>
                        <div className="stat-label">rating</div>
                    </div>
                    <div className="stat">
                        <div className="stat-value">$12K</div>
                        <div className="stat-label">earned</div>
                    </div>
                    <div className="stat">
                        <div className="stat-value">$35/hr</div>
                        <div className="stat-label">rate</div>
                    </div>
                </div>

                <button className="contact-button" onClick={handleClick}>View Profile</button>
            </div>
        </div>
    );
};

export default ProfileCard;