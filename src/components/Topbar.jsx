import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../store/auth.jsx";

export default function Topbar() {
  const { me, logout } = useAuth();
  const nav = useNavigate();

  return (
    <div className="topbar">
      <div className="topbar-inner">
        <div className="nav">
          <Link to="/" style={{ fontWeight: 700 }}>Gia phả Online</Link>
          <span className="badge">{me?.role || "GUEST"}</span>
        </div>

        <div className="nav">
          <Link className="btn" to="/search/persons">Tìm thành viên</Link>
          <Link className="btn" to="/persons">Danh sách</Link>
          {me?.role === "ADMIN" && <Link className="btn" to="/admin">Admin</Link>}
          <button
            className="btn danger"
            onClick={async () => {
              await logout();
              nav("/login");
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
