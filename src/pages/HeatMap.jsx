import './HeatMap.css'

function HeatMap(){
    const generateHeatmapData = () => {
    const data = []
    const today = new Date()
    const startDate = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate())

    for (let i = 0; i < 365; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)

      // Generate random activity level (0-4)
      const activity = Math.floor(Math.random() * 5)

      data.push({
        date: date.toISOString().split("T")[0],
        count: activity,
        level: activity,
        month: date.getMonth(),
        week: Math.floor(i / 7),
      })
    }
    return data
  }

  const heatmapData = generateHeatmapData()
  const totalSubmissions = heatmapData.reduce((sum, day) => sum + day.count, 0)
  const activeDays = heatmapData.filter((day) => day.count > 0).length
  const maxStreak = 15

  const getMonthLabels = () => {
    const months = []
    const today = new Date()

    for (let i = 11; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1)
      months.push(date.toLocaleDateString("en", { month: "short" }))
    }
    return months
  }

  const monthLabels = getMonthLabels();

  const groupDataByWeeksWithMonthSeparation = () => {
    const weeks = []
    let currentWeek = []

    heatmapData.forEach((day, index) => {
      currentWeek.push(day)

      // Complete week or last day
      if (currentWeek.length === 7 || index === heatmapData.length - 1) {
        weeks.push([...currentWeek])
        currentWeek = []
      }
    })

    return weeks
  }

  const weekGroups = groupDataByWeeksWithMonthSeparation()




    return (
        <>
            <section className="activity-section10">
            <div className="activity-header10">
              <div className="activity-stats10">
                <span className="submissions-count10">{totalSubmissions} submissions in the past one year</span>
                <div className="activity-info10">ℹ️</div>
              </div>
              <div className="activity-summary10">
                <span>
                  Total active days: <strong>{activeDays}</strong>
                </span>
                <span>
                  Max streak: <strong>{maxStreak}</strong>
                </span>
                <div className="current-dropdown10">
                  <span>Current</span>
                  <span>▼</span>
                </div>
              </div>
            </div>

            <div className="heatmap-container10">
              <div className="month-labels10">
                {monthLabels.map((month, index) => (
                  <span key={index} className="month-label10">
                    {month}
                  </span>
                ))}
              </div>

              <div className="heatmap-grid10">
                <div className="weekday-labels10">
                  <span></span>
                  <span>Mon</span>
                  <span></span>
                  <span>Wed</span>
                  <span></span>
                  <span>Fri</span>
                  <span></span>
                </div>

                <div className="heatmap-weeks10">
                  {weekGroups.map((week, weekIndex) => (
                    <div key={weekIndex} className="heatmap-week10">
                      {week.map((day, dayIndex) => (
                        <div
                          key={dayIndex}
                          className={`heatmap-day10 level-${day.level}10`}
                          title={`${day.count} submissions on ${day.date}`}
                        ></div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              <div className="heatmap-legend10">
                <span>Less</span>
                <div className="legend-squares10">
                  <div className="legend-square10 level-010"></div>
                  <div className="legend-square10 level-110"></div>
                  <div className="legend-square10 level-210"></div>
                  <div className="legend-square10 level-310"></div>
                  <div className="legend-square10 level-410"></div>
                </div>
                <span>More</span>
              </div>
            </div>
          </section>
        </>
    );
}
export default HeatMap