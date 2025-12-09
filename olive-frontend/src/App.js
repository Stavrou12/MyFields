import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import MyFields from "./pages/MyFields";
import AddField from "./pages/AddField";
import MapPage from "./pages/MapPage";
import FieldYearEditor from "./pages/FieldYearEditor";



function App() {
  const { loading, user } = useContext(AuthContext);

  if (loading) return <div className="p-4">Loading…</div>;

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected wrapper */}
      <Route
        element={
          user?.token ? (
            <Layout>
              <Outlet />
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/my-fields" element={<MyFields />} />
        <Route path="/add-field" element={<AddField />} />
        
        <Route path="/map" element={<MapPage />} />
        <Route path="/fields/:id/year/:year" element={<FieldYearEditor />} />


    

      </Route>

      {/* Catch-all redirect */}
      <Route
  element={
    user ? (
      <Layout>
        <Outlet />
      </Layout>
    ) : (
      <Navigate to="/login" replace />
    )
  }
></Route>
    </Routes>
  );
}

export default App;