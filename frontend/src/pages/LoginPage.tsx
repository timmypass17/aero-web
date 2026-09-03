import { useState } from "react";
import { useNavigate } from "react-router-dom";

function LoginPage() {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();

    async function handleLogin(event: React.SubmitEvent<HTMLFormElement>) {
        event.preventDefault();

        const response = await fetch(
            "http://localhost:8080/auth/login",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                // Include cookies when making this request, even when the frontend and backend are on different origins.
                credentials: "include",
                body: JSON.stringify({
                    username,
                    password,
                }),
            }
        );

        if (response.ok) {
            navigate("/");
        }
    }

    return (
        <div>
            <h1>Login</h1>

            <form onSubmit={handleLogin}>

                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button type="submit">
                    Login
                </button>

            </form>

            <button onClick={() => navigate("/signup")}>
                Sign Up
            </button>
        </div>
    );
}

export default LoginPage;