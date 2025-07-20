import React from 'react';
import './AboutAi.css';
import ScrollFloat from '../react-bits/ScrollFloat';
import { MdArrowOutward } from "react-icons/md";

const AboutAi = () => {
  return (
    <div className="about-ai-container">
      {/* Enhanced background orbs for consistency */}
      <div className="about-ai-content-box">
        <div className="infoboxleft">
          <div className="uppercontentdivs">
            <div className="statbox">
              
                
            </div>
            
            <div className="watchvideo">
              
            </div>
          </div>
          <div className="titlecontentdiv">
            
            <h1 className='uppertitlecon'>Experience the</h1>
            <div className='middletitlecon'>
              <h1>future of</h1>
              <button className="buttonforaboutai">
  Learn More
</button>
              <button className="buttonforaboutai1">
<MdArrowOutward style={{ color: '#151515', fontSize: '25px',fontWeight:'300' }} />
</button>
            </div>
            <div className="bottomtitlecon">
              <h1>interviewing</h1>
              <div className="card-avatars">
                    <div className="cardavatar-container">
                      <img src="/profilepic2.png" alt="Profile 1" className="cardavatar" />
                    </div>
                    <div className="avatar-container">
                      <img src="/profilepic1.png" alt="Profile 2" className="cardavatar" />
                    </div>
                    <div className="avatar-container">
                      <img src="/profilepic3.png" alt="Profile 3" className="cardavatar" />
                    </div>
                    
                    
                  </div>
            </div>
          </div>
          <div className="lowercontentdiv">
            <p>Explore next-gen interview intelligence with Askora — an AI voice bot built to
              <br/>
              simulate real interview pressure. Speak, listen, and respond in natural flow.  
              <br/>
              Askora adapts in real-time using speech tech and context-based questioning to  
              <br/>
             sharpen your skills for high-stakes professional success.
            </p>
          </div>
        </div>
        <div className="imgboxright">
          <img src='/AboutAiBack.png'/>\
          <iframe
            src='https://my.spline.design/voiceinteractionanimation-2TyeWSP24w6QzdGddVpF30we/'
            frameBorder='0'
            width='100%'
            height='100%'
            title="Askora Voice Interaction Animation"
          ></iframe>
          <div className="contentboximg">
            <div className="sameboxdiv">
            <h1 className="joinourplat">join our
              <br/>
              platform
            </h1>
            <div className="vertical-line"></div>
            <p>& learn<br/> how to <br/>start</p>
            <div className="buttonsforai">
              <button className="buttonforaboutai2"></button>
              <button className="buttonforaboutai3">
<MdArrowOutward style={{ color: 'white', fontSize: '25px',fontWeight:'300' }} />
</button>
            </div>
           
            </div>
          </div>
        </div>
      </div>

      
    </div>
  );
};

export default AboutAi;