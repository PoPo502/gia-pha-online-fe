import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Topbar from "../components/Topbar.jsx";
import { authService } from "../services/auth.service.js";
import { ShieldCheck, Lock, ArrowRight } from "lucide-react";

export default function ChangePasswordMandatory() {
    const [form, setForm] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");
    const nav = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErr("");

        if (form.newPassword !== form.confirmPassword) {
            setErr("Mật khẩu mới không khớp.");
            return;
        }

        setLoading(true);
        try {
            await authService.changePasswordMandatory({
                oldPassword: form.oldPassword,
                newPassword: form.newPassword
            });
            alert("Đổi mật khẩu thành công! Chào mừng bạn đến với hệ thống.");
            nav("/");
        } catch (e2) {
            setErr(e2.message || "Lỗi khi đổi mật khẩu.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Topbar />
            <div className="auth-wrap" style={{ background: "var(--surface)" }}>
                <div className="auth-card" style={{ maxWidth: 450 }}>
                    <div style={{ textAlign: "center", marginBottom: 24 }}>
                        <div className="avatar" style={{ width: 64, height: 64, margin: "0 auto 16px", background: "var(--primary-light)", color: "var(--primary)" }}>
                            <ShieldCheck size={32} />
                        </div>
                        <div className="title-md">Thiết lập mật khẩu lần đầu</div>
                        <p className="small" style={{ color: "var(--text-light)", marginTop: 8 }}>
                            Tài khoản của bạn vừa được khởi tạo. Vui lòng đổi mật khẩu mặc định để tiếp tục sử dụng.
                        </p>
                    </div>

                    <form className="stack" onSubmit={handleSubmit} style={{ gap: 16 }}>
                        <div>
                            <label className="small" style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>Mật khẩu hiện tại (Ngày sinh DDMMYY)</label>
                            <div className="row" style={{ position: "relative" }}>
                                <Lock size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
                                <input
                                    className="input"
                                    type="password"
                                    style={{ paddingLeft: 36 }}
                                    required
                                    value={form.oldPassword}
                                    onChange={e => setForm(s => ({ ...s, oldPassword: e.target.value }))}
                                    placeholder="VD: 150595"
                                />
                            </div>
                        </div>

                        <hr style={{ border: "none", borderTop: "1px dashed var(--border)", margin: "8px 0" }} />

                        <div>
                            <label className="small" style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>Mật khẩu mới</label>
                            <div className="row" style={{ position: "relative" }}>
                                <Lock size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
                                <input
                                    className="input"
                                    type="password"
                                    style={{ paddingLeft: 36 }}
                                    required
                                    minLength={6}
                                    value={form.newPassword}
                                    onChange={e => setForm(s => ({ ...s, newPassword: e.target.value }))}
                                    placeholder="Tối thiểu 6 ký tự"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="small" style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>Nhập lại mật khẩu mới</label>
                            <div className="row" style={{ position: "relative" }}>
                                <Lock size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
                                <input
                                    className="input"
                                    type="password"
                                    style={{ paddingLeft: 36 }}
                                    required
                                    value={form.confirmPassword}
                                    onChange={e => setForm(s => ({ ...s, confirmPassword: e.target.value }))}
                                />
                            </div>
                        </div>

                        {err && (
                            <div style={{ color: "var(--danger)", padding: 12, background: "rgba(239,68,68,0.1)", borderRadius: 8, fontSize: 13, border: "1px solid rgba(239,68,68,0.2)" }}>
                                {err}
                            </div>
                        )}

                        <button className="btn primary" type="submit" disabled={loading} style={{ width: "100%", padding: 14, marginTop: 8, justifyContent: "center", gap: 8 }}>
                            {loading ? "Đang xử lý..." : (<>Xác nhận đổi mật khẩu <ArrowRight size={18} /></>)}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}
