import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Topbar from "../components/Topbar.jsx";
import { personsService } from "../services/persons.service.js";

/**
 * Render tree rất tối giản (nested JSON).
 * Khi BE trả format=nested, FE có thể render thành UI cây đẹp sau (d3/reactflow...).
 */
function Node({ node }) {
  if (!node) return null;
  const children = node.children || node.descendants || [];
  return (
    <div style={{ borderLeft: "2px solid #eee", marginLeft: 8, paddingLeft: 12, marginTop: 8 }}>
      <div className="kv">
        <div><b>{node.name || node.fullName || "Unknown"}</b></div>
        {node.privacy && <div>privacy: {node.privacy}</div>}
        {node.id && <div>id: {node.id}</div>}
      </div>
      {children.length > 0 && (
        <div>
          {children.map((c) => <Node key={c.id || c._id || Math.random()} node={c} />)}
        </div>
      )}
    </div>
  );
}

export default function PersonTree() {
  const { id } = useParams();
  const [tree, setTree] = useState(null);
  const [params, setParams] = useState({ depth: 3, includeSpouses: true, format: "nested" });
  const [err, setErr] = useState("");

  async function load(p = params) {
    setErr("");
    try {
      const data = await personsService.tree(id, p);
      setTree(data);
    } catch (e) {
      setErr(e.message || "Load tree failed");
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  return (
    <>
      <Topbar />
      <div className="container">
        <div className="card">
          <div style={{ fontWeight: 800 }}>Cây gia phả</div>

          <div className="row" style={{ marginTop: 12, flexWrap: "wrap" }}>
            <input className="input" style={{ width: 140 }} type="number" min="1"
              value={params.depth} onChange={(e)=>setParams(s=>({ ...s, depth: Number(e.target.value) }))} />
            <input className="input" style={{ width: 180 }}
              value={String(params.includeSpouses)} onChange={(e)=>setParams(s=>({ ...s, includeSpouses: e.target.value }))} />
            <input className="input" style={{ width: 160 }}
              value={params.format} onChange={(e)=>setParams(s=>({ ...s, format: e.target.value }))} />
            <button className="btn primary" onClick={() => load(params)}>Load</button>
          </div>

          {err && <div style={{ color: "#d64545", marginTop: 10 }}>{err}</div>}
          {!tree && !err && <div className="small" style={{ marginTop: 10 }}>Loading...</div>}

          {tree && (
            <div style={{ marginTop: 12 }}>
              <Node node={tree.root || tree} />
              <hr style={{ margin: "16px 0" }} />
              <div className="small">Raw JSON:</div>
              <pre style={{ background:"#fafafa", border:"1px solid #eee", padding:12, borderRadius:12, overflow:"auto" }}>
                {JSON.stringify(tree, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
