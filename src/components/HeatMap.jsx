// src/components/HeatMap.jsx
import React, { useEffect, useState, useCallback } from 'react';
import './HeatMap.css';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

const toISO = (d) => {
  const dt = new Date(d);
  return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`;
};

const getColor = (level) => {
  switch (Number(level)) {
    case 0: return '#262e3aff';
    case 1: return '#4c1d95';
    case 2: return '#6b21a8';
    case 3: return '#9333ea';
    case 4: return '#c084fc';
    default: return '#1e1b3a';
  }
};

function generateDemoData() {
  const today = new Date();
  const lastYear = new Date(today);
  lastYear.setFullYear(today.getFullYear() - 1);
  const data = [];
  let week = 0;
  const pattern = [0,1,2,3,4];
  let idx = 0;
  for (let d = new Date(lastYear); d <= today; d.setDate(d.getDate() + 1)) {
    const iso = toISO(d);
    const lvl = pattern[idx % pattern.length];
    data.push({
      date: iso,
      attemptCount: lvl === 0 ? 0 : Math.floor(Math.random()*2)+1,
      attemptLevel: lvl,
      createdCount: Math.random() < 0.05 ? 1 : 0,
      createdLevel: lvl > 0 ? Math.min(4, lvl) : 0,
      level: lvl,
      fullDate: new Date(d),
      dayOfWeek: d.getDay(),
      month: d.getMonth(),
      week
    });
    if (d.getDay() === 6) week++;
    idx++;
  }
  return data;
}

export default function HeatMap({ userId }) {
  const [heatmapData, setHeatmapData] = useState(null);
  const [loading, setLoading] = useState(true);

  // fetchContributions now respects userId:
  const fetchContributions = useCallback(async () => {
    setLoading(true);
    try {
      // If userId provided -> fetch public contributions endpoint for that user
      if (userId) {
        const res = await fetch(`${API_BASE}/api/users/${userId}/contributions`);
        if (!res.ok) throw new Error('Failed to fetch public contributions');
        const data = await res.json();
        // normalize
        const normalized = data.map(d => {
          const fd = new Date(d.date);
          return { ...d, fullDate: fd, dayOfWeek: fd.getDay(), month: fd.getMonth(), week: 0 };
        });
        // compute week indices
        let weekIdx = 0;
        for (let i = 0; i < normalized.length; i++) {
          normalized[i].week = weekIdx;
          if (normalized[i].dayOfWeek === 6) weekIdx++;
        }
        setHeatmapData(normalized);
        setLoading(false);
        return;
      }

      // else fallback: fetch own authenticated contributions
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
      const res = await fetch(`${API_BASE}/api/profile/contributions`, { headers });
      if (!res.ok) throw new Error('Failed to fetch contributions');
      const data = await res.json();
      const normalized = data.map(d => {
        const fd = new Date(d.date);
        return { ...d, fullDate: fd, dayOfWeek: fd.getDay(), month: fd.getMonth(), week: 0 };
      });
      let weekIdx = 0;
      for (let i = 0; i < normalized.length; i++) {
        normalized[i].week = weekIdx;
        if (normalized[i].dayOfWeek === 6) weekIdx++;
      }
      setHeatmapData(normalized);
    } catch (err) {
      console.warn('Contributions fetch failed — using demo data', err);
      setHeatmapData(generateDemoData());
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchContributions();
    const onContrib = () => fetchContributions();
    window.addEventListener('contributions-updated', onContrib);
    window.addEventListener('focus', onContrib);
    return () => {
      window.removeEventListener('contributions-updated', onContrib);
      window.removeEventListener('focus', onContrib);
    };
  }, [fetchContributions]);

  if (loading || !heatmapData) {
    return <div className="heatmap-container" style={{ padding: 12 }}>Loading heatmap…</div>;
  }

  // group by month-year
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const monthMap = new Map();
  heatmapData.forEach(day => {
    const key = `${day.fullDate.getFullYear()}-${day.month}`;
    if (!monthMap.has(key)) monthMap.set(key, { month: day.month, year: day.fullDate.getFullYear(), data: [], label: monthNames[day.month] });
    monthMap.get(key).data.push(day);
  });
  const monthGroups = Array.from(monthMap.values()).sort((a,b) => a.year - b.year || a.month - b.month);

  const convertToWeeks = (monthData) => {
    const weeks = [];
    let currentWeek = Array(7).fill(null);
    const sorted = monthData.slice().sort((a,b) => a.fullDate - b.fullDate);
    sorted.forEach((day, idx) => {
      currentWeek[day.dayOfWeek] = day;
      if (day.dayOfWeek === 6) {
        weeks.push([...currentWeek]);
        currentWeek = Array(7).fill(null);
      } else if (idx === sorted.length - 1) {
        weeks.push([...currentWeek]);
      }
    });
    return weeks;
  };

  const totalSubmissions = heatmapData.reduce((s, d) => s + (d.attemptCount || 0) + (d.createdCount || 0), 0);
  const activeDays = heatmapData.filter(d => (d.attemptCount || 0) + (d.createdCount || 0) > 0).length;

  let maxStreak = 0, cur = 0;
  heatmapData.forEach(d => {
    if ((d.attemptCount || 0) + (d.createdCount || 0) > 0) { cur++; maxStreak = Math.max(maxStreak, cur); } else cur = 0;
  });

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div style={{
      marginTop: '2rem',
      background: 'rgba(15, 16, 31, 0.6)',
      borderRadius: '24px',
      padding: '24px',
      color: '#e6edf3',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif',
      fontSize: '12px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{fontSize:'20px', fontWeight: '500',color:'#7d8590' }}>{totalSubmissions} contributions in the past year</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#7d8590', flexWrap: 'wrap' }}>
          <span>Total active days: <strong style={{color: '#e6edf3'}}>{activeDays}</strong></span>
          <span>Max streak: <strong style={{color: '#e6edf3'}}>{maxStreak}</strong></span>
        </div>
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent:'center', overflowX: 'auto' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            {monthGroups.map((monthGroup) => {
              const weeks = convertToWeeks(monthGroup.data);
              if (!weeks || weeks.length === 0) return null;
              return (
                <div key={`${monthGroup.year}-${monthGroup.month}`} style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{
                    height: '15px',
                    marginBottom: '10px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    fontSize: '14px',
                    color: '#7d8590',
                    width: `${weeks.length * 13 + (weeks.length - 1) * 2}px`
                  }}>{monthGroup.label}</div>

                  <div style={{ display: 'flex', gap: '2px' }}>
                    {weeks.map((week, weekIndex) => (
                      <div key={weekIndex} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        {week.map((day, dayIndex) => {
                          const level = day ? day.level : 0;
                          const isEmpty = !day;
                          const title = day ? `${(day.attemptCount || 0) + (day.createdCount || 0)} contribution(s) on ${formatDate(day.date)}\nAttempts: ${day.attemptCount || 0} (max level ${day.attemptLevel||0})\nPacks created: ${day.createdCount || 0}` : '';
                          return (
                            <div key={dayIndex} title={title}
                              style={{
                                width: '12px',
                                height: '12px',
                                borderRadius: '3px',
                                backgroundColor: isEmpty ? 'transparent' : getColor(level),
                                border: isEmpty ? 'none' : '1px solid #1b1f23',
                                cursor: day ? 'pointer' : 'default',
                                opacity: isEmpty ? 0 : 1
                              }}
                            />
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', marginTop: '12px', fontSize: '11px', color: '#7d8590' }}>
          <span>Less</span>
          <div style={{ display: 'flex', gap: '2px', margin: '0 4px' }}>
            {[0,1,2,3,4].map((level) => (
              <div key={level} style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: getColor(level), border: '1px solid #1b1f23' }} />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
