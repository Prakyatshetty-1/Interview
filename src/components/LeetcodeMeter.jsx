import React, { useState, useEffect } from 'react';

const LeetcodeMeter = () => {
  const [animatedSolved, setAnimatedSolved] = useState(0);
  const [animatedAttempting, setAnimatedAttempting] = useState(0);
  
  const stats = {
    total: 3632,
    attempting: 6,
    easy: { solved: 67, total: 886 },
    medium: { solved: 0, total: 1889 },
    hard: { solved: 10, total: 857 },
    
  };// ider bhi same ye format me data store kar tere database me aur har ek user ke liye data alag rahega then baki sub working hai 
  const solved = stats.easy.solved + stats.medium.solved + stats.hard.solved;
  const solvedPercentage = (solved / stats.total) * 100;
  const radius = 85;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (solvedPercentage / 100) * circumference;

  useEffect(() => {
    const timer1 = setTimeout(() => {
      const interval1 = setInterval(() => {
        setAnimatedSolved(prev => {
          if (prev < solved) return prev + 2;
          clearInterval(interval1);
          return solved;
        });
      }, 10);
    }, 200);

    const timer2 = setTimeout(() => {
      setAnimatedAttempting(stats.attempting);
    }, 600);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <div style={{
     
    }}>
      <div style={{
        
        backdropFilter: 'blur(20px)',
        borderRadius: '1.5rem',
        padding: '1rem',
        width:'380px',
        marginLeft:'10px',
       backgroundColor:'rgba(36, 36, 56, 0.8)',
        marginTop:'20px'
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
              textAlign:'center'

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
            <div style={{
              backgroundColor: 'rgba(26, 26, 46, 0.6)',
              backdropFilter: 'blur(10px)',
              borderRadius: '1rem',
              padding: '0.5rem 1rem',
              border: '1px solid rgba(34, 197, 94, 0.2)',
              minWidth: '8rem',
              transition: 'all 0.3s ease',
              marginLeft:'-40px'
              
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexDirection:'column'
              }}>
                <span style={{
                  fontWeight: '600',
                  color: '#4ade80',
                  fontSize:'0.8rem'
                }}>Easy</span>
                <div style={{ textAlign: 'right',display: 'flex',marginTop:'10px'}}>
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
            
            <div style={{
              backgroundColor: 'rgba(26, 26, 46, 0.6)',
              backdropFilter: 'blur(10px)',
              borderRadius: '1rem',
              padding: '0.5rem 1rem',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              minWidth: '8rem',
              transition: 'all 0.3s ease',
              marginLeft:'-40px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexDirection:'column'
              }}>
                <span style={{
                  fontWeight: '600',
                  color: '#fbbf24',
                  fontSize:'0.8rem'
                }}>Med.</span>
                <div style={{textAlign: 'right',display: 'flex',marginTop:'10px' }}>
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
            
            <div style={{
              backgroundColor: 'rgba(26, 26, 46, 0.6)',
              backdropFilter: 'blur(10px)',
              borderRadius: '1rem',
               padding: '0.5rem 1rem',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              minWidth: '8rem',
              transition: 'all 0.3s ease',
              marginLeft:'-40px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexDirection:'column'
              }}>
                <span style={{
                  fontWeight: '600',
                  color: '#f87171',
                  fontSize:'0.8rem'
                }}>Hard</span>
                <div style={{ textAlign: 'right',display: 'flex',marginTop:'10px' }}>
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
