import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Topbar from "../components/Topbar.jsx";
import ConfirmModal from "../components/ConfirmModal.jsx";
import { personsService } from "../services/persons.service.js";

export default function PersonDetail() {
  const { id } = useParams();
  const [person, setPerson] = useState(null);
  const [edit, setEdit] = useState(null);
  const [err, setErr] = useState("");
  const [confirmDel, setConfirmDel] = useState(false);

  async function load() {
    setErr("");
    try {
      const data = await personsService.get(id);
      setPerson(data);
      setEdit(data);
    } catch (e) {
      setErr(e.message || "Load failed");
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  async function save() {
    setErr("");
    try {
      const data = await personsService.update(id, edit);
      setPerson(data);
      setEdit(data);
    } catch (e) {
      setErr(e.message || "Update failed");
    }
  }

  async function remove() {
    setErr("");
    try {
      await personsService.remove(id);
      window.location.href = "/persons";
    } catch (e) {
      setErr(e.message || "Delete failed");
    } finally {
      setConfirmDel(false);
    }
  }

  return (
    <>
      <Topbar />
      <div className="container">
        <div className="card">
          <div style={{ fontWeight: 800 }}>Chi tiết thành viên</div>

          {err && <div style={{ color: "#d64545", marginTop: 10 }}>{err}</div>}
          {!person && !err && <div className="small" style={{ marginTop: 10 }}>Loading...</div>}

          {edit && (
            <div className="stack" style={{ marginTop: 12 }}>
              <div className="row">
                <div style={{ flex: 1 }}>
                  <div className="small">Name</div>
                  <input className="input" value={edit.name || ""} onChange={(e)=>setEdit(s=>({ ...s, name: e.target.value }))} />
                </div>
                <div style={{ width: 220 }}>
                  <div className="small">Privacy</div>
                  <input className="input" placeholder="public/internal/sensitive" value={edit.privacy || ""} onChange={(e)=>setEdit(s=>({ ...s, privacy: e.target.value }))} />
                </div>
              </div>
              <div>
                <div className="small">Note</div>
                <input className="input" value={edit.note || ""} onChange={(e)=>setEdit(s=>({ ...s, note: e.target.value }))} />
              </div>

              <div className="row" style={{ justifyContent: "flex-end" }}>
                <button className="btn danger" onClick={() => setConfirmDel(true)}>Xóa</button>
                <button className="btn primary" onClick={save}>Lưu</button>
              </div>

              <div className="small">Raw JSON:</div>
              <pre style={{ background:"#fafafa", border:"1px solid #eee", padding:12, borderRadius:12, overflow:"auto" }}>
                {JSON.stringify(person, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        open={confirmDel}
        title="Xác nhận xóa"
        message="Bạn có chắc muốn xóa thành viên này?"
        onCancel={() => setConfirmDel(false)}
        onConfirm={remove}
      />
    </>
  );
}
