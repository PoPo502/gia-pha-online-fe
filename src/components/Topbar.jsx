import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../store/auth.jsx";
import { Bell } from "lucide-react";

export default function Topbar() {
  const { me, logout } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isAuthPage = loc.pathname === "/login" || loc.pathname === "/register";

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const handleAvatarClick = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    nav("/login"); // Redirect to login after logout
  };

  const handleProfileClick = () => {
    nav("/profile"); // Navigate to profile page
    setIsDropdownOpen(false);
  };

  const roleStr = String(me?.role || "").toLowerCase();
  const isAdmin = roleStr === "admin" || roleStr === "super_admin";
  const isEditor = roleStr === "editor" || roleStr === "tree_admin";

  const getRoleBadge = (role) => {
    switch (role) {
      case "SUPER_ADMIN": return <span className="badge public" style={{ background: "var(--danger)", color: "#fff" }}>HỆ THỐNG</span>;
      case "TREE_ADMIN": return <span className="badge public" style={{ background: "var(--primary-dark)", color: "#fff" }}>QUẢN TRỊ GIA PHẢ</span>;
      default: return <span className="badge internal" style={{ background: "var(--border)", color: "var(--text-dark)" }}>THÀNH VIÊN</span>;
    }
  };

  return (
    <div className="topbar">
      <div className="topbar-inner" style={{ maxWidth: 1400 }}>
        {/* Logo Section */}
        <div className="nav" style={{ gap: 24 }}>
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ background: "linear-gradient(135deg, #ff4c2d, #ff914d)", color: "#fff", padding: "6px 14px", borderRadius: 10, fontWeight: 900, fontSize: 18, boxShadow: "0 4px 12px rgba(238, 77, 45, 0.25)" }}>GIA PHẢ</div>
            <span style={{ fontWeight: 800, fontSize: 18, color: "#333", letterSpacing: "-0.5px" }}>VIỆT ONLINE</span>
          </Link>

          {/* Center Navigation */}
          {me && (
            <div className="nav" style={{ gap: 28, marginLeft: 20 }}>
              <Link className={loc.pathname === "/" ? "active" : ""} to="/" style={{ fontSize: 14, fontWeight: 600 }}>Cây gia phả</Link>
              <Link className={loc.pathname.includes("/persons") ? "active" : ""} to="/persons" style={{ fontSize: 14, fontWeight: 600 }}>Thành viên</Link>
              <Link className={loc.pathname.includes("/events") ? "active" : ""} to="/events" style={{ fontSize: 14, fontWeight: 600 }}>Sự kiện</Link>
              <Link className={loc.pathname.includes("/media") ? "active" : ""} to="/media" style={{ fontSize: 14, fontWeight: 600 }}>Thư viện</Link>
            </div>
          )}
        </div>

        {/* Right Section: Actions & Profile */}
        <div className="nav" style={{ gap: 16 }}>
          {me && (
            <>
              <button className="btn" style={{ background: "none", border: "none", padding: 8, boxShadow: "none", position: "relative" }}>
                <Bell size={22} color="var(--text-dark)" />
                <span style={{ position: "absolute", top: 4, right: 4, width: 8, height: 8, background: "var(--danger)", borderRadius: "50%", border: "2px solid #fff" }}></span>
              </button>

              {(isAdmin || isEditor) && (
                <Link
                  to={isAdmin ? "/admin" : "/"}
                  className="btn"
                  style={{ background: "var(--accent)", color: "#fff", fontWeight: 800, borderRadius: 10, border: "none", padding: "8px 22px", boxShadow: "0 4px 12px rgba(245, 158, 11, 0.3)" }}
                >
                  ADMIN
                </Link>
              )}

              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={handleAvatarClick}
                  className="btn"
                  style={{ background: "none", border: "none", padding: 0, boxShadow: "none", display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}
                >
                  <div style={{ textAlign: "right", lineHeight: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-dark)" }}>{me.fullName || me.name || "User"}</div>
                    <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600, marginTop: 2 }}>
                        {isAdmin ? "Hệ thống" : isEditor ? "Quản trị" : "Thành viên"}
                    </div>
                  </div>
                  <div className="avatar" style={{ width: 36, height: 36, fontSize: 15, background: "linear-gradient(135deg, var(--primary), var(--accent))", color: "#fff", border: "2px solid #fff" }}>
                    {(me.fullName || me.name || "U").charAt(0).toUpperCase()}
                  </div>
                </button>

                {isDropdownOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: "calc(100% + 10px)",
                      right: 0,
                      background: "#fff",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      zIndex: 100,
                      minWidth: 160,
                      padding: "8px 0",
                    }}
                  >
                    <button
                      onClick={handleProfileClick}
                      style={{
                        display: "block",
                        width: "100%",
                        padding: "10px 16px",
                        textAlign: "left",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: 14,
                        color: "var(--text-dark)",
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--light)"}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                    >
                      Hồ sơ
                    </button>
                    <button
                      onClick={handleLogout}
                      style={{
                        display: "block",
                        width: "100%",
                        padding: "10px 16px",
                        textAlign: "left",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: 14,
                        color: "var(--danger)",
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--light)"}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                    >
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {!me && !isAuthPage && (
            <div style={{ display: "flex", gap: 8 }}>
              <Link className="btn" to="/register">Đăng ký</Link>
              <Link className="btn primary" to="/login">Đăng nhập</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
