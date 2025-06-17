import "./NavBar.css"
import { useNavigate } from 'react-router-dom'

export default function NavBar(){
    const navigate = useNavigate()
    
    function HandleClick(){
        navigate('')
    }
    
    return (
        <div className="fixed">
            <header>
                <h1 className="logo">Askora</h1>
                <nav>
                    <a href="#">Home</a>
                    <a href="#">About AI</a>
                    <a href="#">Features</a>
                    <a href="#">Pricing</a>
                    <a href="#">Reviews</a>
                </nav>
                <div className="buttons">
                    <button className="login boton-elegante">Login</button>
                    <button 
                        className="get-started cosmic" 
                        onClick={HandleClick}
                    >
                        Get Started &#8594;
                    </button>
                </div>
            </header>
        </div>
    )
}