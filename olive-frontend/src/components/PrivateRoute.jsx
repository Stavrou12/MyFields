import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  // Wait while checking localStorage
  if (loading) return <p>Loading...</p>;

  return user ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
