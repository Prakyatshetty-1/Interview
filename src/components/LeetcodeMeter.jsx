import React, { useState, useEffect } from 'react';

const LeetcodeMeter = () => {
  const [animatedSolved, setAnimatedSolved] = useState(0);
  const [animatedAttempting, setAnimatedAttempting] = useState(0);
  const [stats, setStats] = useState({
    total: 3632,
    attempting: 0,
    easy: { solved: 0, total: 886 },
    medium: { solved: 0, total: 1889 },
    hard: { solved: 0, total: 857 }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch user's LeetCode stats
  const fetchLeetCodeStats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to view your LeetCode stats');
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:5000/api/leetcode/stats', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.leetcodeStats);
      } else if (response.status === 401) {
        setError('Please log in again');
        // Optionally redirect to login
      } else {
        setError('Failed to fetch LeetCode stats');
      }
    } catch (error) {
      console.error('Error fetching LeetCode stats:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Function to update LeetCode stats
  const updateLeetCodeStats = async (newStats) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:5000/api/leetcode/stats', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ leetcodeStats: newStats })
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.leetcodeStats);
      }
    } catch (error) {
      console.error('Error updating LeetCode stats:', error);
    }
  };

  useEffect(() => {
    fetchLeetCodeStats();
  }, []);

  const solved = stats.easy.solved + stats.medium.solved + stats.hard.solved;
  const solvedPercentage = (solved / stats.total) * 100;

  const radius = 85;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (solvedPercentage / 100) * circumference;

  useEffect(() => {
    if (!loading) {
      const timer1 = setTimeout(() => {
        const interval1 = setInterval(() => {
          setAnimatedSolved(prev => {
            if (prev < solved) return prev + Math.ceil(solved / 50);
            clearInterval(interval1);
            return solved;
          });
        }, 20);
      }, 200);

      const timer2 = setTimeout(() => {
        setAnimatedAttempting(stats.attempting);
      }, 600);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [loading, solved, stats.attempting]);

  // Demo function to simulate solving a problem (for testing)
  const handleSolveProblem = (difficulty) => {
    const newStats = { ...stats };
    newStats[difficulty].solved += 1;
    updateLeetCodeStats(newStats);
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '300px',
        color: 'white'
      }}>
        Loading LeetCode stats...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '300px',
        color: '#f87171',
        backgroundColor: 'rgba(36, 36, 56, 0.8)',
        borderRadius: '1.5rem',
        padding: '2rem',
        margin: '20px 10px'
      }}>
        <div style={{ marginBottom: '1rem' }}>❌ {error}</div>
        <button 
          onClick={fetchLeetCodeStats}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#8b5cf6',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <div style={{
        backdropFilter: 'blur(20px)',
        borderRadius: '1.5rem',
        padding: '1rem',
        width: '380px',
        marginLeft: '10px',
        backgroundColor: 'rgba(36, 36, 56, 0.8)',
        marginTop: '20px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '3rem'
        }}>
          {/* Circular Progress */}
          <div style={{ position: 'relative' }}>
            <svg width="200" height="200" style={{ transform: 'rotate(-90deg)' }}>
              {/* Background circle */}
              <circle
                cx="100"
                cy="100"
                r={radius}
                fill="none"
                stroke="rgba(55, 65, 81, 0.3)"
                strokeWidth="8"
              />
              
              {/* Progress circle */}
              <circle
                cx="100"
                cy="100"
                r={radius}
                fill="none"
                stroke="url(#themeGradient)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                style={{
                  transition: 'stroke-dashoffset 2s ease-out',
                  filter: 'drop-shadow(0 0 8px rgba(139, 92, 246, 0.4))'
                }}
              />
              
              {/* Theme gradient */}
              <defs>
                <linearGradient id="themeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#22d3ee" />
                  <stop offset="25%" stopColor="#3b82f6" />
                  <stop offset="50%" stopColor="#8b5cf6" />
                  <stop offset="75%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#d946ef" />
                </linearGradient>
              </defs>
            </svg>
            
            {/* Center Text */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{
                fontSize: '3rem',
                fontWeight: 'bold',
                color: 'white',
                marginBottom: '0.25rem'
              }}>{animatedSolved}</div>
              <div style={{
                color: '#d1d5db',
                fontSize: '1.125rem'
              }}>Solved</div>
              <div style={{
                color: '#6b7280',
                fontSize: '0.875rem'
              }}>/{stats.total}</div>
            </div>
            
            {/* Attempting badge */}
            <div style={{
              position: 'absolute',
              bottom: '-1.5rem',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: 'rgba(26, 26, 46, 0.9)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              backdropFilter: 'blur(10px)',
              padding: '0.5rem 1rem',
              borderRadius: '24px',
              textAlign: 'center'
            }}>
              <span style={{
                color: '#c4b5fd',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}>
                {animatedAttempting} Attempting
              </span>
            </div>
          </div>

          {/* Stats Cards */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            {/* Easy Card */}
            <div 
              style={{
                backgroundColor: 'rgba(26, 26, 46, 0.6)',
                backdropFilter: 'blur(10px)',
                borderRadius: '1rem',
                padding: '0.5rem 1rem',
                border: '1px solid rgba(34, 197, 94, 0.2)',
                minWidth: '8rem',
                transition: 'all 0.3s ease',
                marginLeft: '-40px',
                cursor: 'pointer'
              }}
              onClick={() => handleSolveProblem('easy')}
              title="Click to add a solved easy problem"
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexDirection: 'column'
              }}>
                <span style={{
                  fontWeight: '600',
                  color: '#4ade80',
                  fontSize: '0.8rem'
                }}>Easy</span>
                <div style={{ textAlign: 'right', display: 'flex', marginTop: '10px' }}>
                  <div style={{
                    color: 'white',
                    fontSize: '1rem',
                    fontWeight: 'bold'
                  }}>{stats.easy.solved}</div>
                  <div style={{
                    color: '#9ca3af',
                    fontSize: '0.875rem'
                  }}>/{stats.easy.total}</div>
                </div>
              </div>
            </div>
            
            {/* Medium Card */}
            <div 
              style={{
                backgroundColor: 'rgba(26, 26, 46, 0.6)',
                backdropFilter: 'blur(10px)',
                borderRadius: '1rem',
                padding: '0.5rem 1rem',
                border: '1px solid rgba(245, 158, 11, 0.2)',
                minWidth: '8rem',
                transition: 'all 0.3s ease',
                marginLeft: '-40px',
                cursor: 'pointer'
              }}
              onClick={() => handleSolveProblem('medium')}
              title="Click to add a solved medium problem"
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexDirection: 'column'
              }}>
                <span style={{
                  fontWeight: '600',
                  color: '#fbbf24',
                  fontSize: '0.8rem'
                }}>Med.</span>
                <div style={{ textAlign: 'right', display: 'flex', marginTop: '10px' }}>
                  <div style={{
                    color: 'white',
                    fontSize: '1rem',
                    fontWeight: 'bold'
                  }}>{stats.medium.solved}</div>
                  <div style={{
                    color: '#9ca3af',
                    fontSize: '0.875rem'
                  }}>/{stats.medium.total}</div>
                </div>
              </div>
            </div>
            
            {/* Hard Card */}
            <div 
              style={{
                backgroundColor: 'rgba(26, 26, 46, 0.6)',
                backdropFilter: 'blur(10px)',
                borderRadius: '1rem',
                padding: '0.5rem 1rem',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                minWidth: '8rem',
                transition: 'all 0.3s ease',
                marginLeft: '-40px',
                cursor: 'pointer'
              }}
              onClick={() => handleSolveProblem('hard')}
              title="Click to add a solved hard problem"
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexDirection: 'column'
              }}>
                <span style={{
                  fontWeight: '600',
                  color: '#f87171',
                  fontSize: '0.8rem'
                }}>Hard</span>
                <div style={{ textAlign: 'right', display: 'flex', marginTop: '10px' }}>
                  <div style={{
                    color: 'white',
                    fontSize: '1rem',
                    fontWeight: 'bold'
                  }}>{stats.hard.solved}</div>
                  <div style={{
                    color: '#9ca3af',
                    fontSize: '0.875rem'
                  }}>/{stats.hard.total}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeetcodeMeter;