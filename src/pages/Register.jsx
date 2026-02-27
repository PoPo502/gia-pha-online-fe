import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../store/auth.jsx";
import Topbar from "../components/Topbar.jsx";

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");

    if (form.password !== form.confirmPassword) {
      setErr("Mật khẩu nhập lại không khớp.");
      return;
    }

    setLoading(true);
    try {
      const payload = { fullName: form.name, email: form.email, password: form.password };
      await register(payload);
      nav("/");
    } catch (e2) {
      setErr(e2?.message || "Đăng ký thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Topbar />
      <div className="auth-wrap">
        <div className="auth-card" style={{ maxWidth: 420 }}>
          <div className="auth-title">Đăng ký tài khoản</div>
          <div className="small" style={{ textAlign: "center", marginBottom: 24, color: "var(--text-light)" }}>
            Gia nhập và kết nối với dòng họ của bạn ngay hôm nay.
          </div>

          <form className="stack" onSubmit={onSubmit}>
            <div>
              <div className="small" style={{ marginBottom: 6, fontWeight: 500, color: "var(--text-dark)" }}>Họ và Tên</div>
              <input
                className="input"
                placeholder="VD: Nguyễn Văn A"
                value={form.name}
                onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                required
              />
            </div>

            <div>
              <div className="small" style={{ marginBottom: 6, fontWeight: 500, color: "var(--text-dark)" }}>Email</div>
              <input
                className="input"
                type="email"
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
                minLength={6}
              />
            </div>

            <div>
              <div className="small" style={{ marginBottom: 6, fontWeight: 500, color: "var(--text-dark)" }}>Nhập lại Mật khẩu</div>
              <input
                className="input"
                placeholder="••••••••"
                type="password"
                value={form.confirmPassword}
                onChange={(e) => setForm((s) => ({ ...s, confirmPassword: e.target.value }))}
                required
              />
            </div>

            <button className="btn primary" type="submit" disabled={loading} style={{ width: "100%", marginTop: 8, padding: 14 }}>
              {loading ? "Đang tạo..." : "Đăng ký"}
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
            <div style={{ margin: "0 12px", fontSize: 13, fontWeight: 500 }}>HOẶC ĐĂNG KÝ BẰNG</div>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }}></div>
          </div>

          <div className="stack" style={{ gap: 12 }}>
            <button className="btn outline" style={{ width: "100%", padding: 12, justifyContent: "center", gap: 10 }}>
              <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" width="18" height="18" />
              Đăng ký với Google
            </button>
            <button className="btn outline" style={{ width: "100%", padding: 12, justifyContent: "center", gap: 10 }}>
              <img src="https://upload.wikimedia.org/wikipedia/commons/b/b8/2021_Facebook_icon.svg" alt="Facebook" width="18" height="18" />
              Đăng ký với Facebook
            </button>
            <button className="btn outline" style={{ width: "100%", padding: 12, justifyContent: "center", gap: 10 }}>
              <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" alt="Apple" width="16" height="18" />
              Đăng ký với Apple
            </button>
          </div>

          <div className="small" style={{ textAlign: "center", marginTop: 24, padding: "16px 0", borderTop: "1px solid var(--border)" }}>
            Đã có tài khoản?{" "}
            <Link to="/login" style={{ color: "var(--primary)", fontWeight: 600 }}>Quay lại đăng nhập</Link>
          </div>
        </div>
      </div>
    </>
  );
}
