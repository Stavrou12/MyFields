import { useContext } from "react";
import { Link, Outlet } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Layout() {
  const { logout } = useContext(AuthContext);

  return (
    <div className="min-h-screen flex flex-col bg-green-50">
      {/* Header */}
      <header className="bg-green-700 text-white p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">🫒 Olive Manager</h1>
        <button
          onClick={() => {
            logout();
            window.location.href = "/login"; // hard redirect to login
          }}
          className="bg-green-900 px-3 py-1 rounded hover:bg-green-800"
        >
          Logout
        </button>
      </header>

      {/* Menu */}
      <nav className="bg-green-600 text-white p-3 flex gap-4">
        <Link to="/" className="hover:underline">Dashboard</Link>
        <Link to="/my-fields" className="hover:underline">My Fields</Link>
      </nav>

      {/* Content */}
      <main className="flex-1 p-4">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-green-800 text-white p-3 text-center text-sm">
        © 2025 Olive Field Manager
      </footer>
    </div>
  );
}