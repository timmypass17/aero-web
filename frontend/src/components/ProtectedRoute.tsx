import {useEffect, useState} from "react";
import {Navigate} from "react-router-dom";

function ProtectedRoute({children}: { children: React.ReactNode }) {

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

    // Wait for Spring to tell us
    if (isLoggedIn === null) {
        return <p>Loading...</p>;
    }

    // Spring says we're not authenticated
    if (!isLoggedIn) {
        return <Navigate to="/login" replace/>;
    }

    // Spring says we're authenticated
    return children;
}

export default ProtectedRoute;