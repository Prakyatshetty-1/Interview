// ProfileCard.jsx
import styles from './ProfileCard.module.css';
import { useNavigate } from 'react-router-dom';

function ProfileCard(props) {
    const navigate = useNavigate();

    function handleClick() {
        navigate('/Profile');
    }

    // Helper function to truncate text with ellipsis
    const truncateText = (text, maxLength) => {
        if (!text) return "";
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength).trim() + "...";
    };

    // Helper function to display skills (limit to 3 visible with character limit)
    const displaySkills = (skills) => {
        if (!skills || skills.length === 0) return "Skills to be added";
        
        let skillsText;
        if (skills.length <= 3) {
            skillsText = skills.join(", ");
        } else {
            skillsText = skills.slice(0, 3).join(", ") + ` +${skills.length - 3} more`;
        }
        
        // Limit skills text to 45 characters
        return truncateText(skillsText, 30);
    };

    // Helper function to get current role display with character limit
    const getCurrentRoleDisplay = (profile) => {
        let roleText;
        if (profile.currentRole && profile.currentCompany) {
            roleText = `${profile.currentRole} at ${profile.currentCompany}`;
        } else if (profile.currentRole && !profile.currentCompany) {
            roleText = profile.currentRole;
        } else if (!profile.currentRole && profile.currentCompany) {
            roleText = `Working at ${profile.currentCompany}`;
        } else {
            roleText = "Open to opportunities";
        }
        
        // Limit role text to 40 characters
        return truncateText(roleText, 30);
    };

    // Helper function to get experience display
    const getExperienceDisplay = (yearsExperience) => {
        if (!yearsExperience || yearsExperience === 0) {
            return "Entry level";
        }
        return `${yearsExperience} years experience`;
    };

    // Helper function to get previous company display with character limit
    const getPreviousCompanyDisplay = (previousCompany) => {
        if (!previousCompany) return '\u00A0'; // Non-breaking space to maintain height
        const text = `Previously: ${previousCompany}`;
        return truncateText(text, 30);
    };

    const profile = props.profile || {};

    return (
        <div className={styles.profileCard}>
            <div className={styles.cardContent}>
                <div className={styles.cardHeader}>
                    <div className={styles.gradientBars}>
                       
                        <div className={styles.profileImage}>
                            <img 
                                src={profile.profileImage || "/profilepic1.png?height=60&width=60"} 
                                alt={profile.name || "User"} 
                            />
                        </div>
                    </div>
                </div>

                <div className={styles.userInfo}>
                    <div className={styles.nameSection}>
                        <h2 className={styles.name}>
                            {truncateText(profile.name || "Anonymous User", 20)}
                        </h2>
                        {profile.verified && (
                            <div className={styles.verifiedBadge}>
                                ✓
                            </div>
                        )}
                        {profile.isOnline && (
                            <div className={styles.status}>
                                <div className={styles.statusDot}></div>
                                <span>online</span>
                            </div>
                        )}
                    </div>
                    
                    <p className={styles.title}>
                        {getCurrentRoleDisplay(profile)}
                    </p>

                    <div className={styles.workHistory}>
                        <div className={styles.previousWork}>
                            {getPreviousCompanyDisplay(profile.previousCompany)}
                        </div>
                        
                        <p className={styles.education}>
                            {truncateText(profile.education || "Education details to be added", 35)}
                        </p>
                        
                        <p className={styles.experience}>
                            {getExperienceDisplay(profile.yearsExperience)}
                        </p>
                        
                        <p className={styles.skills}>
                            {displaySkills(profile.skills)}
                        </p>
                    </div>
                </div>

                {/* Stats section - only show if we have meaningful data */}
                {(profile.connections || profile.posts || profile.followers) && (
                    <div className={styles.stats}>
                        {profile.connections && (
                            <div className={styles.stat}>
                                <div className={styles.statValue}>{profile.connections}</div>
                                <div className={styles.statLabel}>connections</div>
                            </div>
                        )}
                        {profile.posts && (
                            <div className={styles.stat}>
                                <div className={styles.statValue}>{profile.posts}</div>
                                <div className={styles.statLabel}>posts</div>
                            </div>
                        )}
                        {profile.followers && (
                            <div className={styles.stat}>
                                <div className={styles.statValue}>{profile.followers}</div>
                                <div className={styles.statLabel}>followers</div>
                            </div>
                        )}
                    </div>
                )}

                <button className={styles.contactButton} onClick={handleClick}>
                    View Profile
                </button>
            </div>
        </div>
    );
}

export default ProfileCard;