import "./NavBar.css"

export default function NavBar(){

    return (
            <header>
            <h1 className="logo">Askora</h1>
            <nav>
                <a href="#">Home</a>
                <a href="#">About AI</a>
                <a href="#">Features</a>
                <a href="#">Pricing</a>
            </nav>
            <div className="buttons">
            <button className="login boton-elegante">Login</button>
            <button className="get-started cosmic ">Get Started &#8594;</button>
            </div>
        </header>

        
    )
}