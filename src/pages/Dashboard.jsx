import "./Dashboard.css"
import HeatMap from "./HeatMap"

const Dashboard = () => {
  // Generate sample data for the heatmap (365 days)
  

   // Sample max streak

  // Get month labels
  

  // CHANGED: Better month grouping for visual separation
  
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
          <HeatMap/>
          {/*this is the heatmap component*/}
          

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
