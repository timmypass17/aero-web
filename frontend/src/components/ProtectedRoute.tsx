import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";

function ProtectedRoute() {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

    useEffect(() => {
        fetch("http://localhost:8080/auth/me", {
            credentials: "include",
        })
            .then(response => {
                setIsLoggedIn(response.ok);
            })
            .catch(() => {
                setIsLoggedIn(false);
            });
    }, []);

    if (isLoggedIn === null) {
        return <p>Loading...</p>;
    }

    if (!isLoggedIn) {
        return <Navigate to="/login" replace />;
    }

    {/*Outlet - Renders the matching child route of a parent route*/}
    return <Outlet />
}

export default ProtectedRoute;