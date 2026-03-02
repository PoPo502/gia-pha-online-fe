import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Topbar from "../components/Topbar.jsx";
import { personsService } from "../services/persons.service.js";
import { DEV_BYPASS_AUTH } from "../dev/devConfig.js";
import { useAuth } from "../store/auth.jsx";
import { Plus, User, Trash2, Edit, Download, Image as ImageIcon, FileText } from "lucide-react";
import "../components/FamilyTree.css";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

function Node({ node, onNodeClick }) {
  if (!node) return null;
  const children = node.children || node.descendants || [];
  const spouses = node.spouses || [];

  return (
    <li>
      <div className="tree-node-wrapper">
        <div className="tree-node-card" onClick={(e) => onNodeClick(e, node)} style={{ borderRadius: 12, border: "2px solid #fff", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
          <div className="tree-node-avatar" style={{ background: (node.gender === 'female' ? "rgba(236,72,153,0.1)" : "var(--primary-light)"), color: (node.gender === 'female' ? "#db2777" : "var(--primary)"), borderColor: "#fff" }}>
            {(node.fullName || node.name || "U").charAt(0).toUpperCase()}
          </div>
          <div className="tree-node-name" style={{ fontWeight: 800 }}>{node.fullName || node.name || "Chưa xác định"}</div>
          {(node.dateOfBirth || node.dateOfDeath || node.birthYear || node.deathYear) && (
            <div className="tree-node-years">
              {node.dateOfBirth ? new Date(node.dateOfBirth).getFullYear() : (node.birthYear || "?")} - {node.dateOfDeath ? new Date(node.dateOfDeath).getFullYear() : (node.deathYear || "Nay")}
            </div>
          )}
        </div>
      </div>

      {children.length > 0 && (
        <ul>
          {children.map((c) => <Node key={c.id || c._id || Math.random()} node={c} onNodeClick={onNodeClick} />)}
        </ul>
      )}
    </li>
  );
}

export default function PersonTree() {
  const { id } = useParams();
  const nav = useNavigate();
  const { me } = useAuth();
  const [tree, setTree] = useState(null);
  const [params, setParams] = useState({ depth: 3, includeSpouses: true, format: "nested" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  const canEdit = me?.role === "TREE_ADMIN" || me?.role === "SUPER_ADMIN";

  // Tree Element Ref for Export
  const treeRef = useRef(null);
  const [exporting, setExporting] = useState(false);

  // Context Menu State
  const [ctxMenu, setCtxMenu] = useState(null);

  // Add Person Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [addMode, setAddMode] = useState("root"); // root | relative
  const [targetNode, setTargetNode] = useState(null);
  const [formData, setFormData] = useState({ name: "", birthYear: "", relation: "child" });

  async function load(p = params) {
    setErr("");
    setLoading(true);
    setCtxMenu(null);
    try {
      const res = await personsService.tree(id, p);
      if (res && res.root) {
        // BE mới: trả nested `{ root: { children: [...] } }`
        // BE cũ: trả flat `{ root, parents, children, spouses }`
        const node = { ...res.root };

        if (node.children === undefined && Array.isArray(res.children)) node.children = res.children;
        if (node.parents === undefined && Array.isArray(res.parents)) node.parents = res.parents;
        if (node.spouses === undefined && Array.isArray(res.spouses)) node.spouses = res.spouses;

        setTree(node);
      } else {
        setTree(res);
      }
    } catch (e) {
      setErr(e.message || "Không thể tải dữ liệu cây gia phả");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [id]);

  useEffect(() => {
    const handleClickOutside = () => setCtxMenu(null);
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  const handleNodeClick = (e, node) => {
    e.stopPropagation();
    setCtxMenu({
      x: e.clientX,
      y: e.clientY,
      node
    });
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    alert("Tính năng thêm người đang được xây dựng (Giao diện Offline)!\nDữ liệu: " + JSON.stringify(formData));
    setShowAddModal(false);
  };

  const exportImage = async () => {
    if (!treeRef.current) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(treeRef.current, { scale: 2, backgroundColor: "#ffffff" });
      const link = document.createElement("a");
      link.download = `tree_${id}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      alert("Lỗi khi xuất ảnh: " + error.message);
    } finally {
      setExporting(false);
    }
  };

  const exportPDF = async () => {
    if (!treeRef.current) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(treeRef.current, { scale: 2, backgroundColor: "#ffffff" });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [canvas.width, canvas.height] });
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save(`tree_${id}.pdf`);
    } catch (error) {
      alert("Lỗi khi xuất PDF: " + error.message);
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <Topbar />
      <div className="container" style={{ maxWidth: 1400 }}>
        <div className="card">
          <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
            <div>
              <div className="title-md">Cây huyết thống interactive</div>
              <div className="small">Sơ đồ quan hệ gia đình của thành viên {id}</div>
            </div>
            <div className="row" style={{ gap: 12 }}>

              <div style={{ position: "relative" }} className="export-menu-container">
                <button className="btn" disabled={exporting || loading || !tree}>
                  <Download size={18} style={{ marginRight: 8 }} /> {exporting ? "Đang xử lý..." : "Xuất File"}
                </button>
                <div className="export-dropdown" style={{ display: "none", position: "absolute", top: "100%", right: 0, marginTop: 4, background: "var(--surface-solid)", border: "1px solid var(--border)", borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", zIndex: 100, minWidth: 150, overflow: "hidden" }}>
                  <button className="btn outline" style={{ width: "100%", borderRadius: 0, border: "none", justifyContent: "flex-start" }} onClick={exportImage}>
                    <ImageIcon size={16} style={{ marginRight: 8 }} /> Lưu ra Ảnh
                  </button>
                  <button className="btn outline" style={{ width: "100%", borderRadius: 0, border: "none", justifyContent: "flex-start" }} onClick={exportPDF}>
                    <FileText size={16} style={{ marginRight: 8 }} /> Lưu ra PDF
                  </button>
                </div>
              </div>

              {canEdit && (
                <button className="btn outline" onClick={() => { setAddMode("root"); setShowAddModal(true); }}>
                  Thêm gốc gia phả
                </button>
              )}
              <button className="btn" onClick={() => nav(`/persons/${id}`)}>Quay lại hồ sơ</button>
            </div>
          </div>

          <style>{`
            .export-menu-container:hover .export-dropdown { display: block !important; }
          `}</style>

          <div className="filters">
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span className="small" style={{ fontWeight: 500 }}>Bậc sâu hiển thị:</span>
              <input className="input" style={{ width: 80 }} type="number" min="1" max="10"
                value={params.depth} onChange={(e) => setParams(s => ({ ...s, depth: Number(e.target.value) }))} />
            </div>

            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span className="small" style={{ fontWeight: 500 }}>Vợ/chồng:</span>
              <select className="select" style={{ width: 120 }} value={String(params.includeSpouses)} onChange={(e) => setParams(s => ({ ...s, includeSpouses: e.target.value === "true" }))}>
                <option value="true">Hiển thị</option>
                <option value="false">Ẩn</option>
              </select>
            </div>

            <button className="btn primary" onClick={() => load(params)} disabled={loading}>
              {loading ? "Đang tải..." : "Làm mới dữ liệu"}
            </button>
          </div>

          {err && <div style={{ color: "var(--danger)", marginTop: 16 }}>{err}</div>}

          <div style={{ position: "relative", marginTop: 24, background: "var(--surface-solid)", padding: 24, borderRadius: "var(--radius-lg)", border: "1px solid var(--border)", minHeight: 400, overflow: "hidden" }}>
            {loading && !tree && <div className="small" style={{ textAlign: "center", padding: 40 }}>Đang dựng cây gia phả...</div>}

            {tree && (
              <div className="family-tree-container" ref={treeRef} style={{ background: "var(--surface-solid)" }}>
                <div className="family-tree">
                  <ul>
                    <Node node={tree.root || tree} onNodeClick={handleNodeClick} />
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Context Menu Popup */}
      {ctxMenu && (
        <div className="context-menu" style={{ top: ctxMenu.y, left: ctxMenu.x }}>
          <div className="small" style={{ padding: "4px 16px 8px", borderBottom: "1px solid var(--border)", marginBottom: 4, fontWeight: 600 }}>
            {ctxMenu.node.name || ctxMenu.node.fullName}
          </div>
          <button onClick={() => nav(`/persons/${ctxMenu.node.id || ctxMenu.node._id}`)}>
            <User size={16} /> Xem hồ sơ chi tiết
          </button>

          {canEdit && (
            <>
              <button onClick={() => {
                setTargetNode(ctxMenu.node);
                setAddMode("relative");
                setShowAddModal(true);
                setCtxMenu(null);
              }}>
                <Plus size={16} /> Thêm người thân
              </button>
              <button>
                <Edit size={16} /> Sửa nhanh
              </button>
              <button className="danger">
                <Trash2 size={16} /> Xóa thành viên
              </button>
            </>
          )}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
          <div className="card" style={{ width: 500, maxWidth: "90vw", animation: "slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1)" }}>
            <div className="title-md" style={{ marginBottom: 16 }}>
              {addMode === "root" ? "Thêm người đứng đầu gia phả" : `Thêm người thân cho ${targetNode?.name}`}
            </div>

            <form onSubmit={handleAddSubmit} className="stack">
              <div>
                <label className="small" style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>Họ và Tên</label>
                <input required className="input" placeholder="Nhập họ và tên..." value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>

              <div className="row">
                <div style={{ flex: 1 }}>
                  <label className="small" style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>Năm sinh</label>
                  <input className="input" type="number" placeholder="YYYY" value={formData.birthYear} onChange={(e) => setFormData({ ...formData, birthYear: e.target.value })} />
                </div>
                {addMode === "relative" && (
                  <div style={{ flex: 1 }}>
                    <label className="small" style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>Mối quan hệ</label>
                    <select className="select" value={formData.relation} onChange={(e) => setFormData({ ...formData, relation: e.target.value })}>
                      <option value="parent">Cha / Mẹ</option>
                      <option value="spouse">Vợ / Chồng</option>
                      <option value="child">Con cái</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="row" style={{ marginTop: 24, justifyContent: "flex-end" }}>
                <button type="button" className="btn" onClick={() => setShowAddModal(false)}>Hủy bỏ</button>
                <button type="submit" className="btn primary">Xác nhận Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
