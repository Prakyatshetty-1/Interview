import React from 'react';
import './HeatMap.css';
function HeatMap() {
    const generateHeatmapData = () => {
        const data = [];
        const today = new Date();
        const oneYearAgo = new Date(today);
        oneYearAgo.setFullYear(today.getFullYear() - 1);
        
        // Calculate the exact number of days in the past year
        const diffTime = today  - oneYearAgo;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        for (let i = 0; i < diffDays+1; i++) {
            const date = new Date(oneYearAgo);
            date.setDate(oneYearAgo.getDate() + i);

            const activity = Math.floor(Math.random() * 5);

            data.push({
                date: date.toISOString().split("T")[0],
                count: activity,
                level: activity,
                dayOfWeek: date.getDay(),
                month: date.getMonth(),
                week: Math.floor(i / 7),
                fullDate: new Date(date)
            });
        }
        return data;
    };

    const heatmapData = generateHeatmapData();
    const totalSubmissions = heatmapData.reduce((sum, day) => sum + day.count, 0);
    const activeDays = heatmapData.filter((day) => day.count > 0).length;
    
    // Calculate actual max streak
    const calculateMaxStreak = () => {
        let maxStreak = 0;
        let currentStreak = 0;
        
        heatmapData.forEach((day) => {
            if (day.count > 0) {
                currentStreak++;
                maxStreak = Math.max(maxStreak, currentStreak);
            } else {
                currentStreak = 0;
            }
        });
        
        return maxStreak;
    };
    
    const maxStreak = calculateMaxStreak();

    // Group data by months with proper handling
    const groupByMonths = () => {
        const monthGroups = [];
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                           'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        // Group by month-year combination to handle year transitions
        const monthMap = new Map();
        
        heatmapData.forEach((day) => {
            const key = `${day.fullDate.getFullYear()}-${day.month}`;
            if (!monthMap.has(key)) {
                monthMap.set(key, {
                    month: day.month,
                    year: day.fullDate.getFullYear(),
                    data: [],
                    label: monthNames[day.month]
                });
            }
            monthMap.get(key).data.push(day);
        });
        
        // Convert to array and sort by year-month
        return Array.from(monthMap.values()).sort((a, b) => {
            if (a.year !== b.year) return a.year - b.year;
            return a.month - b.month;
        });
    };

    // Convert month data to week columns
    const convertToWeeks = (monthData) => {
        const weeks = [];
        let currentWeek = Array(7).fill(null);
        let weekStarted = false;
        
        // Sort days within month by date
        const sortedData = monthData.sort((a, b) => a.fullDate - b.fullDate);
        
        sortedData.forEach((day, index) => {
            const dayOfWeek = day.dayOfWeek;
            
            // If it's Sunday and we've started a week, finish the current week
            if (dayOfWeek === 0 && weekStarted) {
                weeks.push([...currentWeek]);
                currentWeek = Array(7).fill(null);
            }
            
            currentWeek[dayOfWeek] = day;
            weekStarted = true;
            
            // If it's the last day, make sure to add the final week
            if (index === sortedData.length - 1) {
                weeks.push([...currentWeek]);
            }
        });
        
        return weeks;
    };

    const monthGroups = groupByMonths();

    const getColor = (level) => {
    switch (level) {
        case 0: return '#262e3aff';     // Dark purple base (similar to button background)
        case 1: return '#4c1d95';     // Medium dark purple
        case 2: return '#6b21a8';     // Purple (matches button background)
        case 3: return '#9333ea';     // Bright purple (matches button border)
        case 4: return '#c084fc';     // Light purple (matches button text)
        default: return '#1e1b3a';    // Very dark purple default
    }
};

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { 
            weekday: 'short', 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
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
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
                flexWrap: 'wrap',
                gap: '8px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{fontSize:'20px', fontWeight: '500',color:'#7d8590' }}>
                        {totalSubmissions} contributions in the past year
                    </span>
                </div>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    color: '#7d8590',
                    flexWrap: 'wrap'
                }}>
                    <span>Total active days: <strong style={{color: '#e6edf3'}}>{activeDays}</strong></span>
                    <span>Max streak: <strong style={{color: '#e6edf3'}}>{maxStreak}</strong></span>
                </div>
            </div>

            {/* Contribution graph */}
            <div>
                {/* Grid */}
                <div style={{ display: 'flex', justifyContent:'center', overflowX: 'auto' }}>
                    {/* Month sections with labels above blocks */}
                    <div style={{ display: 'flex', gap: '10px' }}>
                        {monthGroups.map((monthGroup, monthIndex) => {
                            const weeks = convertToWeeks(monthGroup.data);
                            
                            if (weeks.length === 0) return null;
                            
                            return (
                                <div key={`${monthGroup.year}-${monthGroup.month}`} style={{ 
                                    display: 'flex', 
                                    flexDirection: 'column' 
                                }}>
                                    {/* Month label above this section */}
                                    <div style={{
                                        height: '15px',
                                        marginBottom: '10px',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        fontSize: '14px',
                                        color: '#7d8590',
                                        width: `${weeks.length * 13 + (weeks.length - 1) * 2}px`
                                    }}>
                                        {monthGroup.label}
                                    </div>
                                    
                                    {/* Blocks for this month */}
                                    <div style={{ display: 'flex', gap: '2px' }}>
                                        {weeks.map((week, weekIndex) => (
                                            <div key={weekIndex} style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '2px'
                                            }}>
                                                {week.map((day, dayIndex) => {
                                                    const level = day ? day.level : 0;
                                                    const isEmpty = !day;
                                                    
                                                    return (
                                                        <div
                                                            key={dayIndex}
                                                            style={{
                                                                width: '12px',
                                                                height: '12px',
                                                                borderRadius: '3px',
                                                                backgroundColor: isEmpty ? 'transparent' : getColor(level),
                                                                border: isEmpty ? 'none' : '1px solid #1b1f23',
                                                                cursor: day ? 'pointer' : 'default',
                                                                opacity: isEmpty ? 0 : 1
                                                            }}
                                                            title={day ? `${day.count} contributions on ${formatDate(day.date)}` : ''}
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

                {/* Legend */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: '4px',
                    marginTop: '12px',
                    fontSize: '11px',
                    color: '#7d8590'
                }}>
                    <span>Less</span>
                    <div style={{ display: 'flex', gap: '2px', margin: '0 4px' }}>
                        {[0, 1, 2, 3, 4].map((level) => (
                            <div
                                key={level}
                                style={{
                                    width: '10px',
                                    height: '10px',
                                    borderRadius: '2px',
                                    backgroundColor: getColor(level),
                                    border: '1px solid #1b1f23'
                                }}
                            />
                        ))}
                    </div>
                    <span>More</span>
                </div>
            </div>
        </div>
    );
}

export default HeatMap;