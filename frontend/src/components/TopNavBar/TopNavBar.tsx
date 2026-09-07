import { Link } from "react-router-dom";
import "../../styles/TopNavBar.css";

function TopNavBar() {
    return (
        <nav className="top-nav">
            <div className="nav-left">
                <Link className="nav-logo" to="/">
                    aero
                </Link>

                <Link className="nav-link" to="/">
                    Home
                </Link>

                <Link className="nav-link" to="/map">
                    Map
                </Link>
            </div>

            <div className="nav-right">
                <Link className="nav-link" to="/login">
                    Login
                </Link>
            </div>
        </nav>
    );
}

export default TopNavBar;