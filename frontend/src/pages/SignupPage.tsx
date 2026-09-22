import { useState } from "react";
import { useNavigate } from "react-router-dom";

function SignupPage() {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();

    async function handleSignup(event: React.SubmitEvent<HTMLFormElement>) {
        event.preventDefault();

        const response = await fetch("http://localhost:8080/auth/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username,
                password,
            }),
        });

        if (response.ok) {
            navigate("/login");
        }
    }

    return (
        <div>
            <h1>Sign Up</h1>

            <form onSubmit={handleSignup}>
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
                    Create Account
                </button>
            </form>

            <button onClick={() => navigate("/login")}>
                Already have an account?
            </button>
        </div>
    );
}

export default SignupPage;