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
          <div className="card" style={{ background: "rgba(245, 158, 11, 0.1)", border: "1px solid rgba(245, 158, 11, 0.2)", padding: 20, textAlign: "center", marginBottom: 24 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
            <div style={{ fontWeight: 700, color: "var(--text-dark)", marginBottom: 8 }}>Hệ thống không cho phép đăng ký tự do</div>
            <div className="small" style={{ color: "var(--text-light)", lineHeight: 1.6 }}>
              Vui lòng liên hệ Admin hoặc Trưởng họ của bạn để được cấp tài khoản thành viên.
            </div>
          </div>

          <div style={{ textAlign: "center" }}>
            <Link to="/login" className="btn primary" style={{ width: "100%", justifyContent: "center" }}>Quay lại đăng nhập</Link>
          </div>
        </div>
      </div>
    </>
  );
}
