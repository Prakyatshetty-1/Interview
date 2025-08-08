import React from 'react';
import './HeatMap.css';
function HeatMap() {
    const generateHeatmapData = () => {
        const today = new Date();
        const lastYear = new Date();
        lastYear.setFullYear(today.getFullYear() - 1);

        const data = [];//agar tu heatmap the database bana raha tho heatmap the data ider ye data me put kar de 
        // const data = [
        //     { date: "2024-08-08", count: 0, level: 0, dayOfWeek: 4, month: 7, week: 32 },
        //     { date: "2024-08-09", count: 1, level: 1, dayOfWeek: 5, month: 7, week: 32 },
        //     { date: "2024-08-10", count: 2, level: 2, dayOfWeek: 6, month: 7, week: 32 },
        //     { date: "2024-08-11", count: 3, level: 3, dayOfWeek: 0, month: 7, week: 32 },
        //     { date: "2024-08-12", count: 4, level: 4, dayOfWeek: 1, month: 7, week: 33 },
        //     { date: "2024-08-13", count: 0, level: 0, dayOfWeek: 2, month: 7, week: 33 },
        //     { date: "2024-08-14", count: 1, level: 1, dayOfWeek: 3, month: 7, week: 33 },
        //     { date: "2024-08-15", count: 2, level: 2, dayOfWeek: 4, month: 7, week: 33 },
        //     { date: "2024-08-16", count: 3, level: 3, dayOfWeek: 5, month: 7, week: 33 },
        //     { date: "2024-08-17", count: 4, level: 4, dayOfWeek: 6, month: 7, week: 33 },
        //     { date: "2024-08-18", count: 0, level: 0, dayOfWeek: 0, month: 7, week: 34 },
        //     { date: "2024-08-19", count: 1, level: 1, dayOfWeek: 1, month: 7, week: 34 },
        //     { date: "2024-08-20", count: 2, level: 2, dayOfWeek: 2, month: 7, week: 34 },
        //     { date: "2024-08-21", count: 3, level: 3, dayOfWeek: 3, month: 7, week: 34 },
        //     { date: "2024-08-22", count: 4, level: 4, dayOfWeek: 4, month: 7, week: 34 },
        //     { date: "2024-08-23", count: 0, level: 0, dayOfWeek: 5, month: 7, week: 34 },
        //     { date: "2024-08-24", count: 1, level: 1, dayOfWeek: 6, month: 7, week: 34 },
        //     { date: "2024-08-25", count: 2, level: 2, dayOfWeek: 0, month: 7, week: 35 },
        //     { date: "2024-08-26", count: 3, level: 3, dayOfWeek: 1, month: 7, week: 35 },
        //     { date: "2024-08-27", count: 4, level: 4, dayOfWeek: 2, month: 7, week: 35 },
        //     { date: "2024-08-28", count: 0, level: 0, dayOfWeek: 3, month: 7, week: 35 },
        //     { date: "2024-08-29", count: 1, level: 1, dayOfWeek: 4, month: 7, week: 35 },
        //     { date: "2024-08-30", count: 2, level: 2, dayOfWeek: 5, month: 7, week: 35 },
        //     { date: "2024-08-31", count: 3, level: 3, dayOfWeek: 6, month: 7, week: 35 },
        //     { date: "2024-09-01", count: 4, level: 4, dayOfWeek: 0, month: 8, week: 36 },
        //     { date: "2024-09-02", count: 0, level: 0, dayOfWeek: 1, month: 8, week: 36 },
        //     { date: "2024-09-03", count: 1, level: 1, dayOfWeek: 2, month: 8, week: 36 }
        // ]; ye format me tera database me data store kar aur baadme yahi exact order me data fetch kar baki sub working hai 
        //baadme line number 40 se line number 60 jider console.log(data) hai vo hata de 
        //tera data current date se lekar last 365 days me hoona chahiye aur dynamic tabhi hi working rahega aur ye data har ek user ke liye alag rahega 
        
        let week = 0;

        for (let d = new Date(lastYear); d <= today; d.setDate(d.getDate() + 1)) {
            const countPattern = [0, 1, 2, 3, 4]; // cycle through 5 levels
            const dayIndex = Math.floor((d - lastYear) / (1000 * 60 * 60 * 24));
            const count = countPattern[dayIndex % countPattern.length];

            data.push({
                date: d.toISOString().split("T")[0],
                count,
                level: count,
                dayOfWeek: d.getDay(),
                month: d.getMonth(),
                week,
                fullDate: new Date(d),
            });

            if (d.getDay() === 6) week++; // increment week at the end of Saturday
        }
        console.log(data);

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
                    <span style={{ fontSize: '20px', fontWeight: '500', color: '#7d8590' }}>
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
                    <span>Total active days: <strong style={{ color: '#e6edf3' }}>{activeDays}</strong></span>
                    <span>Max streak: <strong style={{ color: '#e6edf3' }}>{maxStreak}</strong></span>
                </div>
            </div>

            {/* Contribution graph */}
            <div>
                {/* Grid */}
                <div style={{ display: 'flex', justifyContent: 'center', overflowX: 'auto' }}>
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