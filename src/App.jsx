import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLanding from './MainLanding';
import Signup from './pages/Signup';
import Login from './pages/Login'
import Preference from './pages/Preference';
import Dashboard from './pages/Dashboard';
import Welcome from './pages/Welcome';
import InterviewPage from './pages/InterviewPage';
import CreateInterview from './pages/CreateInterview';
import Saves from './pages/Saves';
import Profile from './pages/Profile';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLanding />} />
        <Route path="/signup" element={<Signup />} />
        <Route path='/login' element={<Login/>}/>
        <Route path='/Preference' element={<Preference/>}/>
        <Route path='/dashboard' element={<Welcome/>}/>
        <Route path='/Interview' element={<InterviewPage/>}/>
        <Route path='/Create' element={<CreateInterview/>}/>
        <Route path='/Saves' element={<Saves/>}/>
        <Route path='/Profile' element={<Profile/>}/>
      </Routes>
    </Router>
  );
}

export default App;