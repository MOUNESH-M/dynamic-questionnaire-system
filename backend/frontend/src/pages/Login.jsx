import { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();

    const login = async () => {
        if (!email || !password) {
            alert("Please fill all fields");
            return;
        }

        try {
            const response = await api.post("/auth/login", {
                email,
                password
            });

            const token = response.data.accessToken;

            // store token
            localStorage.setItem("token", token);

            console.log("LOGIN SUCCESS:", response.data);

            alert("Login Successful");

            // redirect to dashboard
            navigate("/admin");

        } catch (error) {
            console.error("LOGIN ERROR:", error.response?.data || error.message);
            alert("Invalid credentials");
        }
    };

    return (
        <div>
            <h2>Login</h2>

            <input
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />

            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />

            <button onClick={login}>
                Login
            </button>
        </div>
    );
}

export default Login;