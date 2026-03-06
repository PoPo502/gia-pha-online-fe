import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Topbar from "../components/Topbar.jsx";
import { personsService } from "../services/persons.service.js";
import { relationshipsService } from "../services/relationships.service.js";
import { formatError } from "../lib/api.js";

import { useAuth } from "../store/auth.jsx";
import { Plus, User, Trash2, Edit, Download, Image as ImageIcon, FileText } from "lucide-react";
import "../components/FamilyTree.css";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

function Node({ node, onNodeClick }) {
  if (!node) return null;
  const children = node.children || [];
  const spouses = node.spouses || [];

  // Tạo 1 hàm render chung để giao diện của Người Chính và Vợ/Chồng giống y hệt nhau
  const renderCard = (person) => (
    <div
      className="tree-node-card"
      // Sửa 1: Cho phép click chuột trái ở bất cứ đâu trên thẻ để hiện Menu
      onClick={(e) => {
        e.stopPropagation();
        onNodeClick(e, person);
      }}
      // Sửa 2: Chặn menu chuột phải mặc định và hiện Menu của mình
      onContextMenu={(e) => {
        e.preventDefault(); // Chặn cái menu trắng của trình duyệt
        e.stopPropagation();
        onNodeClick(e, person); // Hiện menu của mình
      }}
      style={{
        borderRadius: 12,
        border: "2px solid #fff",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        minWidth: 140,
        minHeight: 120,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center", // Căn giữa nội dung
        background: "var(--surface-solid)",
        cursor: "pointer",
        padding: "10px"
      }}
    >
      {/* ... giữ nguyên phần avatar và name bên trong ... */}
      <div className="tree-node-avatar" style={{
        background: (person.gender === 'female' ? "rgba(236,72,153,0.1)" : "var(--primary-light)"),
        color: (person.gender === 'female' ? "#db2777" : "var(--primary)"),
        borderColor: "#fff",
        marginBottom: "8px"
      }}>
        {(person.fullName || person.name || "U").charAt(0).toUpperCase()}
      </div>
      <div className="tree-node-name" style={{ fontWeight: 800, fontSize: "0.9rem", textAlign: "center" }}>
        {person.fullName || person.name || "Chưa xác định"}
      </div>
      {/* ... phần năm sinh giữ nguyên ... */}
    </div>
  );

  return (
    <li>
      {/* Wrapper dùng flex để xếp các thẻ nằm ngang cạnh nhau */}
      <div className="tree-node-wrapper" style={{ display: "flex", gap: 0, justifyContent: "center" }}>

        {/* Render thẻ Bản thân */}
        {renderCard(node)}

        {/* Render thẻ Vợ / Chồng (Giống y hệt Bản thân, nằm ngay cạnh) */}
        {spouses.length > 0 && spouses.map((s, idx) => (
          <div key={s._id || s.id || idx} style={{ display: "flex", alignItems: "center" }}>
            {renderCard(s)}
          </div>
        ))}

      </div>

      {/* Render con cái */}
      {children.length > 0 && (
        <ul style={{ padding: "20px 0 0 0", margin: 0, display: "flex", justifyContent: "center" }}>
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
  const [params, setParams] = useState({ depth: 3, includeSpouses: true, includeSiblings: true, format: "nested" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  // const canEdit = me?.role === "TREE_ADMIN" || me?.role === "SUPER_ADMIN";
  const roleStr = String(me?.role || "").toLowerCase();
  const canEdit = roleStr === "admin" || roleStr === "super_admin" || roleStr === "editor" || roleStr === "tree_admin";
  // Tree Element Ref for Export
  const treeRef = useRef(null);
  const [exporting, setExporting] = useState(false);

  // Context Menu State
  const [ctxMenu, setCtxMenu] = useState(null);

  // Add Person Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [addMode, setAddMode] = useState("root"); // root | relative
  const [targetNode, setTargetNode] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    birthYear: "",
    gender: "male",
    relation: "child",
    otherParentId: ""
  });
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
        setTree(res);
      }
    } catch (e) {
      setErr(formatError(e));
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
    try {
      let rawBranchId = targetNode?.branchId || tree?.branchId;
      const branchId = typeof rawBranchId === "object" ? rawBranchId._id : rawBranchId;

      if (!branchId) {
        alert("Không tìm thấy mã Chi cành (BranchId). Vui lòng thử lại!");
        return;
      }

      const personPayload = {
        branchId,
        fullName: formData.fullName,
        gender: formData.gender,
        privacy: "internal",
      };
      if (formData.birthYear) personPayload.dateOfBirth = `${formData.birthYear}-01-01`;

      const newPersonRes = await personsService.create(personPayload);
      const newPersonId = newPersonRes?.data?._id || newPersonRes?._id;

      if (addMode === "relative" && targetNode) {
        const targetId = targetNode._id || targetNode.id;

        let relPayload = {
          branchId,
          fromPersonId: "", toPersonId: "",
          type: formData.relation === "spouse" ? "spouse_of" : "parent_of"
        };

        if (formData.relation === "child") {
          relPayload.fromPersonId = targetId;
          relPayload.toPersonId = newPersonId;
        } else if (formData.relation === "parent") {
          relPayload.fromPersonId = newPersonId;
          relPayload.toPersonId = targetId;
        } else {
          relPayload.fromPersonId = targetId;
          relPayload.toPersonId = newPersonId;
        }
        await relationshipsService.create(relPayload);

        if (formData.relation === "child" && formData.otherParentId) {
          await relationshipsService.create({
            branchId,
            type: "parent_of",
            fromPersonId: formData.otherParentId,
            toPersonId: newPersonId
          });
        }
      }

      setShowAddModal(false);
      setFormData({ fullName: "", birthYear: "", gender: "male", relation: "child", otherParentId: "" });

      if (formData.relation === "parent") {
        nav(`/persons/${newPersonId}/tree`);
      } else {
        load(params);
      }

    } catch (err) {
      alert(formatError(err));
    }
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
      alert("Lỗi khi xuất ảnh: " + formatError(error));
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
              <div className="small">
                Sơ đồ quan hệ gia đình của: <strong style={{ color: "var(--primary)" }}>{tree ? (tree.fullName || tree.name) : "Đang tải..."}</strong>
              </div>
            </div>
            <div className="row" style={{ gap: 12 }}>

              <div style={{ position: "relative" }} className="export-menu-container">
                <button className="btn" disabled={exporting || loading || !tree}>
                  <Download size={18} style={{ marginRight: 8 }} /> {exporting ? "Đang xử lý..." : "Xuất File"}
                </button>
                <div className="export-dropdown" style={{ display: "none", position: "absolute", top: "100%", right: 0, marginTop: 4, background: "var(--surface-solid)", border: "1px solid var(--border)", borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", zIndex: 100, minWidth: 150, overflow: "auto" }}>
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

            {tree && tree.siblings && tree.siblings.length > 0 && (
              <div style={{ padding: "12px 24px", background: "rgba(246, 145, 19, 0.1)", borderRadius: 12, marginBottom: 24, display: "flex", alignItems: "center", gap: 12 }}>
                <div className="small" style={{ fontWeight: 600, color: "var(--accent)" }}>Anh/Chị/Em ruột:</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {tree.siblings.map(sib => (
                    <div key={sib._id || sib.id} className="badge internal" style={{ cursor: "pointer", background: "#fff", border: "1px solid var(--border)" }} onClick={() => nav(`/persons/${sib._id || sib.id}/tree`)}>
                      👥 {sib.fullName || sib.name}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {tree && tree.parents && tree.parents.length > 0 && (
              <div style={{ padding: "12px 24px", background: "rgba(59, 130, 246, 0.1)", borderRadius: 12, marginBottom: 24, display: "flex", alignItems: "center", gap: 12 }}>
                <div className="small" style={{ fontWeight: 600, color: "#3b82f6" }}>Chuyển Gốc Cây lên Cha/Mẹ:</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {tree.parents.map(parent => (
                    <div
                      key={parent._id || parent.id}
                      className="badge"
                      style={{ cursor: "pointer", background: "#fff", color: "#3b82f6", border: "1px solid #3b82f6", display: "flex", alignItems: "center", gap: 6, padding: "6px 12px" }}
                      onClick={() => nav(`/persons/${parent._id || parent.id}/tree`)}
                    >
                      Xem từ {parent.fullName || parent.name}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* BẮT ĐẦU: ĐOẠN CODE VẼ CÂY ĐÃ SỬA LẠI */}
            {tree && (
              <div
                className="family-tree-container"
                ref={treeRef}
                style={{ padding: 20, minWidth: "100%", display: "inline-block", textAlign: "center" }}
              >
                {/* CHÍNH LÀ THẺ DIV NÀY BỊ THIẾU NÈ: */}
                <div className="family-tree">
                  <ul>
                    <Node node={tree} onNodeClick={handleNodeClick} />
                  </ul>
                </div>
              </div>
            )}
            {/* KẾT THÚC: ĐOẠN CODE VẼ CÂY */}

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
                <input required className="input" placeholder="Nhập họ và tên..." value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} />
              </div>

              <div className="row" style={{ gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <label className="small" style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>Giới tính</label>
                  <select className="select" value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })}>
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label className="small" style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>Năm sinh</label>
                  <input className="input" type="number" placeholder="VD: 1990" value={formData.birthYear} onChange={(e) => setFormData({ ...formData, birthYear: e.target.value })} />
                </div>
              </div>

              {addMode === "relative" && (
                <div style={{ marginTop: 16 }}>
                  <label className="small" style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>
                    Mối quan hệ với {targetNode?.fullName || targetNode?.name}
                  </label>
                  <select className="select" value={formData.relation} onChange={(e) => setFormData({ ...formData, relation: e.target.value })}>
                    <option value="child">Là Con cái</option>
                    <option value="spouse">Là Vợ / Chồng</option>
                    <option value="parent">Là Cha / Mẹ</option>
                  </select>
                </div>
              )}

              {addMode === "relative" && formData.relation === "child" && targetNode?.spouses?.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <label className="small" style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>
                    Chọn Cha/Mẹ còn lại (Vợ/Chồng của {targetNode.fullName})
                  </label>
                  <select
                    className="select"
                    value={formData.otherParentId}
                    onChange={(e) => setFormData({ ...formData, otherParentId: e.target.value })}
                  >
                    <option value="">-- Không xác định --</option>
                    {targetNode.spouses.map(s => (
                      <option key={s._id || s.id} value={s._id || s.id}>
                        {s.fullName || s.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="row" style={{ marginTop: 24, justifyContent: "flex-end" }}>
                <button type="button" className="btn" onClick={() => setShowAddModal(false)}>Hủy bỏ</button>
                <button type="submit" className="btn primary">Xác nhận Thêm</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
