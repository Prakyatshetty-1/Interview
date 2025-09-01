import React, { useState, useEffect, useRef, useCallback } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

const LeetcodeMeter = ({ userId = null, isOwnProfile = false }) => {
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

  const timersRef = useRef({ intervals: [], timeouts: [] });

  // Helper to clear timers on unmount / re-fetch
  const clearTimers = () => {
    timersRef.current.intervals.forEach(i => clearInterval(i));
    timersRef.current.timeouts.forEach(t => clearTimeout(t));
    timersRef.current.intervals = [];
    timersRef.current.timeouts = [];
  };

  // Fetch stats (public if userId provided, else authed)
  const fetchLeetCodeStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    clearTimers();

    try {
      if (userId) {
        // public profile logic (unchanged)...
        let res = await fetch(`${API_BASE}/api/users/${userId}/leetcode-stats`);
        if (res.ok) {
          const json = await res.json();
          const incoming = json?.leetcodeStats ?? json;
          setStats(normalizeIncoming(incoming));
          setLoading(false);
          return;
        }
        res = await fetch(`${API_BASE}/api/users/${userId}`);
        if (res.ok) {
          const json = await res.json();
          const incoming = json?.leetcodeStats ?? json?.stats?.leetcodeStats ?? json?.stats ?? json;
          setStats(normalizeIncoming(incoming));
          setLoading(false);
          return;
        }
        setStats(prev => ({ ...prev, attempting: 0 }));
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to view your LeetCode stats');
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_BASE}/api/leetcode/stats`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      });

      if (!res.ok) {
        if (res.status === 401) setError('Please log in again');
        else setError('Failed to fetch LeetCode stats');
        setLoading(false);
        return;
      }

      const data = await res.json();
      const incoming = data?.leetcodeStats ?? data;
      setStats(normalizeIncoming(incoming));
    } catch (err) {
      console.error('Error fetching LeetCode stats:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [userId])

  // Normalize incoming shapes into our expected stats shape
  // inside your fetchLeetCodeStats / normalizeIncoming path (frontend)
  const normalizeIncoming = (incoming) => {
    if (!incoming) return stats;
    // if server returns { leetcodeStats: {...} }
    const data = incoming.leetcodeStats ?? incoming;
    return {
      total: typeof data.total === 'number' ? data.total : stats.total,
      attempting: typeof data.attempting === 'number' ? data.attempting : stats.attempting,
      easy: {
        solved: typeof data.easy?.solved === 'number' ? data.easy.solved : stats.easy.solved,
        total: typeof data.easy?.total === 'number' ? data.easy.total : stats.easy.total
      },
      medium: {
        solved: typeof data.medium?.solved === 'number' ? data.medium.solved : stats.medium.solved,
        total: typeof data.medium?.total === 'number' ? data.medium.total : stats.medium.total
      },
      hard: {
        solved: typeof data.hard?.solved === 'number' ? data.hard.solved : stats.hard.solved,
        total: typeof data.hard?.total === 'number' ? data.hard.total : stats.hard.total
      }
    };
  };


// send payload: { interviewId, questionIds } preferably; fallback: { difficulty, questionsCompleted }
const updateLeetCodeStats = async (payload = {}) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found, skipping LeetCode stats update');
      return;
    }

    // build body: prefer interviewId + questionIds
    const body = {};
    if (payload.interviewId) body.interviewId = payload.interviewId;
    if (Array.isArray(payload.questionIds) && payload.questionIds.length) body.questionIds = payload.questionIds;
    // fallback: keep old difficulty/questionsCompleted shape if that's all you have
    if (!body.interviewId && payload.difficulty) {
      body.difficulty = payload.difficulty;
      body.questionsCompleted = payload.questionsCompleted ?? 1;
    }

    const response = await fetch(`${API_BASE}/api/leetcode/update-after-interview`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    if (response.ok) {
      console.log('LeetCode stats updated successfully:', data);
      // notify other parts of the app (same tab + other tabs)
      try {
        // same-tab listeners
        window.dispatchEvent(new CustomEvent('leetcodeStatsUpdated', { detail: { leetcodeStats: data.leetcodeStats || null } }));
        // cross-tab listeners (storage event fires in other tabs)
        localStorage.setItem('leetcodeStatsLastUpdated', Date.now().toString());
      } catch (e) {
        /* ignore */
      }
    } else {
      console.warn('Failed to update LeetCode stats:', data.message || data);
    }
  } catch (error) {
    console.error('Error updating LeetCode stats:', error);
  }
};

// LeetcodeMeter.jsx — make sure fetchLeetCodeStats is memoized, then add this effect:
useEffect(() => {
  const onStatsUpdated = (e) => {
    console.log('LeetcodeMeter: leetcodeStatsUpdated event received', e?.detail);
    const incoming = e?.detail?.leetcodeStats ?? null;
    if (incoming) {
      // normalize and apply immediately
      const normalized = normalizeIncoming(incoming);
      setStats(prev => ({
        // merge so we don't lose any fields
        total: typeof normalized.total === 'number' ? normalized.total : prev.total,
        attempting: typeof normalized.attempting === 'number' ? normalized.attempting : prev.attempting,
        easy: {
          solved: typeof normalized.easy?.solved === 'number' ? normalized.easy.solved : prev.easy.solved,
          total: typeof normalized.easy?.total === 'number' ? normalized.easy.total : prev.easy.total,
        },
        medium: {
          solved: typeof normalized.medium?.solved === 'number' ? normalized.medium.solved : prev.medium.solved,
          total: typeof normalized.medium?.total === 'number' ? normalized.medium.total : prev.medium.total,
        },
        hard: {
          solved: typeof normalized.hard?.solved === 'number' ? normalized.hard.solved : prev.hard.solved,
          total: typeof normalized.hard?.total === 'number' ? normalized.hard.total : prev.hard.total,
        }
      }));

      // update animated counters immediately to reflect change in UI:
      const solvedNow = (normalized.easy?.solved || 0) + (normalized.medium?.solved || 0) + (normalized.hard?.solved || 0);
      setAnimatedSolved(solvedNow); // set directly so UI shows new number immediately
      setAnimatedAttempting(normalized.attempting ?? 0);
      return;
    }

    // if event had no payload, fallback to refetch authoritative stats
    fetchLeetCodeStats();
  };

  const onStorage = (e) => {
    if (!e) return;
    if (e.key === 'leetcodeStatsLastUpdated') {
      console.log('LeetcodeMeter: storage event - leetcodeStatsLastUpdated', e.newValue);
      fetchLeetCodeStats();
    }
  };

  window.addEventListener('leetcodeStatsUpdated', onStatsUpdated);
  window.addEventListener('storage', onStorage);

  return () => {
    window.removeEventListener('leetcodeStatsUpdated', onStatsUpdated);
    window.removeEventListener('storage', onStorage);
  };
}, [fetchLeetCodeStats, normalizeIncoming]);

  useEffect(() => {
    // fetch on mount & whenever userId changes
    fetchLeetCodeStats();
    return () => {
      clearTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // compute solved and stroke
  const solved = (stats.easy.solved || 0) + (stats.medium.solved || 0) + (stats.hard.solved || 0);
  const solvedPercentage = stats.total ? (solved / stats.total) * 100 : 0;

  const radius = 85;
  const circumference = 2 * Math.PI * radius;
  // safe offset calculation
  const strokeDashoffset = circumference - (Math.max(0, Math.min(100, solvedPercentage)) / 100) * circumference;

  // Keep your original animation logic but with proper cleanup & safety
  useEffect(() => {
    if (loading) return;

    // clear any previous timers
    clearTimers();

    // animate solved number similar to your original: small increments
    const timer1 = setTimeout(() => {
      const interval1 = setInterval(() => {
        setAnimatedSolved(prev => {
          const step = Math.ceil(Math.max(1, solved / 50));
          const next = prev + step;
          if (next >= solved) {
            clearInterval(interval1);
            return solved;
          }
          return next;
        });
      }, 20);
      timersRef.current.intervals.push(interval1);
    }, 200);
    timersRef.current.timeouts.push(timer1);

    // animate attempting
    const timer2 = setTimeout(() => {
      setAnimatedAttempting(stats.attempting || 0);
    }, 600);
    timersRef.current.timeouts.push(timer2);

    // cleanup on re-run/unmount
    return () => clearTimers();
  }, [loading, solved, stats.attempting]);

  // Demo click handler — only active for own profile (keeps your original behaviour)
  const handleSolveProblem = (difficulty) => {
    if (!isOwnProfile) return;
    const newStats = {
      ...stats,
      [difficulty]: {
        ...stats[difficulty],
        solved: (stats[difficulty]?.solved || 0) + 1
      },
      total: (stats.total || 0) + 1
    };
    // local immediate update for snappy UI then persist
    setStats(newStats);
    setAnimatedSolved(prev => prev + 1); // quick local bump
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

  // Render — kept exactly like your original styles & layout
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
                cursor: isOwnProfile ? 'pointer' : 'default',
                opacity: isOwnProfile ? 1 : 0.9
              }}
              // onClick={() => handleSolveProblem('easy')}
              // title={isOwnProfile ? "Click to add a solved easy problem" : ''}
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
                cursor: isOwnProfile ? 'pointer' : 'default',
                opacity: isOwnProfile ? 1 : 0.9
              }}
              // onClick={() => handleSolveProblem('medium')}
              // title={isOwnProfile ? "Click to add a solved medium problem" : ''}
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
                cursor: isOwnProfile ? 'pointer' : 'default',
                opacity: isOwnProfile ? 1 : 0.9
              }}
              // onClick={() => handleSolveProblem('hard')}
              // title={isOwnProfile ? "Click to add a solved hard problem" : ''}
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
