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
      const res = await login(form);
      if (res?.user?.isFirstLogin || res?.isFirstLogin) {
        nav("/change-password-mandatory");
      } else {
        nav("/");
      }
    } catch (e2) {
      setErr(e2?.message || "Đăng nhập thất bại. Kiểm tra lại thông tin.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Topbar />
      <div className="auth-wrap" style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 20px" }}>
        <div className="auth-card" style={{ maxWidth: 480, width: "100%", padding: "48px 40px", borderRadius: 24, background: "var(--surface)", boxShadow: "0 20px 40px rgba(0,0,0,0.1)", border: "1px solid var(--border)" }}>
          <div className="auth-title" style={{ marginBottom: 12, fontSize: 28, fontWeight: 900 }}>Đăng nhập</div>
          <div className="small" style={{ textAlign: "center", marginBottom: 36, color: "var(--text-light)", fontSize: 15 }}>
            Chào mừng trở lại! Vui lòng nhập mã ID để truy cập.
          </div>

          <form className="stack" onSubmit={onSubmit} style={{ gap: 20 }}>
            <div>
              <div className="small" style={{ marginBottom: 8, fontWeight: 600, color: "var(--text-dark)" }}>Tên đăng nhập / Mã ID</div>
              <input
                className="input"
                style={{ borderRadius: 12, padding: "14px 16px" }}
                placeholder="VD: NG05001"
                value={form.email}
                onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
                required
              />
            </div>

            <div>
              <div className="small" style={{ marginBottom: 8, fontWeight: 600, color: "var(--text-dark)" }}>Mật khẩu</div>
              <input
                className="input"
                style={{ borderRadius: 12, padding: "14px 16px" }}
                placeholder="••••••••"
                type="password"
                value={form.password}
                onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
                required
              />
            </div>

            <button className="btn primary" type="submit" disabled={loading} style={{ width: "100%", marginTop: 8, padding: 16, borderRadius: 14, fontWeight: 800, fontSize: 16, boxShadow: "none" }}>
              {loading ? "Đang xử lý..." : "Đăng nhập hệ thống"}
            </button>

            {err && (
              <div style={{
                color: "var(--danger)", background: "rgba(239, 68, 68, 0.08)",
                padding: "14px", borderRadius: "12px", textAlign: "center", fontSize: 14, border: "1px solid rgba(239, 68, 68, 0.15)", fontWeight: 500
              }}>
                {err}
              </div>
            )}
          </form>

          <div style={{ display: "flex", alignItems: "center", margin: "40px 0 32px", color: "var(--text-light)" }}>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }}></div>
            <div style={{ margin: "0 16px", fontSize: 13, fontWeight: 600, letterSpacing: "1px", color: "var(--muted)" }}>HOẶC TIẾP TỤC VỚI</div>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }}></div>
          </div>

          <div className="stack" style={{ gap: 12, marginBottom: 8 }}>
            <a href={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'}/auth/google`} className="btn outline" style={{ width: "100%", padding: 14, justifyContent: "center", gap: 10, textDecoration: "none", borderRadius: 12 }}>
              <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" width="18" height="18" />
              Google
            </a>
            <a href={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'}/auth/facebook`} className="btn outline" style={{ width: "100%", padding: 14, justifyContent: "center", gap: 10, textDecoration: "none", borderRadius: 12 }}>
              <img src="https://upload.wikimedia.org/wikipedia/commons/b/b8/2021_Facebook_icon.svg" alt="Facebook" width="18" height="18" />
              Facebook
            </a>
          </div>

          <div className="small" style={{ textAlign: "center", marginTop: 40, padding: "24px 0 0", borderTop: "1px solid var(--border)", color: "var(--text-light)" }}>
            Chưa có tài khoản?{" "}
            <Link to="/register" style={{ color: "var(--primary)", fontWeight: 700 }}>Yêu cầu cấp tài khoản</Link>
          </div>
        </div>
      </div>
    </>
  );
}
