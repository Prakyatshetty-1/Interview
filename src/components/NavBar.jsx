import "./NavBar.css"
import { useNavigate } from 'react-router-dom'


export default function NavBar() {
  const handleSmoothScroll = (e, targetId) => {
    e.preventDefault()
    const targetElement = document.getElementById(targetId)
    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }
  }
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/signup');
  };

  return (
    <div className="fixed">
      <header>
        <h1 className="logo">Askora</h1>
        <nav>
          <a href="#home" onClick={(e) => handleSmoothScroll(e, "home")}>
            Home
          </a>
          <a href="#about-ai" onClick={(e) => handleSmoothScroll(e, "about-ai")}>
            About AI
          </a>
          <a href="#Features" onClick={(e) => handleSmoothScroll(e, "Features")}>
            Features
          </a>
          <a href="#pricing" onClick={(e) => handleSmoothScroll(e, "pricing")}>
            Pricing
          </a>
          <a href="#community" onClick={(e) => handleSmoothScroll(e, "community")}>
            Community
          </a>
        </nav>
        <div className="buttons">
          <button className="login boton-elegante">Login</button>
          <button className="get-started cosmic " onClick={handleClick}>Get Started &#8594;</button>
        </div>
      </header>
    </div>
  )


}