import {useNavigate} from "react-router-dom";

function HomePage() {

    const navigate = useNavigate();

    async function logout() {
        await fetch("http://localhost:8080/auth/logout", {
            method: "POST",
            credentials: "include",
        });

        navigate("/login");
    }

    return (
        <div>
            <h1>Welcome to the Home Page!</h1>

            <button onClick={logout}>
                Logout
            </button>
        </div>
    );
}

export default HomePage;