import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";


export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const submit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password); // ← email & password are strings from state
      navigate("/");
    } catch (err) {
      alert("Invalid login");
    }
  };

  return (
    <div className="p-5 max-w-md mx-auto">
      <h1 className="text-3xl font-bold mb-4">Login</h1>

      <form onSubmit={submit} className="space-y-4">

        <input
          className="w-full p-2 border rounded mb-3"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full p-2 border rounded mb-4"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="w-full bg-green-600 text-white py-2 rounded">
          Login
        </button>
      </form>

      <p className="mt-4">
        No account? <Link to="/register" className="text-blue-500">Register</Link>
      </p>
    </div>
  );
}
