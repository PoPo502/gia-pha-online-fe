import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../store/auth.jsx";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const res = await login(form);
      if (res?.user?.isFirstLogin || res?.isFirstLogin) {
        nav("/change-password-mandatory");
      } else {
        nav("/dashboard");
      }
    } catch (e2) {
      setErr(e2?.message || "Đăng nhập thất bại. Kiểm tra lại thông tin.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-v2-wrapper">
      {/* BÊN TRÁI – Branding Panel */}
      <div className="login-v2-left">
        <div className="login-v2-overlay"></div>
        <Link to="/" className="login-v2-brand-link">
          <div className="login-v2-brand">
            <img
              src="/logo-gia-pha.png"
              alt="Logo Gia Phả Đại Việt"
              className="login-v2-logo"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <h1 className="login-v2-brand-title">GIA PHẢ ĐẠI VIỆT</h1>
            <p className="login-v2-brand-sub">Phần mềm gia phả trực tuyến</p>
            <div className="login-v2-divider"></div>
            <ul className="login-v2-features">
              <li><i className="bi bi-shield-check"></i> Tạo và quản lý phả đồ dòng họ</li>
              <li><i className="bi bi-images"></i> Lưu trữ hình ảnh, sự kiện gia tộc</li>
              <li><i className="bi bi-people"></i> Kết nối các thế hệ trong gia đình</li>
              <li><i className="bi bi-lock"></i> Bảo mật thông tin dòng họ</li>
            </ul>
          </div>
        </Link>
        <div className="login-v2-dragon-pair">
          <img src="/dragon-banner.png" alt="" className="login-v2-dragon login-v2-dragon-l" />
          <img src="/dragon-banner.png" alt="" className="login-v2-dragon login-v2-dragon-r" />
        </div>
      </div>

      {/* BÊN PHẢI – Form Panel */}
      <div className="login-v2-right">
        <div className="login-v2-form-wrapper">
          <div className="login-v2-form-header">
            <Link to="/" className="login-v2-back-link">
              <i className="bi bi-arrow-left"></i> Trang chủ
            </Link>
            <h2 className="login-v2-title">Đăng nhập</h2>
            <p className="login-v2-subtitle">Chào mừng bạn trở lại! Vui lòng đăng nhập để tiếp tục.</p>
          </div>

          <form onSubmit={onSubmit} className="login-v2-form">
            <div className="login-v2-field">
              <label className="login-v2-label">
                <i className="bi bi-person"></i> Tên đăng nhập / Mã ID
              </label>
              <input
                className="login-v2-input"
                placeholder="Nhập tên đăng nhập hoặc mã ID"
                value={form.email}
                onChange={(e) => setForm(s => ({ ...s, email: e.target.value }))}
                onInvalid={(e) => e.target.setCustomValidity("Vui lòng điền vào trường này.")}
                onInput={(e) => e.target.setCustomValidity("")}
                required
                autoComplete="username"
              />
            </div>

            <div className="login-v2-field">
              <label className="login-v2-label">
                <i className="bi bi-lock"></i> Mật khẩu
              </label>
              <div className="login-v2-pwd-wrap">
                <input
                  className="login-v2-input"
                  placeholder="Nhập mật khẩu"
                  type={showPwd ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm(s => ({ ...s, password: e.target.value }))}
                  onInvalid={(e) => e.target.setCustomValidity("Vui lòng điền vào trường này.")}
                  onInput={(e) => e.target.setCustomValidity("")}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="login-v2-eye-btn"
                  onClick={() => setShowPwd(v => !v)}
                  tabIndex={-1}
                >
                  <i className={`bi ${showPwd ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                </button>
              </div>
            </div>

            <div className="login-v2-forgot">
              <Link to="#">Quên mật khẩu?</Link>
            </div>

            {err && (
              <div className="login-v2-error">
                <i className="bi bi-exclamation-triangle"></i> {err}
              </div>
            )}

            <button className="login-v2-btn" type="submit" disabled={loading}>
              {loading ? (
                <><span className="login-v2-spinner"></span> Đang xử lý...</>
              ) : (
                <><i className="bi bi-box-arrow-in-right"></i> Đăng nhập</>
              )}
            </button>
          </form>

          <div className="login-v2-register">
            Chưa có tài khoản? <Link to="/register">Liên hệ đăng ký</Link>
          </div>

          <div className="login-v2-footer-note">
            © 2024 Gia Phả Đại Việt Online · <a href="https://cloudzone.vn" target="_blank" rel="noreferrer">Cloudzone</a>
          </div>
        </div>
      </div>
    </div>
  );
}
