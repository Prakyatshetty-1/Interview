import "./NavBar.css"

export default function NavBar(){
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

    

    return (
            <header>
            <h1 className="logo">Askora</h1>
            <nav>
                <a href="home" onClick={(e) => handleSmoothScroll(e, "home")}>
                Home
                </a>
                <a href="#about-ai" onClick={(e) => handleSmoothScroll(e, "about-ai")}>
                About AI
                </a>
                <a href="#features" onClick={(e) => handleSmoothScroll(e, "features")}>
                Features
                </a>
                <a href="#pricing" onClick={(e) => handleSmoothScroll(e, "pricing")}>
                Pricing
                </a>
            </nav>
            <div className="buttons">
            <button className="login boton-elegante">Login</button>
            <button className="get-started cosmic ">Get Started &#8594;</button>
            </div>
        </header>

        
    )
}