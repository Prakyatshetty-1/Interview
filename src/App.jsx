import AboutAi from './components/AboutAi'
import LandingPage from './components/LandingPage'
import NavBar from './components/NavBar'
import PricingPage from './components/PricingPage';
import Features from './components/Features';
import Reviews from './components/Reviews';
import CommunityPage from './components/CommunityPage';
import './App.css';

function App() {


  return (
    <>
      <NavBar/>
      <div id="home"><LandingPage/></div>
      <div id="about-ai"><AboutAi/></div>
      <div id="Features"><Features/></div>
      <div id="pricing"><PricingPage/></div>
      {/* <div id=""><Reviews/></div> */}
      <div id="community"><CommunityPage/></div>

    </>
  )
}

export default App
