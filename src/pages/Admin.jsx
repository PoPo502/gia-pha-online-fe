import { useEffect, useState } from "react";
import Topbar from "../components/Topbar.jsx";
import { DEV_BYPASS_AUTH, DEV_ME } from "../dev/devConfig.js";
import { Activity, Users as UsersIcon, GitBranch, ShieldAlert, History, Megaphone, Database, Plus } from "lucide-react";

export default function Admin() {
  const [trees, setTrees] = useState([]);
  const [users, setUsers] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  // Mock Global Events
  const [globalEvents, setGlobalEvents] = useState([
    { id: 1, title: "Chúc mừng năm mới Giáp Thìn", status: "Active", type: "Banner" },
    { id: 2, title: "Thông báo bảo trì hệ thống 00:00", status: "Inactive", type: "Alert" }
  ]);

  // Mock Audit Logs
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
      // Simulate API call
      await new Promise(r => setTimeout(r, 600));

      setTrees([
        { id: "tree_1", name: "Gia phả họ Nguyễn (Hà Nội)", adminName: "Nguyễn Văn Trưởng", adminId: "u_101", total: 120, alive: 80, dead: 40, branches: 4 },
        { id: "tree_2", name: "Gia phả họ Lê (Nam Định)", adminName: "Lê Hữu Cán", adminId: "u_102", total: 45, alive: 40, dead: 5, branches: 2 },
        { id: "tree_3", name: "Gia phả họ Trần (Thái Bình)", adminName: "Trần Bá Đạo", adminId: "u_103", total: 310, alive: 200, dead: 110, branches: 8 },
      ]);
      setUsers([
        { id: DEV_ME.id, email: "super@system.com", role: "SUPER_ADMIN", treeId: null },
        { id: "u_101", email: "truong.nguyen@example.com", role: "TREE_ADMIN", treeId: "tree_1" },
        { id: "u_102", email: "can.le@example.com", role: "TREE_ADMIN", treeId: "tree_2" },
        { id: "u_201", email: "member1@example.com", role: "USER", treeId: "tree_1" },
      ]);
    } catch (e) {
      setErr(e.message || "Không thể tải dữ liệu quản trị");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const StatCard = ({ icon, title, value, color }) => (
    <div className="card" style={{ flex: 1, padding: 20, display: "flex", alignItems: "center", gap: 16 }}>
      <div className="avatar" style={{ width: 56, height: 56, background: color, color: "var(--primary)" }}>
        {icon}
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
            <div className="small">Quản lý tổng quan toàn bộ Cây Gia phả (Service Provider)</div>
          </div>
          <div>
            <button className="btn outline" style={{ marginRight: 12 }}><Database size={16} style={{ marginRight: 6 }} /> Bảo trì CSDL</button>
            <button className="btn primary"><Plus size={16} style={{ marginRight: 6 }} /> Tạo Cây Gia phả</button>
          </div>
        </div>

        {err && <div className="card" style={{ color: "var(--danger)", marginBottom: 16 }}>{err}</div>}
        {loading && <div className="card" style={{ textAlign: "center", padding: 40 }}>Đang phân tích dữ liệu hệ thống...</div>}

        {!loading && (
          <div className="dashboard-layout" style={{ alignItems: "flex-start", gridTemplateColumns: "1fr 350px" }}>

            {/* LEFT COLUMN: Main Management */}
            <div className="stack" style={{ gap: 24 }}>

              {/* Stats Row */}
              <div className="row" style={{ gap: 20 }}>
                <StatCard icon={<GitBranch size={24} />} title="Tổng Cây Gia phả" value={trees.length} color="var(--primary-light)" />
                <StatCard icon={<UsersIcon size={24} />} title="Tổng Tài khoản" value={users.length} color="rgba(34, 197, 94, 0.15)" />
                <StatCard icon={<Activity size={24} />} title="Traffic Hôm nay" value="8,402" color="rgba(236, 72, 153, 0.15)" />
                <StatCard icon={<Database size={24} />} title="Health Check" value="100%" color="rgba(14, 165, 233, 0.15)" />
              </div>

              {/* Quản lý Cây Gia phả */}
              <div className="card">
                <div className="row" style={{ justifyContent: "space-between", marginBottom: 16 }}>
                  <div style={{ fontWeight: 600, color: "var(--text-dark)", fontSize: 18 }}>Danh sách Cây Gia phả</div>
                  <div className="small" style={{ color: "var(--text-light)" }}>Quản lý chi tiết từng nhánh</div>
                </div>
                <div style={{ overflowX: "auto", border: "1px solid var(--border)", borderRadius: "var(--radius-md)" }}>
                  <table className="table" style={{ margin: 0, minWidth: 800 }}>
                    <thead style={{ background: "var(--surface-solid)" }}>
                      <tr>
                        <th>Tên Cây Gia phả</th>
                        <th>Admin Quản lý</th>
                        <th>Số Chi/Cành</th>
                        <th>Tổng (Sống / Mất)</th>
                        <th>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trees.map((t) => (
                        <tr key={t.id}>
                          <td>
                            <div style={{ fontWeight: 600, color: "var(--primary)" }}>{t.name}</div>
                            <div className="small" style={{ color: "var(--text-light)" }}>ID: {t.id}</div>
                          </td>
                          <td>
                            <div style={{ fontWeight: 500 }}>{t.adminName}</div>
                            <div className="small" style={{ color: "var(--text-light)" }}>ID: {t.adminId}</div>
                          </td>
                          <td style={{ textAlign: "center" }}>{t.branches}</td>
                          <td>
                            <strong>{t.total}</strong> ({t.alive} / <span style={{ color: "var(--text-light)" }}>{t.dead}</span>)
                          </td>
                          <td><button className="btn small outline">Sửa</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

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
                  Ghi nhận mọi thao tác hệ thống để đảm bảo an toàn & truy vết.
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
