"use client"

import { useState, useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import ScrollFloat from "../react-bits/ScrollFloat"
import { useNavigate } from "react-router-dom"
import "./CommunityPage.css"







export default function CommunityPage() {


  const navigate=useNavigate();
  const handleGetStarted = () => navigate('/signup')
  const handleLogin = () => navigate('/login')


  return (
    <div className="community-page">
     <img src="../../public/community.png"/>
     <h1>
      Find Your Tribe,<br/>Build Your Network.
     </h1>
     <p>Connect with like-minded students for fun<br/>friendships, and future opportunities.</p>
     <div className="buttongrp">
 <button className="primary-buttoncomm" onClick={() => navigate("/signup")}>
           Join for Free &rarr;
          </button>
          <button className="primary-buttoncommblack" onClick={() => navigate("/signup")}>
           Explore Communities
          </button>

     </div>
    
          
    </div>
  )
}