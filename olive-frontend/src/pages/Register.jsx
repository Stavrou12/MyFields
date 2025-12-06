import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    await register(name, email, password);
    alert("Account created");
    navigate("/login");
  };

  return (
    <div className="p-5 max-w-md mx-auto">

      <h1 className="text-3xl font-bold mb-4">Register</h1>

      <form onSubmit={submit} className="space-y-4">

        <input className="w-full p-2 border rounded"
          type="text"
          placeholder="Name"
          onChange={(e) => setName(e.target.value)}
        />

        <input className="w-full p-2 border rounded"
          type="email"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input className="w-full p-2 border rounded"
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="w-full bg-green-600 text-white py-2 rounded">
          Register
        </button>
      </form>

      <p className="mt-4">
        Already have an account? <Link to="/login" className="text-blue-500">Login</Link>
      </p>
    </div>
  );
}
