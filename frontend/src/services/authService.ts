export async function login(username: string, password: string) {
  return await fetch("http://localhost:8080/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      username,
      password,
    }),
  });
}

export async function signup(
  firstName: string,
  lastName: string,
  username: string,
  password: string,
  profilePicture: File | null,
) {
  const formData = new FormData();

  formData.append("firstName", firstName);
  formData.append("lastName", lastName);
  formData.append("username", username);
  formData.append("password", password);

  if (profilePicture) {
    formData.append("profilePicture", profilePicture);
  }

  return fetch("http://localhost:8080/auth/signup", {
    method: "POST",
    body: formData,
  });
}
