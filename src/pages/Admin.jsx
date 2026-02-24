import { useEffect, useState } from "react";
import Topbar from "../components/Topbar.jsx";
import { branchesService } from "../services/branches.service.js";
import { usersService } from "../services/users.service.js";

export default function Admin() {
  const [branches, setBranches] = useState([]);
  const [users, setUsers] = useState([]);
  const [err, setErr] = useState("");

  async function load() {
    setErr("");
    try {
      const [b, u] = await Promise.all([
        branchesService.list({ page: 1, limit: 50 }),
        usersService.list({ page: 1, limit: 50 }),
      ]);
      setBranches(b.items || b || []);
      setUsers(u.items || u || []);
    } catch (e) {
      setErr(e.message || "Load failed");
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <>
      <Topbar />
      <div className="container">
        <div className="card">
          <div style={{ fontWeight: 800 }}>Admin</div>
          {err && <div style={{ color: "#d64545", marginTop: 10 }}>{err}</div>}

          <hr style={{ margin: "16px 0" }} />
          <div style={{ fontWeight: 700 }}>Branches</div>
          <table className="table" style={{ marginTop: 10 }}>
            <thead><tr><th>Name</th><th>ID</th></tr></thead>
            <tbody>
              {branches.map((b) => (
                <tr key={b.id || b._id}>
                  <td>{b.name || "-"}</td>
                  <td className="small">{b.id || b._id}</td>
                </tr>
              ))}
              {branches.length === 0 && <tr><td colSpan="2" className="small">No branches</td></tr>}
            </tbody>
          </table>

          <hr style={{ margin: "16px 0" }} />
          <div style={{ fontWeight: 700 }}>Users (ADMIN)</div>
          <table className="table" style={{ marginTop: 10 }}>
            <thead><tr><th>Email</th><th>Role</th><th>ID</th></tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id || u._id}>
                  <td>{u.email || "-"}</td>
                  <td>{u.role || "-"}</td>
                  <td className="small">{u.id || u._id}</td>
                </tr>
              ))}
              {users.length === 0 && <tr><td colSpan="3" className="small">No users</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
