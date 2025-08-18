import AboutAi from './components/AboutAi'
import LandingPage from './components/LandingPage'
import NavBar from './components/NavBar'
import PricingPage from './components/PricingPage';
import Features from './components/Features';

import CommunityPage from './components/CommunityPage';
import HeroSection from './components/HeroSection';
import CreatedBy  from './components/CreatedBy';

function MainLanding(){
    return (
        <>
            <NavBar/>
             <div id="home"><LandingPage/></div> 
             <div id="about-ai"><AboutAi/></div> 
            <div id="Features"><Features/></div>
            <div id="pricing"><PricingPage/></div>
            <div id="createdby"><CreatedBy/></div>
            {/* <div id=""><Reviews/></div> */}
            <div id="community"><CommunityPage/></div>
            <HeroSection/>
        </>
        
    )
    
}
export default MainLanding;