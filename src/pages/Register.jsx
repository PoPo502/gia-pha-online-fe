import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../store/auth.jsx";

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    try {
      await register(form);
      nav("/");
    } catch (e2) {
      setErr(e2?.message || "Đăng ký thất bại");
    }
  }

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 460, margin: "40px auto" }}>
        <div style={{ fontWeight: 800, fontSize: 20 }}>Đăng ký</div>
        <div className="small" style={{ marginTop: 6 }}>
          Đã có tài khoản? <Link to="/login" style={{ textDecoration: "underline" }}>Đăng nhập</Link>
        </div>

        <form className="stack" style={{ marginTop: 14 }} onSubmit={onSubmit}>
          <input
            className="input"
            placeholder="Họ tên"
            value={form.name}
            onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
          />
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
          <button className="btn primary" type="submit">Tạo tài khoản</button>
          {err && <div style={{ color: "#d64545" }}>{err}</div>}
        </form>
      </div>
    </div>
  );
}
