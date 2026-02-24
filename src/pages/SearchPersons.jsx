import { useState } from "react";
import Topbar from "../components/Topbar.jsx";
import { searchService } from "../services/search.service.js";
import { Link } from "react-router-dom";

export default function SearchPersons() {
  const [q, setQ] = useState("");
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function run(page = 1) {
    setErr("");
    setLoading(true);
    try {
      const res = await searchService.persons({ q, page, limit: 20 });
      // tùy BE: có thể trả {items, meta} hoặc {data:{items, meta}}
      const list = res.items || res.data?.items || res;
      setItems(list.items || list || []);
      setMeta(list.meta || res.meta || null);
    } catch (e) {
      setErr(e.message || "Search failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Topbar />
      <div className="container">
        <div className="card">
          <div style={{ fontWeight: 800 }}>Tìm kiếm thành viên</div>
          <div className="row" style={{ marginTop: 12 }}>
            <input className="input" placeholder="Nhập từ khóa..." value={q} onChange={(e) => setQ(e.target.value)} />
            <button className="btn primary" onClick={() => run(1)} disabled={!q || loading}>
              {loading ? "Đang tìm..." : "Tìm"}
            </button>
          </div>

          {err && <div style={{ color: "#d64545", marginTop: 10 }}>{err}</div>}

          <div style={{ marginTop: 16 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Họ tên</th>
                  <th>Branch</th>
                  <th>Privacy</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((p) => (
                  <tr key={p.id || p._id}>
                    <td>{p.name || p.fullName || "-"}</td>
                    <td>{p.branchId || p.branch?.name || "-"}</td>
                    <td>{p.privacy || "-"}</td>
                    <td>
                      <Link className="btn" to={`/persons/${p.id || p._id}`}>Chi tiết</Link>
                      <Link className="btn" to={`/persons/${p.id || p._id}/tree`} style={{ marginLeft: 8 }}>Cây</Link>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && !loading && (
                  <tr><td colSpan="4" className="small">Không có kết quả.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {meta && (
            <div className="row" style={{ justifyContent: "space-between", marginTop: 12 }}>
              <div className="small">
                page {meta.page}/{meta.totalPages} • total {meta.total}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
