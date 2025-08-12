import { Routes, Route } from 'react-router-dom';
import MainLanding from './MainLanding';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Preference from './pages/Preference';
import Dashboard from './pages/Dashboard';
import Welcome from './pages/Welcome';
import InterviewPage from './pages/InterviewPage';
import CreateInterview from './pages/CreateInterview';
import Saves from './pages/Saves';
import Profile from './pages/Profile';
import InterviewPortal from './pages/InterviewPortal';
import './App.css';
import InterviewsByTag from "./pages/InterviewsByTag";
import InterviewDetail from './pages/InterviewDetail';

function App() {
  return (
    <Routes>
      {/* Primary landing page */}
      <Route path="/" element={<MainLanding />} />

      {/* Auth */}
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />

      {/* User flows */}
      <Route path="/preference" element={<Preference />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/create" element={<CreateInterview />} />
      <Route path="/saves" element={<Saves />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/interviewportal" element={<InterviewPortal />} />
      <Route path='/Interview' element={<InterviewPage/>}/>
      {/* Interviews + tag results */}
      <Route path="/interviews/tag/:tag" element={<InterviewsByTag />} />
      <Route path="/interview/:id" element={<InterviewDetail />} />
      {/* Optional fallback */}
      {/* <Route path="*" element={<MainLanding />} /> */}
    </Routes>
  );
}

export default App;
