import { useEffect, useState } from "react";
import Topbar from "../components/Topbar.jsx";
import { useAuth } from "../store/auth.jsx";
import { Link } from "react-router-dom";
import { Activity, Users, GitBranch, ShieldAlert, History, Megaphone, Database, Plus, Search } from "lucide-react";
import { branchesService } from "../services/branches.service.js";
import { systemService } from "../services/system.service.js";

export default function HomeSuperAdmin() {
    const { me } = useAuth();
    const [stats, setStats] = useState({ branches: 0, users: 0, pendingReports: 0 });
    const [loading, setLoading] = useState(true);
    const [health, setHealth] = useState(null);

    useEffect(() => {
        async function loadSystemStats() {
            try {
                const [branches, sysHealth] = await Promise.all([
                    branchesService.list(),
                    systemService.getHealth()
                ]);
                setStats({
                    branches: branches?.length || 0,
                    users: 0, // Placeholder for global users
                    pendingReports: 0
                });
                setHealth(sysHealth);
            } catch (e) {
                console.error("Failed to load system stats", e);
            } finally {
                setLoading(false);
            }
        }
        loadSystemStats();
    }, []);

    return (
        <>
            <Topbar />
            <div className="container" style={{ maxWidth: 1200 }}>
                <div style={{ marginBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                    <div>
                        <h1 style={{ fontSize: 32, fontWeight: 900, color: "var(--text-dark)", margin: 0 }}>
                            Quản trị Hệ thống
                        </h1>
                        <p style={{ color: "var(--muted)", marginTop: 8 }}>Tổng quan toàn bộ mạng lưới Gia phả Online.</p>
                    </div>
                    <div className="row" style={{ gap: 12 }}>
                        <Link to="/admin" className="btn primary" style={{ borderRadius: 12, padding: "12px 24px", fontWeight: 700 }}>
                            <Activity size={20} style={{ marginRight: 8 }} /> Bảng điều khiển chi tiết
                        </Link>
                    </div>
                </div>

                {/* Global Stats Grid */}
                <div className="row" style={{ gap: 20, marginBottom: 32 }}>
                    <div className="card" style={{ flex: 1, padding: 24, borderRadius: 24, border: "none", background: "#f0f9ff", color: "#0369a1" }}>
                        <GitBranch size={40} opacity={0.3} style={{ marginBottom: 16 }} />
                        <div style={{ fontSize: 40, fontWeight: 900 }}>{stats.branches}</div>
                        <div style={{ fontWeight: 700, fontSize: 16 }}>Dòng họ / Chi nhánh</div>
                    </div>

                    <div className="card" style={{ flex: 1, padding: 24, borderRadius: 24, border: "none", background: "#fef2f2", color: "#b91c1c" }}>
                        <ShieldAlert size={40} opacity={0.3} style={{ marginBottom: 16 }} />
                        <div style={{ fontSize: 40, fontWeight: 900 }}>{stats.pendingReports}</div>
                        <div style={{ fontWeight: 700, fontSize: 16 }}>Báo cáo vi phạm</div>
                    </div>

                    <div className="card" style={{ flex: 1, padding: 24, borderRadius: 24, border: "none", background: "#f0fdf4", color: "#15803d" }}>
                        <Database size={40} opacity={0.3} style={{ marginBottom: 16 }} />
                        <div style={{ fontSize: 40, fontWeight: 900 }}>{health?.status === "ok" ? "Hữu hạn" : "Ổn định"}</div>
                        <div style={{ fontWeight: 700, fontSize: 16 }}>Sức khỏe Hệ thống</div>
                    </div>
                </div>

                <div className="row" style={{ gap: 24, alignItems: "flex-start" }}>
                    {/* Main Area: Tree Management Preview */}
                    <div style={{ flex: 2 }}>
                        <div className="card" style={{ padding: 28, borderRadius: 24 }}>
                            <div className="row" style={{ justifyContent: "space-between", marginBottom: 24 }}>
                                <h2 style={{ margin: 0, fontWeight: 800 }}>Quản lý Cây gia phả</h2>
                                <div style={{ display: "flex", gap: 12 }}>
                                    <div style={{ position: "relative" }}>
                                        <Search size={18} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
                                        <input placeholder="Tìm kiếm họ tộc..." style={{ padding: "10px 10px 10px 40px", borderRadius: 12, border: "1px solid var(--border)", background: "#f8f9fa" }} />
                                    </div>
                                    <button className="btn primary small" style={{ borderRadius: 12 }}><Plus size={18} /> Tạo mới</button>
                                </div>
                            </div>

                            <div className="stack" style={{ gap: 16 }}>
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="row" style={{ padding: 20, background: "#f8f9fa", borderRadius: 16, border: "1px solid #f1f1f1", justifyContent: "space-between" }}>
                                        <div className="row" style={{ gap: 20 }}>
                                            <div style={{ width: 52, height: 52, background: "var(--primary-light)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 20, color: "var(--primary)" }}>
                                                {(i === 1 ? "Nguyễn" : i === 2 ? "Trần" : "Lê")[0]}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 800, fontSize: 18 }}>Họ tộc {i === 1 ? "Nguyễn" : i === 2 ? "Trần" : "Lê"}</div>
                                                <div className="small" style={{ color: "var(--muted)", marginTop: 4 }}>ID: tree_{i} • 120 thành viên • 4 chi nhánh</div>
                                            </div>
                                        </div>
                                        <Link to={`/admin/branches/tree_${i}`} className="btn outline small" style={{ borderRadius: 10 }}>Quản lý</Link>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar: System Logs & Broadcasts */}
                    <div style={{ flex: 1 }}>
                        <div className="card" style={{ padding: 24, borderRadius: 24, marginBottom: 24 }}>
                            <h3 style={{ margin: "0 0 20px 0", fontWeight: 800, display: "flex", alignItems: "center", gap: 10 }}>
                                <History size={22} color="var(--primary)" /> Nhật ký hệ thống
                            </h3>
                            <div className="stack" style={{ gap: 16 }}>
                                <div className="small" style={{ borderLeft: "2px solid var(--border)", paddingLeft: 16, position: "relative" }}>
                                    <div style={{ position: "absolute", left: -5, top: 2, width: 8, height: 8, borderRadius: "50%", background: "var(--primary)" }}></div>
                                    <div style={{ fontWeight: 700 }}>Cập nhật Server</div>
                                    <div style={{ color: "var(--muted)", fontSize: 11 }}>15 phút trước</div>
                                </div>
                                <div className="small" style={{ borderLeft: "2px solid var(--border)", paddingLeft: 16, position: "relative" }}>
                                    <div style={{ position: "absolute", left: -5, top: 2, width: 8, height: 8, borderRadius: "50%", background: "var(--border)" }}></div>
                                    <div style={{ fontWeight: 700 }}>Backup dữ liệu hoàn tất</div>
                                    <div style={{ color: "var(--muted)", fontSize: 11 }}>4 giờ trước</div>
                                </div>
                            </div>
                        </div>

                        <div className="card" style={{ padding: 24, borderRadius: 24, background: "linear-gradient(135deg, #1e293b, #0f172a)", color: "#fff", border: "none" }}>
                            <h3 style={{ margin: "0 0 12px 0", fontWeight: 800, color: "#94a3b8" }}>
                                <Megaphone size={20} style={{ marginRight: 8, verticalAlign: "middle" }} /> Thông báo hệ thống
                            </h3>
                            <p style={{ fontSize: 14, opacity: 0.8, lineHeight: 1.6 }}>Gửi thông báo quan trọng đến toàn bộ thành viên trên ứng dụng.</p>
                            <button className="btn" style={{ width: "100%", marginTop: 12, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", fontWeight: 700, borderRadius: 10 }}>Soạn tin nhắn</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
