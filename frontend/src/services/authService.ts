
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

export async function signup(username: string, password: string) {
    return fetch(
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
}