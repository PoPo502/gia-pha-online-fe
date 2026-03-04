import { useEffect, useState } from "react";
import Topbar from "../components/Topbar.jsx";
import { useAuth } from "../store/auth.jsx";
import { Link } from "react-router-dom";
import { GitBranch, Users, ShieldAlert, Clock, CheckCircle, MessageSquare, Plus } from "lucide-react";
import { moderationService } from "../services/moderation.service.js";
import { personsService } from "../services/persons.service.js";

export default function HomeTreeAdmin() {
    const { me } = useAuth();
    // const [pendingCount, setPendingCount] = useState(0);
    const [recentMembers, setRecentMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadAdminData() {
            try {
                const [pending, members] = await Promise.all([
                    moderationService.getPending(),
                    personsService.list({ limit: 5 })
                ]);
                // setPendingCount(pending?.length || 0);
                setRecentMembers(members?.data || members || []);
            } catch (e) {
                console.error("Failed to load admin data", e);
            } finally {
                setLoading(false);
            }
        }
        loadAdminData();
    }, []);

    return (
        <>
            <Topbar />
            <div className="container" style={{ maxWidth: 1200 }}>
                <div style={{ marginBottom: 32 }}>
                    <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text-dark)" }}>
                        Bảng quản trị Nhánh: <span style={{ color: "var(--primary)" }}>{me?.treeId || "Chi tộc"}</span>
                    </h1>
                    <p style={{ color: "var(--muted)" }}>Chào mừng quay lại, {me?.fullName}. Dưới đây là tóm tắt hoạt động trong nhánh của bạn.</p>
                </div>

                <div className="row" style={{ gap: 24, marginBottom: 32 }}>
                    {/* Stat Cards */}
                    <div className="card" style={{ flex: 1, padding: 24, borderRadius: 20, background: "linear-gradient(135deg, var(--primary), #ff914d)", color: "#fff", border: "none" }}>
                        <div className="row" style={{ justifyContent: "space-between", marginBottom: 12 }}>
                            <ShieldAlert size={32} opacity={0.8} />
                            <Link to="/moderation" style={{ color: "#fff", fontSize: 13, fontWeight: 700, textDecoration: "underline" }}>Xử lý ngay</Link>
                        </div>
                        {/* <div style={{ fontSize: 36, fontWeight: 900 }}>{pendingCount}</div> */}
                        <div style={{ fontWeight: 600, opacity: 0.9 }}>Yêu cầu chờ duyệt</div>
                    </div>

                    <div className="card" style={{ flex: 1, padding: 24, borderRadius: 20 }}>
                        <div className="row" style={{ justifyContent: "space-between", marginBottom: 12 }}>
                            <GitBranch size={32} color="var(--accent)" />
                            <Link to="/persons" style={{ color: "var(--accent)", fontSize: 13, fontWeight: 700 }}>Xem tất cả</Link>
                        </div>
                        <div style={{ fontSize: 36, fontWeight: 900 }}>{recentMembers.length || 0}+</div>
                        <div style={{ fontWeight: 600, color: "var(--muted)" }}>Thành viên mới cập nhật</div>
                    </div>

                    <div className="card" style={{ flex: 1, padding: 24, borderRadius: 20 }}>
                        <div className="row" style={{ justifyContent: "space-between", marginBottom: 12 }}>
                            <Users size={32} color="var(--green)" />
                            <Link to="/admin/branches/my-branch" style={{ color: "var(--green)", fontSize: 13, fontWeight: 700 }}>Cấu hình</Link>
                        </div>
                        <div style={{ fontSize: 36, fontWeight: 900 }}>Active</div>
                        <div style={{ fontWeight: 600, color: "var(--muted)" }}>Trạng thái chi nhánh</div>
                    </div>
                </div>

                <div className="row" style={{ gap: 24, alignItems: "flex-start" }}>
                    {/* Left Column: Recent Activity */}
                    <div style={{ flex: 2 }}>
                        <div className="card" style={{ padding: 24, borderRadius: 20 }}>
                            <div className="row" style={{ justifyContent: "space-between", marginBottom: 20 }}>
                                <h3 style={{ margin: 0, fontWeight: 800 }}>Thành viên mới cập nhật</h3>
                                <Link to="/persons" className="btn small outline" style={{ borderRadius: 10 }}><Plus size={16} /> Thêm người</Link>
                            </div>
                            <div className="stack" style={{ gap: 12 }}>
                                {recentMembers.map(m => (
                                    <div key={m.id || m._id} className="row" style={{ padding: "12px 16px", background: "#f8f9fa", borderRadius: 12, gap: 16 }}>
                                        <div className="avatar" style={{ width: 40, height: 40 }}>{(m.fullName || m.name || "U")[0]}</div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 700 }}>{m.fullName || m.name}</div>
                                            <div className="small" style={{ color: "var(--muted)" }}>Cập nhật 2 giờ trước</div>
                                        </div>
                                        <Link to={`/persons/${m.id || m._id}`} className="btn small primary" style={{ borderRadius: 8 }}>Chi tiết</Link>
                                    </div>
                                ))}
                                {recentMembers.length === 0 && <div style={{ textAlign: "center", padding: 20, color: "var(--muted)" }}>Chưa có thành viên nào.</div>}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Quick Links & Alerts */}
                    <div style={{ flex: 1 }}>
                        <div className="card" style={{ padding: 24, borderRadius: 20, marginBottom: 24 }}>
                            <h3 style={{ margin: "0 0 16px 0", fontWeight: 800 }}>Lối tắt quản trị</h3>
                            <div className="stack" style={{ gap: 8 }}>
                                <Link to="/moderation" className="btn" style={{ justifyContent: "flex-start", padding: 12, background: "rgba(238, 77, 45, 0.05)", border: "none", boxShadow: "none", color: "var(--primary)" }}>
                                    <ShieldAlert size={20} style={{ marginRight: 12 }} /> <b>Kiểm duyệt nội dung</b>
                                </Link>
                                <Link to="/events" className="btn" style={{ justifyContent: "flex-start", padding: 12, background: "rgba(59, 130, 246, 0.05)", border: "none", boxShadow: "none", color: "#3b82f6" }}>
                                    <Clock size={20} style={{ marginRight: 12 }} /> <b>Lịch sự kiện nhánh</b>
                                </Link>
                                <Link to="/media" className="btn" style={{ justifyContent: "flex-start", padding: 12, background: "rgba(16, 185, 129, 0.05)", border: "none", boxShadow: "none", color: "var(--green)" }}>
                                    <CheckCircle size={20} style={{ marginRight: 12 }} /> <b>Quản lý thư viện</b>
                                </Link>
                            </div>
                        </div>

                        <div className="card" style={{ padding: 20, borderRadius: 20, background: "#f0fdf4", border: "1px solid #dcfce7" }}>
                            <div style={{ display: "flex", gap: 12 }}>
                                <MessageSquare size={24} color="var(--green)" />
                                <div>
                                    <div style={{ fontWeight: 800, color: "#166534" }}>Mẹo quản trị</div>
                                    <p className="small" style={{ color: "#15803d", marginTop: 4, lineHeight: 1.4 }}>Hãy thường xuyên kiểm duyệt các yêu cầu chỉnh sửa để thông tin gia phả luôn chính xác nhất.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
