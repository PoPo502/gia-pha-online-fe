import { useEffect, useState } from "react";
import Topbar from "../components/Topbar.jsx";
import { useAuth } from "../store/auth.jsx";
import { Calendar, Video, Plus, Users, Clock, MapPin, Radio } from "lucide-react";
import { eventsService } from "../services/events.service.js";
import { branchesService } from "../services/branches.service.js";
import { mockStreams } from "../dev/mockData.js";


export default function Events() {
    const { me } = useAuth();
    const [activeTab, setActiveTab] = useState("events"); // events | live
    const [showAddModal, setShowAddModal] = useState(false);

    const [events, setEvents] = useState([]);
    const [streams, setStreams] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const data = await eventsService.list();
                setEvents(data.data || data || []);

                // Fetch media for streams if possible
                // const mediaData = await mediaService.list();
                // setStreams(mediaData.data || mediaData || []);
                setStreams(mockStreams); // Keep mock for streams for now as it's more UX focused
            } catch (e) {
                console.error("Failed to fetch events", e);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

useEffect(() => {
    (async () => {
        try {
            const res = await branchesService.list({ limit: 200 });
            const list = res?.data || res || [];
            const arr = Array.isArray(list) ? list : (list.data || []);
            setBranches(arr);
            // set default branchId
            if (arr.length && !formData.branchId) {
                setFormData((s) => ({ ...s, branchId: arr[0]._id }));
            }
        } catch (e) {
            setBranches([]);
        }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);


    const [branches, setBranches] = useState([]);
    const [formData, setFormData] = useState({ branchId: "", title: "", type: "other", eventDate: "", location: "", description: "", privacy: "internal", personIdsText: "" });

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await eventsService.create({
                branchId: formData.branchId,
                title: formData.title,
                type: formData.type || "other",
                eventDate: formData.eventDate ? new Date(formData.eventDate).toISOString() : null,
                location: formData.location || "",
                description: formData.description || "",
                privacy: formData.privacy || "internal",
                personIds: (formData.personIdsText || "")
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
            });
            alert("Đã tạo sự kiện thành công!");
            const data = await eventsService.list();
            setEvents(data.data || data || []);
            setShowAddModal(false);
        } catch (err) {
            alert("Lỗi khi tạo sự kiện: " + err.message);
        }
    };

    return (
        <>
            <Topbar />
            <div className="container" style={{ maxWidth: 1000 }}>

                <div className="row" style={{ justifyContent: "space-between", marginBottom: 24 }}>
                    <div>
                        <div className="title-md">Sự kiện & Phát trực tiếp</div>
                        <div className="small">Quản lý ngày giỗ, họp mặt và kết nối trực tuyến</div>
                    </div>
                    {(["admin","editor"].includes(String(me?.role||"").toLowerCase()) || me?.role === "TREE_ADMIN" || me?.role === "SUPER_ADMIN") && (
                        <button className="btn primary" onClick={() => setShowAddModal(true)}>
                            <Plus size={18} style={{ marginRight: 6 }} /> Tạo mới
                        </button>
                    )}
                </div>

                {/* Custom Tabs */}
                <div style={{ display: "flex", gap: 16, borderBottom: "1px solid var(--border)", marginBottom: 24 }}>
                    <button
                        onClick={() => setActiveTab("events")}
                        style={{
                            padding: "12px 24px",
                            background: "none",
                            border: "none",
                            borderBottom: activeTab === "events" ? "3px solid var(--primary)" : "3px solid transparent",
                            color: activeTab === "events" ? "var(--primary)" : "var(--text-light)",
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 8
                        }}
                    >
                        <Calendar size={18} /> Lịch Sự kiện
                    </button>
                    <button
                        onClick={() => setActiveTab("live")}
                        style={{
                            padding: "12px 24px",
                            background: "none",
                            border: "none",
                            borderBottom: activeTab === "live" ? "3px solid var(--primary)" : "3px solid transparent",
                            color: activeTab === "live" ? "var(--primary)" : "var(--text-light)",
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 8
                        }}
                    >
                        <Video size={18} /> Phát trực tiếp
                    </button>
                </div>

                <div className="row" style={{ alignItems: "flex-start", gap: 24 }}>

                    <div style={{ flex: 2 }}>
                        {activeTab === "events" && (
                            <div className="stack" style={{ gap: 16 }}>
                                {events.map(ev => (
                                    <div key={ev._id || ev.id} className="card">
                                        <div className="row" style={{ justifyContent: "space-between", marginBottom: 12 }}>
                                            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--primary)" }}>{ev.title}</div>
                                            <span className="badge internal">{ev.type || "Sự kiện"}</span>
                                        </div>
                                        <div className="stack" style={{ gap: 8, color: "var(--text-dark)" }}>
                                            <div className="row" style={{ gap: 8 }}><Calendar size={16} color="var(--text-light)" /> <strong>{ev.date ? new Date(ev.date).toLocaleDateString('vi-VN') : "N/A"}</strong></div>
                                            <div className="row" style={{ gap: 8 }}><MapPin size={16} color="var(--text-light)" /> <span>{ev.location || "Chưa cập nhật địa điểm"}</span></div>
                                            <p className="small" style={{ color: "var(--text-light)" }}>{ev.description}</p>
                                        </div>
                                        <div className="row" style={{ marginTop: 16, gap: 12 }}>
                                            <button className="btn primary">Đăng ký tham gia</button>
                                            <button className="btn outline">Xem chi tiết</button>
                                        </div>
                                    </div>
                                ))}
                                {events.length === 0 && !loading && (
                                    <div className="card" style={{ textAlign: "center", padding: 40, color: "var(--text-light)" }}>Chưa có sự kiện nào được lên lịch.</div>
                                )}
                                {loading && <div className="small" style={{ textAlign: "center", padding: 40 }}>Đang tải sự kiện...</div>}

                            </div>
                        )}

                        {activeTab === "live" && (
                            <div className="stack" style={{ gap: 16 }}>
                                {mockStreams.map(st => (
                                    <div key={st.id} className="card">
                                        <div style={{ aspectRatio: "16/9", background: "var(--surface-hover)", borderRadius: "var(--radius-lg)", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                                            {st.status === "live" ? (
                                                <div style={{ position: "absolute", top: 12, left: 12, background: "var(--danger)", color: "#fff", padding: "4px 8px", borderRadius: 4, fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 4, animation: "pulse 2s infinite" }}>
                                                    <Radio size={14} /> TRỰC TIẾP
                                                </div>
                                            ) : (
                                                <div style={{ position: "absolute", top: 12, left: 12, background: "var(--text-light)", color: "#fff", padding: "4px 8px", borderRadius: 4, fontSize: 12, fontWeight: 700 }}>
                                                    ĐÃ KẾT THÚC
                                                </div>
                                            )}

                                            {st.status === "live" && <button className="avatar" style={{ width: 64, height: 64, background: "rgba(255,255,255,0.2)", backdropFilter: "blur(4px)", color: "#fff", border: "2px solid #fff" }}><Video size={32} /></button>}
                                            {st.status === "ended" && <div className="small" style={{ color: "var(--text-light)" }}>Video xem lại đang được xử lý</div>}
                                        </div>

                                        <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text-dark)", marginBottom: 8 }}>{st.title}</div>
                                        <div className="row" style={{ justifyContent: "space-between" }}>
                                            <div className="small" style={{ color: "var(--text-light)" }}>Đăng bởi: {st.user}</div>
                                            <div className="row" style={{ gap: 8, color: "var(--text-light)" }}><Users size={16} /> <span>{st.viewers} người xem</span></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div style={{ flex: 1 }}>
                        <div className="card" style={{ background: "var(--primary-light)", borderColor: "transparent" }}>
                            <div className="row" style={{ gap: 12, marginBottom: 16 }}>
                                <div className="avatar" style={{ background: "var(--primary)", color: "#fff", width: 40, height: 40 }}><Calendar size={20} /></div>
                                <div style={{ fontWeight: 600, color: "var(--text-dark)" }}>Tiện ích ngày tháng</div>
                            </div>
                            <p className="small" style={{ marginBottom: 16 }}>Hệ thống tự động quy đổi ngày giỗ từ Âm lịch sang Dương lịch vào mỗi năm để nhắc nhở con cháu chuẩn bị.</p>
                            <button className="btn outline" style={{ width: "100%", justifyContent: "center", background: "#fff" }}>Xem Lịch Âm Toàn Tập</button>
                        </div>
                    </div>

                </div>

            </div>

            {/* Add Modal */}
            {showAddModal && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
                    <div className="card" style={{ width: 500, maxWidth: "90vw", animation: "slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1)" }}>
                        <div className="title-md" style={{ marginBottom: 16 }}>
                            Tạo sự kiện hoặc Phát trực tiếp
                        </div>

                        <form onSubmit={handleCreate} className="stack" style={{ gap: 12 }}>
                            <div>
                                <label className="small" style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>Chi nhánh (Branch)</label>
                                <select
                                    className="select"
                                    required
                                    value={formData.branchId}
                                    onChange={(e) => setFormData((s) => ({ ...s, branchId: e.target.value }))}
                                >
                                    {branches.length === 0 && <option value="">(Chưa có chi nhánh)</option>}
                                    {branches.map((b) => (
                                        <option key={b._id} value={b._id}>{b.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="small" style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>Tiêu đề</label>
                                <input
                                    required
                                    className="input"
                                    placeholder="Nhập tiêu đề..."
                                    value={formData.title}
                                    onChange={(e) => setFormData((s) => ({ ...s, title: e.target.value }))}
                                />
                            </div>

                            <div className="row" style={{ gap: 12 }}>
                                <div style={{ flex: 1 }}>
                                    <label className="small" style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>Loại sự kiện</label>
                                    <select
                                        className="select"
                                        value={formData.type}
                                        onChange={(e) => setFormData((s) => ({ ...s, type: e.target.value }))}
                                    >
                                        <option value="birth">Sinh</option>
                                        <option value="death">Mất</option>
                                        <option value="marriage">Kết hôn</option>
                                        <option value="anniversary">Giỗ / Kỷ niệm</option>
                                        <option value="other">Khác</option>
                                    </select>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label className="small" style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>Thời gian</label>
                                    <input
                                        className="input"
                                        type="datetime-local"
                                        value={formData.eventDate}
                                        onChange={(e) => setFormData((s) => ({ ...s, eventDate: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <div className="row" style={{ gap: 12 }}>
                                <div style={{ flex: 1 }}>
                                    <label className="small" style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>Privacy</label>
                                    <select
                                        className="select"
                                        value={formData.privacy}
                                        onChange={(e) => setFormData((s) => ({ ...s, privacy: e.target.value }))}
                                    >
                                        <option value="public">public</option>
                                        <option value="internal">internal</option>
                                        <option value="sensitive">sensitive</option>
                                    </select>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label className="small" style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>Person IDs (tuỳ chọn)</label>
                                    <input
                                        className="input"
                                        placeholder="vd: 65f..., 65a..., ..."
                                        value={formData.personIdsText}
                                        onChange={(e) => setFormData((s) => ({ ...s, personIdsText: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="small" style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>Địa điểm</label>
                                <input
                                    className="input"
                                    placeholder="Địa điểm..."
                                    value={formData.location}
                                    onChange={(e) => setFormData((s) => ({ ...s, location: e.target.value }))}
                                />
                            </div>

                            <div>
                                <label className="small" style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>Mô tả</label>
                                <textarea
                                    className="input"
                                    placeholder="Mô tả..."
                                    rows={4}
                                    value={formData.description}
                                    onChange={(e) => setFormData((s) => ({ ...s, description: e.target.value }))}
                                />
                            </div>

                            <div className="row" style={{ justifyContent: "flex-end", marginTop: 10, gap: 10 }}>
                                <button type="button" className="btn outline" onClick={() => setShowAddModal(false)}>Hủy</button>
                                <button className="btn primary" type="submit" disabled={!formData.branchId || !formData.title}>
                                    Tạo sự kiện
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
          70% { box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
      `}</style>
        </>
    );
}
