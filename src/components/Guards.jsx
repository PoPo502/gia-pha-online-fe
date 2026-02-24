import { Navigate } from "react-router-dom";
import { useAuth } from "../store/auth.jsx";

export function RequireAuth({ children }) {
  const { me, loading } = useAuth();
  if (loading) return <div className="container"><div className="card">Loading...</div></div>;
  if (!me) return <Navigate to="/login" replace />;
  return children;
}

export function RequireRole({ role, children }) {
  const { me, loading } = useAuth();
  if (loading) return <div className="container"><div className="card">Loading...</div></div>;
  if (!me) return <Navigate to="/login" replace />;
  if (me.role !== role) return <Navigate to="/" replace />;
  return children;
}
