import ShinyText from '../react-bits/ShinyText';
import './HeaderCard.css';
export default function HeaderCard(){
    return(
        <div className="header-card">
            <ShinyText text="Get early access" disabled={false} speed={3} className='earlyaccess' />
            <div className="head-text-section">
                <h1>Unlock premium to
                    <br/>
                explore more features.
                </h1>
                
            </div>
            
        </div>
    )
}