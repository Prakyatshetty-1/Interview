import "./Dashboard.css"

const Dashboard = () => {
  // Generate sample data for the heatmap (365 days)
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
  const maxStreak = 15 // Sample max streak

  // Get month labels
  const getMonthLabels = () => {
    const months = []
    const today = new Date()

    for (let i = 11; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1)
      months.push(date.toLocaleDateString("en", { month: "short" }))
    }
    return months
  }

  const monthLabels = getMonthLabels()

  // CHANGED: Better month grouping for visual separation
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
    <div className="dashboard10">
      {/* Header */}
      <header className="header10">
        <div className="header-left10">
          <div className="logo10">
            <div className="logo-icon10">P</div>
            <span>Pitch.io</span>
          </div>
        </div>
        <div className="header-center10">
          <h1>Dashboard</h1>
          <span className="date10">Monday, 27 March 2023</span>
        </div>
        <div className="header-right10">
          <div className="header-icons10">
            <div className="icon-btn10">✉</div>
            <div className="icon-btn10">🔔</div>
          </div>
          <div className="user-profile10">
            <span>Alyssa Jones</span>
            <div className="avatar10">AJ</div>
          </div>
        </div>
      </header>

      <div className="main-container10">
        {/* Sidebar */}
        <aside className="sidebar10">
          <div className="create-section10">
            <button className="create-btn10">
              <span>Create New Pitch</span>
              <div className="plus-icon10">+</div>
            </button>
          </div>

          <nav className="nav-menu10">
            <div className="nav-item10 active10">
              <div className="nav-icon10">📊</div>
              <span>Dashboard</span>
            </div>
            <div className="nav-item10">
              <div className="nav-icon10">✏️</div>
              <span>Editor</span>
            </div>
            <div className="nav-item10">
              <div className="nav-icon10">👥</div>
              <span>Leads</span>
            </div>
            <div className="nav-item10">
              <div className="nav-icon10">⚙️</div>
              <span>Settings</span>
            </div>
            <div className="nav-item10">
              <div className="nav-icon10">👁️</div>
              <span>Preview</span>
            </div>
          </nav>

          <div className="sidebar-bottom10">
            <div className="preview-card10">
              <div className="preview-image10">📺</div>
            </div>
            <button className="upgrade-btn10">Upgrade</button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="content10">
          {/* Welcome Section */}
          <section className="welcome-section10">
            <div className="welcome-content10">
              <h2>Hi, Alyssa</h2>
              <p>Ready to start your day with some pitch decks?</p>
            </div>
            <div className="welcome-illustration10">
              <div className="illustration-woman10">👩‍💻</div>
            </div>
          </section>

          {/* Activity Heatmap Section */}
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

          {/* Projects Section */}
          <section className="projects-section10">
            <div className="project-card10">
              <div className="project-thumbnail10 orange-bg10">
                <div className="project-icon10">🔔</div>
              </div>
              <div className="project-info10">
                <h4>Next in Fashion</h4>
                <p>Get everyone organized with product, such as using our offline discount cards when out and about.</p>
                <span className="slide-count10">10 Slides</span>
              </div>
              <div className="project-actions10">
                <span className="status10 public10">Public</span>
                <div className="action-buttons10">
                  <button className="action-btn10">✏️</button>
                  <button className="action-btn10">🗑️</button>
                </div>
              </div>
            </div>

            <div className="project-card10">
              <div className="project-thumbnail10 blue-bg10">
                <div className="project-icon10">🚀</div>
              </div>
              <div className="project-info10">
                <h4>Digital Marketing Today</h4>
                <p>Get everyone organized with product, such as using our offline discount cards when out and about.</p>
                <span className="slide-count10">10 Slides</span>
              </div>
              <div className="project-actions10">
                <span className="status10 private10">Private</span>
                <div className="action-buttons10">
                  <button className="action-btn10">✏️</button>
                  <button className="action-btn10">🗑️</button>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

export default Dashboard
