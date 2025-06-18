import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLanding from './MainLanding';
import Signup from './pages/Signup';
import Login from './pages/Login'
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLanding />} />
        <Route path="/signup" element={<Signup />} />
        <Route path='/login' element={<Login/>}/>
      </Routes>
    </Router>
  );
}

export default App;
