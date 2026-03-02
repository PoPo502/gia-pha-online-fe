import { useEffect, useState } from "react";
import Topbar from "../components/Topbar.jsx";
import { DEV_BYPASS_AUTH, DEV_ME } from "../dev/devConfig.js";
import { Activity, Users as UsersIcon, GitBranch, ShieldAlert, History, Megaphone, Database, Plus } from "lucide-react";
import { branchesService } from "../services/branches.service.js";
import { usersService } from "../services/users.service.js";
import { systemService } from "../services/system.service.js";

export default function Admin() {
  const [activeTab, setActiveTab] = useState("trees"); // trees | users
  const [trees, setTrees] = useState([]);
  const [users, setUsers] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);
  const [healthStatus, setHealthStatus] = useState("100%");
  const [checkingHealth, setCheckingHealth] = useState(false);

  // Mock Global Events (BE spec không đề cập rõ service này)
  const [globalEvents, setGlobalEvents] = useState([
    { id: 1, title: "Chúc mừng năm mới Giáp Thìn", status: "Active", type: "Banner" },
    { id: 2, title: "Thông báo bảo trì hệ thống 00:00", status: "Inactive", type: "Alert" }
  ]);

  // Mock Audit Logs (Sẽ cập nhật khi BE có endpoint)
  const [auditLogs] = useState([
    { id: 1, time: "27/02/2026 10:30", user: "system_admin", action: "Tạo Cây Gia phả mới", target: "Nhánh họ Trần" },
    { id: 2, time: "27/02/2026 09:15", user: "system_admin", action: "Gán quyền TREE_ADMIN", target: "User ID 456" },
    { id: 3, time: "26/02/2026 16:45", user: "tree_admin_1", action: "Duyệt bài đăng", target: "Post ID 999" },
    { id: 4, time: "26/02/2026 14:20", user: "system_admin", action: "Bật Global Banner", target: "Năm mới" },
  ]);

  async function load() {
    setErr("");
    setLoading(true);
    try {
      const [treesRes, usersRes] = await Promise.all([
        branchesService.list({ limit: 50 }),
        usersService.list({ limit: 50 })
      ]);

      setTrees(Array.isArray(treesRes.data) ? treesRes.data : (treesRes.data?.data || []));
      setUsers(Array.isArray(usersRes.data) ? usersRes.data : (usersRes.data?.data || []));
    } catch (e) {
      setErr(e.message || "Không thể tải dữ liệu quản trị từ Backend");
    } finally {
      setLoading(false);
    }
  }

  async function checkHealth() {
    setCheckingHealth(true);
    try {
      const res = await systemService.health();
      if (res.status === "ok" || res.success) {
        setHealthStatus("Excellent");
        alert("Hệ thống đang hoạt động ổn định!");
      } else {
        setHealthStatus("Warning");
      }
    } catch (e) {
      setHealthStatus("Error");
      setErr("Lỗi kiểm tra sức khỏe hệ thống: " + e.message);
    } finally {
      setCheckingHealth(false);
    }
  }

  async function handleBan(userId, isBanned) {
    if (!confirm(`Bạn có chắc muốn ${isBanned ? "gỡ bỏ lệnh cấm" : "CẤM"} người dùng này?`)) return;
    try {
      await usersService.ban(userId, { isBanned: !isBanned });
      alert("Cập nhật trạng thái thành công!");
      load();
    } catch (e) {
      alert("Lỗi: " + e.message);
    }
  }

  async function handleRole(userId, currentRole) {
    const newRole = currentRole === "USER" ? "TREE_ADMIN" : "USER";
    if (!confirm(`Chuyển vai trò thành ${newRole}?`)) return;
    try {
      await usersService.updateRole(userId, { role: newRole });
      alert("Cập nhật quyền thành công!");
      load();
    } catch (e) {
      alert("Lỗi: " + e.message);
    }
  }

  useEffect(() => { load(); }, []);

  const StatCard = ({ icon, title, value, color, onClick, loading: cardLoading }) => (
    <div className="card" style={{ flex: 1, padding: 20, display: "flex", alignItems: "center", gap: 16, cursor: onClick ? "pointer" : "default" }} onClick={onClick}>
      <div className="avatar" style={{ width: 56, height: 56, background: color, color: "var(--primary)" }}>
        {cardLoading ? <div className="spinner-small" /> : icon}
      </div>
      <div>
        <div className="small" style={{ color: "var(--text-light)", fontWeight: 500, marginBottom: 4 }}>{title}</div>
        <div style={{ fontSize: 24, fontWeight: 700, color: "var(--text-dark)" }}>{value}</div>
      </div>
    </div>
  );

  return (
    <>
      <Topbar />
      <div className="container" style={{ maxWidth: 1400 }}>

        <div className="row" style={{ justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <div className="title-md" style={{ display: "flex", gap: 12, alignItems: "center" }}><ShieldAlert color="var(--primary)" /> SUPER ADMIN DASHBOARD</div>
            <div className="small">Quản lý tổng quan toàn bộ Cây Gia phả (Dữ liệu thực tế từ Backend)</div>
          </div>
          <div>
            <button className="btn outline" style={{ marginRight: 12 }} onClick={load}><Activity size={16} style={{ marginRight: 6 }} /> Làm mới</button>
            <button className="btn primary"><Plus size={16} style={{ marginRight: 6 }} /> Tạo Cây Gia phả mới</button>
          </div>
        </div>

        {err && <div className="card" style={{ color: "var(--danger)", marginBottom: 16, background: "rgba(239, 68, 68, 0.1)", border: "1px solid var(--danger)" }}>{err}</div>}
        {loading && <div className="card" style={{ textAlign: "center", padding: 40 }}>Đang đồng bộ dữ liệu với Backend...</div>}

        {!loading && (
          <div className="dashboard-layout" style={{ alignItems: "flex-start", gridTemplateColumns: "1fr 350px" }}>

            {/* LEFT COLUMN: Main Management */}
            <div className="stack" style={{ gap: 24 }}>

              {/* Stats Row */}
              <div className="row" style={{ gap: 20 }}>
                <StatCard icon={<GitBranch size={24} />} title="Tổng Cây Gia phả" value={trees.length} color="var(--primary-light)" />
                <StatCard icon={<UsersIcon size={24} />} title="Tổng Tài khoản" value={users.length} color="rgba(34, 197, 94, 0.15)" />
                <StatCard icon={<Activity size={24} />} title="Traffic Hệ thống" value="Live" color="rgba(236, 72, 153, 0.15)" />
                <StatCard
                  icon={<Database size={24} />}
                  title="Health Check"
                  value={healthStatus}
                  color="rgba(14, 165, 233, 0.15)"
                  onClick={checkHealth}
                  loading={checkingHealth}
                />
              </div>

              {/* Tabs */}
              <div className="tabs" style={{ display: "flex", gap: 24, borderBottom: "1px solid var(--border)", marginBottom: -16 }}>
                <button
                  className={`tab-btn ${activeTab === "trees" ? "active" : ""}`}
                  onClick={() => setActiveTab("trees")}
                  style={{
                    border: "none", background: "none", padding: "12px 6px", cursor: "pointer",
                    fontSize: 16, fontWeight: 700, color: activeTab === "trees" ? "var(--primary)" : "var(--muted)",
                    borderBottom: activeTab === "trees" ? "3px solid var(--primary)" : "none"
                  }}
                >
                  Cây Gia phả ({trees.length})
                </button>
                <button
                  className={`tab-btn ${activeTab === "users" ? "active" : ""}`}
                  onClick={() => setActiveTab("users")}
                  style={{
                    border: "none", background: "none", padding: "12px 6px", cursor: "pointer",
                    fontSize: 16, fontWeight: 700, color: activeTab === "users" ? "var(--primary)" : "var(--muted)",
                    borderBottom: activeTab === "users" ? "3px solid var(--primary)" : "none"
                  }}
                >
                  Người dùng ({users.length})
                </button>
              </div>

              {activeTab === "trees" ? (
                <div className="card">
                  <div className="row" style={{ justifyContent: "space-between", marginBottom: 16 }}>
                    <div style={{ fontWeight: 600, color: "var(--text-dark)", fontSize: 18 }}>Danh sách Cây Gia phả</div>
                    <div className="small" style={{ color: "var(--text-light)" }}>Dữ liệu từ Branches API</div>
                  </div>
                  <div style={{ overflowX: "auto", border: "1px solid var(--border)", borderRadius: "var(--radius-md)" }}>
                    <table className="table" style={{ margin: 0, minWidth: 800 }}>
                      <thead style={{ background: "var(--surface-solid)" }}>
                        <tr>
                          <th>Tên Cây Gia phả</th>
                          <th>Trưởng họ / Admin</th>
                          <th>Cấp bậc / Nhánh</th>
                          <th>Mô tả</th>
                          <th>Hành động</th>
                        </tr>
                      </thead>
                      <tbody>
                        {trees.length === 0 ? (
                          <tr><td colSpan="5" style={{ textAlign: "center", padding: 20 }}>Chưa có cây gia phả nào được khởi tạo.</td></tr>
                        ) : trees.map((t) => (
                          <tr key={t._id || t.id}>
                            <td>
                              <div style={{ fontWeight: 600, color: "var(--primary)" }}>{t.name}</div>
                              <div className="small" style={{ color: "var(--text-light)" }}>ID: {t._id || t.id}</div>
                            </td>
                            <td>
                              <div style={{ fontWeight: 500 }}>{t.adminId === DEV_ME.id ? "Hệ thống" : "Người dùng"}</div>
                              <div className="small" style={{ color: "var(--text-light)" }}>Admin ID: {t.adminId}</div>
                            </td>
                            <td style={{ textAlign: "center" }}>{t.level || 0}</td>
                            <td style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {t.description || "Không có mô tả"}
                            </td>
                            <td><button className="btn small outline">Quản lý</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="card">
                  <div className="row" style={{ justifyContent: "space-between", marginBottom: 16 }}>
                    <div style={{ fontWeight: 600, color: "var(--text-dark)", fontSize: 18 }}>Quản lý Người dùng</div>
                    <div className="small" style={{ color: "var(--text-light)" }}>Tấn công / Ban / Phân quyền</div>
                  </div>
                  <div style={{ overflowX: "auto", border: "1px solid var(--border)", borderRadius: "var(--radius-md)" }}>
                    <table className="table" style={{ margin: 0, minWidth: 800 }}>
                      <thead style={{ background: "var(--surface-solid)" }}>
                        <tr>
                          <th>Họ tên & Email</th>
                          <th>Vai trò</th>
                          <th>Trạng thái</th>
                          <th>Hành động</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((u) => (
                          <tr key={u.id}>
                            <td>
                              <div style={{ fontWeight: 600 }}>{u.fullName}</div>
                              <div className="small" style={{ color: "var(--text-light)" }}>{u.email}</div>
                            </td>
                            <td>
                              <span className={`badge ${u.role === "SUPER_ADMIN" ? "public" : "internal"}`}>{u.role}</span>
                            </td>
                            <td>
                              {u.status === "banned" ? (
                                <span style={{ color: "var(--danger)", fontWeight: 700 }}>BỊ CẤM</span>
                              ) : (
                                <span style={{ color: "var(--green)", fontWeight: 700 }}>HOẠT ĐỘNG</span>
                              )}
                            </td>
                            <td>
                              <div className="row" style={{ gap: 8 }}>
                                <button className="btn small outline" onClick={() => handleRole(u.id, u.role)}>Cấp quyền</button>
                                <button
                                  className="btn small"
                                  style={{ background: u.status === "banned" ? "var(--green)" : "var(--danger)", color: "#fff", border: "none" }}
                                  onClick={() => handleBan(u.id, u.status === "banned")}
                                >
                                  {u.status === "banned" ? "Gỡ cấm" : "Ban"}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Global Events / Banners */}
              <div className="card">
                <div className="row" style={{ justifyContent: "space-between", marginBottom: 16 }}>
                  <div style={{ fontWeight: 600, color: "var(--text-dark)", fontSize: 18, display: "flex", gap: 8, alignItems: "center" }}><Megaphone size={20} color="var(--primary)" /> Global Events & Banners</div>
                  <button className="btn small primary">Tạo Event mới</button>
                </div>
                <div style={{ overflowX: "auto", border: "1px solid var(--border)", borderRadius: "var(--radius-md)" }}>
                  <table className="table" style={{ margin: 0, minWidth: 600 }}>
                    <thead style={{ background: "var(--surface-solid)" }}>
                      <tr><th>Tiêu đề Banner</th><th>Loại</th><th>Trạng thái</th><th>Hành động</th></tr>
                    </thead>
                    <tbody>
                      {globalEvents.map(ev => (
                        <tr key={ev.id}>
                          <td style={{ fontWeight: 500 }}>{ev.title}</td>
                          <td><span className="badge internal">{ev.type}</span></td>
                          <td>
                            {ev.status === "Active"
                              ? <span style={{ color: "var(--green)", fontWeight: 500, fontSize: 13 }}>● Đang hiển thị</span>
                              : <span style={{ color: "var(--text-light)", fontWeight: 500, fontSize: 13 }}>○ Đã tắt</span>}
                          </td>
                          <td><button className="btn small outline">Sửa</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Audit Logs */}
            <div style={{ flex: 1, minWidth: 320 }}>
              <div className="card" style={{ height: "100%" }}>
                <div className="row" style={{ marginBottom: 20, gap: 8 }}>
                  <History size={20} color="var(--primary)" />
                  <div style={{ fontWeight: 600, color: "var(--text-dark)", fontSize: 18 }}>System Audit Logs</div>
                </div>

                <div className="small" style={{ marginBottom: 16, color: "var(--text-light)" }}>
                  Ghi nhận mọi thao tác hệ thống (Mock UI).
                </div>

                <div className="stack" style={{ gap: 16 }}>
                  {auditLogs.map(log => (
                    <div key={log.id} style={{ padding: 16, background: "var(--surface-solid)", borderRadius: 12, borderLeft: "4px solid var(--primary)", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
                      <div className="row" style={{ justifyContent: "space-between", marginBottom: 8 }}>
                        <span style={{ fontWeight: 600, color: "var(--text-dark)" }}>{log.action}</span>
                        <span className="small" style={{ color: "var(--text-light)", fontSize: 12 }}>{log.time}</span>
                      </div>
                      <div className="small" style={{ color: "var(--text-light)", marginTop: 4 }}>Bởi: <strong style={{ color: "var(--text-dark)" }}>{log.user}</strong></div>
                      <div className="small" style={{ color: "var(--text-light)", marginTop: 4 }}>Đối tượng: <strong style={{ color: "var(--text-dark)" }}>{log.target}</strong></div>
                    </div>
                  ))}
                </div>

                <button className="btn outline" style={{ width: "100%", marginTop: 24, justifyContent: "center" }}>
                  Xem toàn bộ Log (CSV)
                </button>
              </div>
            </div>

          </div>
        )}
      </div>
    </>
  );
}
