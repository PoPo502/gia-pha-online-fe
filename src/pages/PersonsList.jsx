import { useEffect, useState } from "react";
import Topbar from "../components/Topbar.jsx";
import { personsService } from "../services/persons.service.js";
import { Link } from "react-router-dom";
import { DEV_BYPASS_AUTH } from "../dev/devConfig.js";

export default function PersonsList() {
  const [items, setItems] = useState([]);
  const [params, setParams] = useState({ page: 1, limit: 20, branchId: "", privacy: "" });
  const [meta, setMeta] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function load(p = params) {
    setErr("");
    setLoading(true);
    try {
      const res = await personsService.list(p);
      const list = res.data || res;
      setItems(Array.isArray(list) ? list : (list.data || []));
      setMeta(res.meta || null);
    } catch (e) {
      setErr(e.message || "Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  return (
    <>
      <Topbar />
      <div className="container">
        <div className="card">
          <div className="title-md">Danh sách thành viên toàn hệ thống</div>
          <div className="small" style={{ marginBottom: 20 }}>Liệt kê danh sách tất cả các thành viên để quản lý dễ dàng.</div>

          <div className="filters">
            <input className="input" style={{ maxWidth: 260 }} placeholder="Mã chi nhánh (Branch ID)..."
              value={params.branchId} onChange={(e) => setParams(s => ({ ...s, branchId: e.target.value }))} />

            <select className="select" style={{ maxWidth: 200 }} value={params.privacy} onChange={(e) => setParams(s => ({ ...s, privacy: e.target.value }))}>
              <option value="">Tất cả quyền riêng tư</option>
              <option value="public">Công khai</option>
              <option value="internal">Nội bộ</option>
              <option value="sensitive">Nhạy cảm</option>
            </select>

            <button className="btn primary" onClick={() => load({ ...params, page: 1 })} disabled={loading}>
              {loading ? "Đang lọc..." : "Lọc danh sách"}
            </button>
          </div>

          {err && <div style={{ color: "var(--danger)", marginTop: 16 }}>{err}</div>}

          <div style={{ marginTop: 24, overflowX: "auto" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Họ và tên</th>
                  <th>Phân quyền</th>
                  <th style={{ textAlign: "right" }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {items.map((p) => {
                  const id = p.id || p._id;
                  const name = p.name || p.fullName || "Chưa xác định";

                  return (
                    <tr key={id}>
                      <td style={{ fontWeight: 500 }}>{name}</td>
                      <td>
                        {p.privacy ? (
                          <span className={`badge ${p.privacy.toLowerCase()}`}>{p.privacy}</span>
                        ) : "-"}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                          <Link className="btn" to={`/persons/${id}`} style={{ padding: "6px 12px", fontSize: 13 }}>Chi tiết</Link>
                          <Link className="btn" to={`/persons/${id}/tree`} style={{ padding: "6px 12px", fontSize: 13 }}>Cây</Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {items.length === 0 && !loading && (
                  <tr><td colSpan="3" className="small" style={{ textAlign: "center", padding: "40px" }}>Không có dữ liệu.</td></tr>
                )}
                {loading && (
                  <tr><td colSpan="3" className="small" style={{ textAlign: "center", padding: "40px" }}>Đang tải...</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {meta && (
            <div className="row" style={{ justifyContent: "space-between", marginTop: 24, alignItems: "center" }}>
              <div className="small">
                Trang {meta.page} / {meta.totalPages} <span style={{ margin: "0 8px" }}>•</span> {meta.total} kết quả
              </div>
              <div className="row" style={{ gap: 8 }}>
                <button className="btn" disabled={meta.page <= 1 || loading} onClick={() => load({ ...params, page: meta.page - 1 })}>Trước</button>
                <button className="btn" disabled={meta.page >= meta.totalPages || loading} onClick={() => load({ ...params, page: meta.page + 1 })}>Sau</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
