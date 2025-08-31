import { Routes, Route } from 'react-router-dom';
import MainLanding from './MainLanding';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Preference from './pages/Preference';
import Dashboard from './pages/Dashboard';
import Welcome from './pages/Welcome';
import InterviewPage from './pages/InterviewPage';
import InterviewsByTag from './pages/InterviewsByTag';
import CreateInterview from './pages/CreateInterview';
import Saves from './pages/Saves';
import Profile from './pages/Profile';
import InterviewPortal from './pages/InterviewPortal';
import ViewProfile from './pages/ViewProfile';
import Questionfolder from './pages/Questionfolder';
import './App.css';

function App() {
  return (
      <Routes>
        <Route path="/" element={<MainLanding />} />
        <Route path="/signup" element={<Signup />} />
        <Route path='/login' element={<Login/>}/>
        <Route path='/preference' element={<Preference/>}/>
        <Route path='/dashboard' element={<Dashboard/>}/>
        <Route path='/interview' element={<InterviewPage/>}/>
        <Route path='/interviews' element={<InterviewsByTag/>}/>
        <Route path='/questionfolder' element={<Questionfolder/>}/>
        <Route path='/create' element={<CreateInterview/>}/>
        <Route path='/saves' element={<Saves/>}/>
        <Route path='/profile' element={<Profile/>}/>
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/interview/:id" element={<InterviewPortal />} />
        <Route path='/viewprofile' element={<ViewProfile/>}/>
        <Route path='/questionfolder' element={<Questionfolder/>}/>
      </Routes>
  );
}

export default App;