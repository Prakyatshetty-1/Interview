import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLanding from './MainLanding';
import Signup from './pages/Signup';
import Login from './pages/Login'
import Preference from './pages/Preference';
import Dashboard from './pages/Dashboard';
import Welcome from './pages/Welcome';
import InterviewPage from './pages/InterviewPage';
import VoiceRe from './pages/VoiceRe';
import WaveCircle from './pages/SavePage';
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
        <Route path='/VoiceRe' element={<VoiceRe/>}/>
        <Route path='/savepage' element={<WaveCircle/>}/>
      </Routes>
    </Router>
  );
}

export default App;