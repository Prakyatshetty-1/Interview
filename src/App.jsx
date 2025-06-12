import AboutAi from './components/AboutAi'
import LandingPage from './components/LandingPage'
import NavBar from './components/NavBar'
import PricingPage from './components/PricingPage';
import './App.css';

function App() {


  return (
    <>
      <NavBar/>
      <div id="home"><LandingPage/></div>
      <div id="about-ai"><AboutAi/></div>
      {/* <div id="pricing"><PricingPage/></div> */}
    </>
  )
}

export default App
