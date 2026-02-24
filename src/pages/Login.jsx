import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../store/auth.jsx";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    try {
      await login(form);
      nav("/");
    } catch (e2) {
      setErr(e2?.message || "Đăng nhập thất bại");
    }
  }

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 460, margin: "40px auto" }}>
        <div style={{ fontWeight: 800, fontSize: 20 }}>Đăng nhập</div>
        <div className="small" style={{ marginTop: 6 }}>
          Chưa có tài khoản? <Link to="/register" style={{ textDecoration: "underline" }}>Đăng ký</Link>
        </div>

        <form className="stack" style={{ marginTop: 14 }} onSubmit={onSubmit}>
          <input
            className="input"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
          />
          <input
            className="input"
            placeholder="Mật khẩu"
            type="password"
            value={form.password}
            onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
          />
          <button className="btn primary" type="submit">Login</button>
          {err && <div style={{ color: "#d64545" }}>{err}</div>}
        </form>
      </div>
    </div>
  );
}
