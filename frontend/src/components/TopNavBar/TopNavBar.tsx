import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MapSearch from "../MapSearch/MapSearch.tsx";
import "./TopNavBar.css";

interface TopNavBarProps {
    searchRadius: number;
    setSearchRadius: (radius: number) => void;
    onSearch: (query: string, radius: number) => void;
}

function TopNavBar({
                       searchRadius,
                       setSearchRadius,
                       onSearch,
                   }: TopNavBarProps) {

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isNewMenuOpen, setIsNewMenuOpen] = useState(false);

    useEffect(() => {
        fetch("http://localhost:8080/auth/me", {
            credentials: "include",
        })
            .then((response) => {
                setIsLoggedIn(response.ok);
            })
            .catch(() => {
                setIsLoggedIn(false);
            });
    }, []);

    async function handleLogout() {
        const response = await fetch(
            "http://localhost:8080/auth/logout",
            {
                method: "POST",
                credentials: "include",
            }
        );

        if (response.ok) {
            setIsLoggedIn(false);
        }
    }

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

            <MapSearch
                searchRadius={searchRadius}
                setSearchRadius={setSearchRadius}
                onSearch={onSearch}
            />

            <div className="nav-right">

                {isLoggedIn ? (
                    <>
                        <div className="new-menu">
                            <button
                                className="create-route-button"
                                onClick={() => setIsNewMenuOpen(!isNewMenuOpen)}
                            >
                                New
                                <span className="new-menu-arrow">▾</span>
                            </button>

                            {isNewMenuOpen && (
                                <div className="new-menu-dropdown">
                                    <Link
                                        className="new-menu-item"
                                        to="/posts/new"
                                        onClick={() => setIsNewMenuOpen(false)}
                                    >
                                        Post
                                    </Link>

                                    <Link
                                        className="new-menu-item"
                                        to="/routes/new"
                                        onClick={() => setIsNewMenuOpen(false)}
                                    >
                                        Route
                                    </Link>
                                </div>
                            )}
                        </div>

                        <button
                            className="nav-link"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link className="nav-link" to="/login">
                            Login
                        </Link>
                    </>
                )}

            </div>
        </nav>
    );
}

export default TopNavBar;