// src/components/ProfileCard.jsx
import styles from './ProfileCard.module.css';
import { useNavigate } from 'react-router-dom';

function ProfileCard(props) {
  const navigate = useNavigate();
  const profile = props.profile || {};

  // Navigation behavior
  function handleClick() {
    const id = profile._id || profile.id;
    if (id) {
      navigate(`/profile/${id}`);
    } else {
      navigate('/Profile');
    }
  }

  // Utility: truncate text
  const truncateText = (text, maxLength) => {
    if (!text && text !== 0) return "";
    const s = String(text);
    if (s.length <= maxLength) return s;
    return s.substring(0, maxLength).trim() + "...";
  };

  // Determine company & role display using common field names
  const companyField = profile.company || profile.currentCompany || profile.previousCompany || "";
  const roleField = profile.currentRole || profile.role || profile.field || ""; // 'field' may come from preferences

  const getCurrentRoleDisplay = () => {
    if (roleField && companyField) return `${roleField} at ${companyField}`;
    if (roleField) return roleField;
    if (companyField) return `Working at ${companyField}`;
    // fallback to a short aboutText summary if available
    if (profile.aboutText) return truncateText(profile.aboutText, 30);
    return "Open to opportunities";
  };

  // Experience display: try explicit yearsExperience, otherwise derive from stats (interviews/practice hours)
  const getExperienceDisplay = () => {
    if (profile.yearsExperience && Number(profile.yearsExperience) > 0) {
      return `${profile.yearsExperience} years experience`;
    }
    const interviews = profile.stats?.totalInterviews ?? profile.stats?.mockInterviews ?? 0;
    const practiceHours = profile.stats?.totalPracticeHours ?? 0;
    if (practiceHours && practiceHours > 0) {
      return `${practiceHours} hrs practice`;
    }
    if (interviews && interviews > 0) {
      return `${interviews} interviews`;
    }
    return "Entry level";
  };

  // Skills / topics to display (limit to 3 items and short length)
  const displaySkills = () => {
    const arr = profile.favoriteTopics || profile.technicalSkills || profile.skills || profile.interests || [];
    if (!Array.isArray(arr) || arr.length === 0) return "Skills to be added";
    const visible = arr.slice(0, 3).join(", ");
    const extra = arr.length > 3 ? ` +${arr.length - 3} more` : "";
    return truncateText(visible + extra, 40);
  };

  // Education display
  const educationDisplay = () => {
    const ed = profile.education || profile.college || profile.school || "";
    if (ed && ed.trim().length > 0) return truncateText(ed, 40);
    return "Education details to be added";
  };

  // Previous / current company short
  const getPreviousCompanyDisplay = () => {
    const prev = profile.previousCompany || profile.company || "";
    if (!prev) return "\u00A0";
    return truncateText(`Previously: ${prev}`, 30);
  };

  const nameDisplay = () => {
    return truncateText(profile.name || profile.fullName || profile.username || "Anonymous User", 22);
  };

  // Profile picture fallback
  const avatar = profile.profilePicture || profile.profileImage || "/profilepic1.png?height=60&width=60";

  return (
    <div className={styles.profileCard}>
      <div className={styles.cardContent}>
        <div className={styles.cardHeader}>
         
            <div className={styles.profileImage}>
              <img src={avatar} alt={profile.name || "User"} />
            </div>
          
        </div>

        <div className={styles.userInfo}>
          <div className={styles.nameSection}>
            <h2 className={styles.name}>{nameDisplay()}</h2>

            {profile.verified && (
              <div className={styles.verifiedBadge}>✓</div>
            )}

            {profile.isOnline && (
              <div className={styles.status}>
                <div className={styles.statusDot}></div>
                <span>online</span>
              </div>
            )}
          </div>

          <p className={styles.title}>{truncateText(getCurrentRoleDisplay(), 36)}</p>

          <div className={styles.workHistory}>
            <div className={styles.previousWork}>
              {getPreviousCompanyDisplay()}
            </div>

            <p className={styles.education}>{educationDisplay()}</p>

            <p className={styles.experience}>{getExperienceDisplay()}</p>

            <p className={styles.skills}>{displaySkills()}</p>
          </div>
        </div>

        <button className={styles.contactButton} onClick={handleClick}>
          View Profile
        </button>
      </div>
    </div>
  );
}

export default ProfileCard;
