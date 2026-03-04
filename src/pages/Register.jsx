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
      <div className="auth-wrap" style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 20px" }}>
        <div className="auth-card" style={{ maxWidth: 480, width: "100%", padding: "48px 40px", textAlign: "center", borderRadius: 24 }}>
          <div className="auth-title" style={{ marginBottom: 32, fontSize: 28, fontWeight: 900 }}>Đăng ký tài khoản</div>

          <div style={{
            background: "linear-gradient(135deg, rgba(245, 158, 11, 0.08), rgba(245, 158, 11, 0.03))",
            border: "1px solid rgba(245, 158, 11, 0.15)",
            padding: "40px 28px",
            borderRadius: 24,
            marginBottom: 40,
            boxShadow: "0 10px 30px rgba(245, 158, 11, 0.05)"
          }}>
            <div style={{ fontSize: 64, marginBottom: 24 }}>🔒</div>
            <div style={{ fontWeight: 800, color: "var(--text-dark)", fontSize: 20, marginBottom: 16, lineHeight: 1.4 }}>Hệ thống không cho phép đăng ký tự do</div>
            <div className="small" style={{ color: "var(--text-light)", lineHeight: 1.8, fontSize: 15 }}>
              Nhằm bảo mật thông tin dòng họ, vui lòng liên hệ trực tiếp với <strong>Admin</strong> hoặc <strong>Trưởng họ</strong> để được cấp tài khoản thành viên chính thức.
            </div>
          </div>

          <Link to="/login" className="btn primary" style={{ width: "100%", padding: "16px", justifyContent: "center", borderRadius: 14, fontWeight: 800, fontSize: 16, boxShadow: "0 8px 20px rgba(238, 77, 45, 0.2)" }}>
            Quay lại đăng nhập
          </Link>

          <div style={{ marginTop: 32, fontSize: 14, color: "var(--muted)", fontWeight: 500 }}>
            Gia Phả Việt Online • Bảo mật & Huyết thống
          </div>
        </div>
      </div>
    </>
  );
}
