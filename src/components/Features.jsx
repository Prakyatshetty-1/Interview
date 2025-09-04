"use client"

import { useState, useEffect } from "react"
import "./Features.css"

export default function Features() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  return (
    <div className={`gradient-grid ${isLoaded ? "loaded" : ""}`}>
      <div className="pricing-bg-orbss">
        <div className="pricing-orbb pricing-orbs1"></div>
    
  
      </div>
      <div className="featurecontainer">
        <div className="featurebox1">
          <div className="titels">
            <h1 className="firstmay">Bright</h1> <h1 className="secmay">Future</h1>
          </div>
      
          <p>With the right guidance, tools, and mindset, your future isn’t just something to wait for — it's something you create. </p>
      <div className="letsworktogether"><h1>Let's work together</h1></div>
      
        </div>
        <div className="otherfeatherbox">
          <div className="topotherfeaturebox">
            <div className="texttopboxouter">
              <div className="textboxuppertext">
                <h1>We build</h1>
                <div className="circleforfeature"></div>
              </div>
              <div className="textboxmiddletext">
                <h1>digital</h1>
                <div className="verticalline"></div>
                </div>
              <div className="textboxbottomtext">
                <h1>ex<span className="textpurple">periences.</span></h1>
              </div>
            </div>
            <div className="rocketbox">
              <div className="ubox">
                <h1 className="uptext">Best</h1>
                <h1 className="dntext">The Plan</h1>
              </div>
              <img src="https://res.cloudinary.com/dmbavexyg/image/upload/f_auto,q_auto/v1756975093/askora_public/features1.png"
              loading="lazy"/>
            </div>
          </div>
          <div className="bottomotherfeaturebox">
            <div className="bottomotherboxouter">
              <div className="bottomboxouter1">
                  <h1>Experience Smooth UI</h1>
                  <div className="glare"></div>
                  <div className="bottomboxcircle3"></div>
                  <div className="bottomboxcircle4"></div>
                
                <img 
  class="mockup" 
  src="https://res.cloudinary.com/dmbavexyg/image/upload/f_auto,q_auto/v1756975095/askora_public/features2.png" 
  alt="features"
  loading="lazy"
/>
              </div>
              <div className="bottomboxouter2">
                <div className="bottomboxbox"></div>
                <img src="https://res.cloudinary.com/dmbavexyg/image/upload/f_auto,q_auto/v1756975192/askora_public/star.png"
                loading="lazy"></img>
                <h1>All around<br/> the globe</h1>
                <p>500 clients accross <br/> 15 countries</p>
                <div className="bottomboxcircle1"></div>
                <div className="bottomboxcircle2"></div>

                <div className="bottom">

                  
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
      
    </div>
  )
}
