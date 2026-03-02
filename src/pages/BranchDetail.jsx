import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Topbar from "../components/Topbar.jsx";
import { branchesService } from "../services/branches.service.js";
import { GitBranch, Users, Trash2, Plus, ArrowLeft, Shield } from "lucide-react";

export default function BranchDetail() {
    const { id } = useParams();
    const nav = useNavigate();
    const [branch, setBranch] = useState(null);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");

    async function loadData() {
        setLoading(true);
        try {
            const [bRes, mRes] = await Promise.all([
                branchesService.get(id),
                branchesService.listMembers(id)
            ]);
            setBranch(bRes.data || bRes);
            setMembers(mRes.data || mRes || []);
        } catch (e) {
            setErr("Lỗi khi tải dữ liệu chi nhánh: " + e.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { loadData(); }, [id]);

    const handleRemoveMember = async (userId) => {
        if (!confirm("Bạn có chắc muốn xóa thành viên này khỏi chi nhánh?")) return;
        try {
            await branchesService.removeMember(id, userId);
            alert("Đã gỡ thành viên!");
            loadData();
        } catch (e) {
            alert("Lỗi: " + e.message);
        }
    };

    if (loading) return <><Topbar /><div className="container">Đang tải...</div></>;

    return (
        <>
            <Topbar />
            <div className="container" style={{ maxWidth: 1000 }}>
                <button onClick={() => nav(-1)} className="btn outline" style={{ marginBottom: 20 }}>
                    <ArrowLeft size={16} style={{ marginRight: 8 }} /> Quay lại Admin
                </button>

                {err && <div className="card" style={{ color: "var(--danger)", marginBottom: 20 }}>{err}</div>}

                <div className="dashboard-layout" style={{ gridTemplateColumns: "1fr 350px" }}>
                    <div className="stack" style={{ gap: 24 }}>
                        <div className="card">
                            <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 20 }}>
                                <div className="avatar" style={{ width: 60, height: 60, background: "var(--primary-light)", color: "var(--primary)" }}>
                                    <GitBranch size={32} />
                                </div>
                                <div>
                                    <div className="title-md" style={{ marginBottom: 4 }}>Chi nhánh: {branch?.name}</div>
                                    <div className="small" style={{ color: "var(--text-light)" }}>ID: {id}</div>
                                </div>
                            </div>
                            <p style={{ color: "var(--text-dark)", lineHeight: 1.6 }}>{branch?.description || "Không có mô tả chi tiết cho chi nhánh này."}</p>
                        </div>

                        <div className="card">
                            <div className="row" style={{ justifyContent: "space-between", marginBottom: 20 }}>
                                <div style={{ fontWeight: 700, fontSize: 18, display: "flex", gap: 8, alignItems: "center" }}>
                                    <Users size={20} color="var(--primary)" /> Danh sách Thành viên Quản trị
                                </div>
                                <button className="btn small primary"><Plus size={16} /> Thêm người quản lý</button>
                            </div>

                            <div style={{ border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
                                <table className="table" style={{ margin: 0 }}>
                                    <thead style={{ background: "var(--surface-solid)" }}>
                                        <tr><th>Người dùng</th><th>Vai trò</th><th>Thao tác</th></tr>
                                    </thead>
                                    <tbody>
                                        {members.length === 0 ? (
                                            <tr><td colSpan="3" style={{ textAlign: "center", padding: 20 }}>Chưa có thành viên nào.</td></tr>
                                        ) : members.map((m, index) => {
                                            const userObj = m.userId || {}; 
                                            const uid = userObj._id || userObj;
                                            
                                            return (
                                                <tr key={uid || index}>
                                                    <td style={{ fontWeight: 600 }}>
                                                        <div>{userObj.fullName || "Người dùng ẩn"}</div>
                                                        <div className="small" style={{ color: "var(--muted)", fontWeight: "normal" }}>
                                                            {userObj.email || ""}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className="badge internal" style={{ textTransform: "uppercase" }}>
                                                            {m.roleInBranch || "VIEWER"}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <button 
                                                            onClick={() => handleRemoveMember(uid)} 
                                                            style={{ color: "var(--danger)", background: "none", border: "none", cursor: "pointer" }}
                                                            title="Gỡ thành viên"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <aside>
                        <div className="card">
                            <div style={{ fontWeight: 700, marginBottom: 16 }}>Thông tin bổ sung</div>
                            <div className="stack" style={{ gap: 12 }}>
                                <div>
                                    <label className="small" style={{ color: "var(--text-light)" }}>Cấp độ phả đồ</label>
                                    <div style={{ fontWeight: 600 }}>{branch?.level || "Gốc (Level 0)"}</div>
                                </div>
                                <hr style={{ border: "none", borderTop: "1px solid var(--border)" }} />
                                <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--green)", fontWeight: 700 }}>
                                    <Shield size={16} /> Chi nhánh an toàn
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </>
    );
}
