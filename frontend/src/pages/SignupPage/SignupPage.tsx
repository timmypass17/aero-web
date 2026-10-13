import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SignupPage.css";
import { signup } from "../../services/authService.ts";

function SignupPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<
    string | null
  >(null);
  const [profilePictureError, setProfilePictureError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    if (!profilePicture) {
      setProfilePicturePreview(null);
      return;
    }

    const previewUrl = URL.createObjectURL(profilePicture);
    setProfilePicturePreview(previewUrl);

    return () => URL.revokeObjectURL(previewUrl);
  }, [profilePicture]);

  async function handleSignup(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const response = await signup(
      firstName,
      lastName,
      username,
      password,
      profilePicture,
    );

    if (response.ok) {
      navigate("/login");
    }
  }

  return (
    <main className="signup-page">
      <div className="signup-container">
        <h1>Sign Up</h1>

        <p className="signup-subtitle">Create your Aero account.</p>

        <form className="signup-form" onSubmit={handleSignup}>
          <div className="profile-picture-upload">
            <div className="profile-picture-preview">
              {profilePicturePreview ? (
                <img
                  src={profilePicturePreview}
                  alt="Profile picture preview"
                />
              ) : (
                <span aria-hidden="true">+</span>
              )}
            </div>

            <div className="profile-picture-controls">
              <label className="profile-picture-label" htmlFor="profilePicture">
                Profile picture <span>(optional)</span>
              </label>

              <label
                className="profile-picture-button"
                htmlFor="profilePicture"
              >
                Choose photo
              </label>

              <input
                id="profilePicture"
                name="profilePicture"
                className="profile-picture-input"
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0];

                  if (!file) return;

                  if (!file.type.startsWith("image/")) {
                    setProfilePictureError("Please select an image file.");
                    event.target.value = "";
                    return;
                  }

                  if (file.size > 5 * 1024 * 1024) {
                    setProfilePictureError("Image must be 5 MB or smaller.");
                    event.target.value = "";
                    return;
                  }

                  setProfilePictureError("");
                  setProfilePicture(file);
                }}
              />

              <p className="profile-picture-hint">
                JPG, PNG, or WebP. Max 5 MB.
              </p>

              {profilePictureError && (
                <p className="profile-picture-error" role="alert">
                  {profilePictureError}
                </p>
              )}
            </div>
          </div>

          <div className="name-fields">
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                placeholder="First name"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                autoComplete="given-name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                placeholder="Last name"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                autoComplete="family-name"
                required
              />
            </div>
          </div>
          {/* Username */}
          <div className="form-group">
            <label htmlFor="username">Username</label>

            <input
              id="username"
              name="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
              required
            />
          </div>

          {/* Password */}
          <div className="form-group">
            <label htmlFor="password">Password</label>

            <input
              id="password"
              name="password"
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              required
            />
          </div>

          {/* Submit */}
          <button type="submit" className="signup-button">
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
