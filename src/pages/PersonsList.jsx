import { useEffect, useState } from "react";
import Topbar from "../components/Topbar.jsx";
import { personsService } from "../services/persons.service.js";
import { Link } from "react-router-dom";

export default function PersonsList() {
  const [items, setItems] = useState([]);
  const [params, setParams] = useState({ page: 1, limit: 20, branchId: "", privacy: "" });
  const [meta, setMeta] = useState(null);
  const [err, setErr] = useState("");

  async function load(p = params) {
    setErr("");
    try {
      const res = await personsService.list(p);
      const list = res.items || res;
      setItems(list.items || list || []);
      setMeta(list.meta || res.meta || null);
    } catch (e) {
      setErr(e.message || "Load failed");
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  return (
    <>
      <Topbar />
      <div className="container">
        <div className="card">
          <div style={{ fontWeight: 800 }}>Danh sách Persons</div>
          <div className="row" style={{ marginTop: 12, flexWrap: "wrap" }}>
            <input className="input" style={{ maxWidth: 260 }} placeholder="branchId (optional)"
              value={params.branchId} onChange={(e)=>setParams(s=>({ ...s, branchId: e.target.value }))} />
            <input className="input" style={{ maxWidth: 180 }} placeholder="privacy (public/internal/sensitive)"
              value={params.privacy} onChange={(e)=>setParams(s=>({ ...s, privacy: e.target.value }))} />
            <button className="btn primary" onClick={() => load({ ...params, page: 1 })}>Lọc</button>
          </div>

          {err && <div style={{ color: "#d64545", marginTop: 10 }}>{err}</div>}

          <div style={{ marginTop: 16 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Họ tên</th>
                  <th>Privacy</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((p) => (
                  <tr key={p.id || p._id}>
                    <td>{p.name || p.fullName || "-"}</td>
                    <td>{p.privacy || "-"}</td>
                    <td>
                      <Link className="btn" to={`/persons/${p.id || p._id}`}>Chi tiết</Link>
                      <Link className="btn" to={`/persons/${p.id || p._id}/tree`} style={{ marginLeft: 8 }}>Cây</Link>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr><td colSpan="3" className="small">Không có dữ liệu.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {meta && (
            <div className="row" style={{ justifyContent: "space-between", marginTop: 12 }}>
              <div className="small">
                page {meta.page}/{meta.totalPages} • total {meta.total}
              </div>
              <div className="row">
                <button className="btn" disabled={meta.page <= 1} onClick={() => load({ ...params, page: meta.page - 1 })}>Prev</button>
                <button className="btn" disabled={meta.page >= meta.totalPages} onClick={() => load({ ...params, page: meta.page + 1 })}>Next</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
