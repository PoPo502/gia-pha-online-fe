import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../store/auth.jsx";
import Topbar from "../components/Topbar.jsx";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      await login(form);
      nav("/");
    } catch (e2) {
      setErr(e2?.message || "Đăng nhập thất bại. Kiểm tra lại thông tin.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Topbar />
      <div className="auth-wrap">
        <div className="auth-card" style={{ maxWidth: 420 }}>
          <div className="auth-title">Đăng nhập</div>
          <div className="small" style={{ textAlign: "center", marginBottom: 24, color: "var(--text-light)" }}>
            Chào mừng trở lại! Đăng nhập để truy cập Gia phả của bạn.
          </div>

          <form className="stack" onSubmit={onSubmit}>
            <div>
              <div className="small" style={{ marginBottom: 6, fontWeight: 500, color: "var(--text-dark)" }}>Email hoặc Tên đăng nhập</div>
              <input
                className="input"
                placeholder="VD: user@domain.com"
                value={form.email}
                onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
                required
              />
            </div>

            <div>
              <div className="small" style={{ marginBottom: 6, fontWeight: 500, color: "var(--text-dark)" }}>Mật khẩu</div>
              <input
                className="input"
                placeholder="••••••••"
                type="password"
                value={form.password}
                onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
                required
              />
            </div>

            <button className="btn primary" type="submit" disabled={loading} style={{ width: "100%", marginTop: 8, padding: 14 }}>
              {loading ? "Đang xử lý..." : "Đăng nhập hệ thống"}
            </button>

            {err && (
              <div style={{
                color: "var(--danger)", background: "rgba(239, 68, 68, 0.1)",
                padding: "10px", borderRadius: "8px", textAlign: "center", fontSize: 13, border: "1px solid rgba(239, 68, 68, 0.2)"
              }}>
                {err}
              </div>
            )}
          </form>

          <div style={{ display: "flex", alignItems: "center", margin: "24px 0", color: "var(--text-light)" }}>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }}></div>
            <div style={{ margin: "0 12px", fontSize: 13, fontWeight: 500 }}>HOẶC ĐĂNG NHẬP BẰNG</div>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }}></div>
          </div>

          <div className="stack" style={{ gap: 12 }}>
            <a href={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'}/auth/google`} className="btn outline" style={{ width: "100%", padding: 12, justifyContent: "center", gap: 10, textDecoration: "none" }}>
              <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" width="18" height="18" />
              Tiếp tục với Google
            </a>
            <a href={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'}/auth/facebook`} className="btn outline" style={{ width: "100%", padding: 12, justifyContent: "center", gap: 10, textDecoration: "none" }}>
              <img src="https://upload.wikimedia.org/wikipedia/commons/b/b8/2021_Facebook_icon.svg" alt="Facebook" width="18" height="18" />
              Tiếp tục với Facebook
            </a>
            <button className="btn outline" style={{ width: "100%", padding: 12, justifyContent: "center", gap: 10 }}>
              <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" alt="Apple" width="16" height="18" />
              Tiếp tục với Apple
            </button>
          </div>

          <div className="small" style={{ textAlign: "center", marginTop: 24, padding: "16px 0", borderTop: "1px solid var(--border)" }}>
            Chưa có tài khoản?{" "}
            <Link to="/register" style={{ color: "var(--primary)", fontWeight: 600 }}>Đăng ký ngay</Link>
          </div>
        </div>
      </div>
    </>
  );
}
