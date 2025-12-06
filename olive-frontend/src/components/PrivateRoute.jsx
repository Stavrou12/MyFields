import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
    console.log("🔐 PrivateRoute sees user:", user); // ← add this
  return user?.token ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
