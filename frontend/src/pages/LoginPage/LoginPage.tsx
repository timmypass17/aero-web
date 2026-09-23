import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";
import {login} from "../../services/authService.ts";

function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();

    async function handleLogin(event: React.SubmitEvent<HTMLFormElement>) {
        event.preventDefault();

        const response = await login(username, password);

        if (response.ok) {
            navigate("/");
        }
    }

    return (
        <main className="login-page">
            <div className="login-container">
                <h1>Login</h1>

                <p className="login-subtitle">
                    Sign in to your Aero account.
                </p>

                <form
                    className="login-form"
                    onSubmit={handleLogin}
                >
                    {/* Username */}
                    <div className="form-group">
                        <label htmlFor="username">
                            Username
                        </label>

                        <input
                            id="username"
                            name="username"
                            type="text"
                            placeholder="Enter your username"
                            value={username}
                            onChange={(event) =>
                                setUsername(event.target.value)
                            }
                            autoComplete="username"
                            required
                        />
                    </div>

                    {/* Password */}
                    <div className="form-group">
                        <label htmlFor="password">
                            Password
                        </label>

                        <input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(event) =>
                                setPassword(event.target.value)
                            }
                            autoComplete="current-password"
                            required
                        />
                    </div>

                    {/* Login */}
                    <button
                        type="submit"
                        className="login-button"
                    >
                        Login
                    </button>
                </form>

                <div className="login-actions">
                    <button
                        type="button"
                        className="primary-button"
                        onClick={() => navigate("/signup")}
                    >
                        Sign Up
                    </button>

                    <button
                        type="button"
                        className="secondary-button"
                        onClick={() => navigate("/")}
                    >
                        Continue as Guest
                    </button>
                </div>
            </div>
        </main>
    );
}

export default LoginPage;