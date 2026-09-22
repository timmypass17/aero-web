import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SignupPage.css";

function SignupPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();

    async function handleSignup(event: React.SubmitEvent<HTMLFormElement>) {
        event.preventDefault();

        const response = await fetch(
            "http://localhost:8080/auth/signup",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username,
                    password,
                }),
            }
        );

        if (response.ok) {
            navigate("/login");
        }
    }

    return (
        <main className="signup-page">
            <div className="signup-container">
                <h1>Sign Up</h1>

                <p className="signup-subtitle">
                    Create your Aero account.
                </p>

                <form
                    className="signup-form"
                    onSubmit={handleSignup}
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
                            placeholder="Create a password"
                            value={password}
                            onChange={(event) =>
                                setPassword(event.target.value)
                            }
                            autoComplete="new-password"
                            required
                        />
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        className="signup-button"
                    >
                        Create Account
                    </button>
                </form>

                <div className="signup-actions">
                    <button
                        type="button"
                        className="secondary-button"
                        onClick={() => navigate("/login")}
                    >
                        Already have an account?
                    </button>
                </div>
            </div>
        </main>
    );
}

export default SignupPage;