import { useEffect, useState } from "react";
import Topbar from "../components/Topbar.jsx";
import { useAuth } from "../store/auth.jsx";
import { Calendar, Video, Plus, Users, Clock, MapPin, Radio } from "lucide-react";
import { eventsService } from "../services/events.service.js";
import { branchesService } from "../services/branches.service.js";
import { mockStreams } from "../dev/mockData.js";


export default function Events() {
    const { me } = useAuth();
    const isAdmin = ["admin", "editor", "tree_admin", "super_admin"].includes(String(me?.role || "").toLowerCase());

    const [activeTab, setActiveTab] = useState("events"); // events | live | pending
    const [showAddModal, setShowAddModal] = useState(false);
    const [registeredEvents, setRegisteredEvents] = useState({});

    const [events, setEvents] = useState([]);
    const [streams, setStreams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [approvingId, setApprovingId] = useState(null);

    // Phân loại sự kiện theo trạng thái
    const pendingEvents = events.filter(e => !e.status || e.status === "pending");
    const approvedEvents = events.filter(e => e.status === "approved" || e.status === "active");
    // Nếu không có trường status, coi tất cả là approved cho user bình thường
    const userEvents = isAdmin ? approvedEvents : events;

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                if (isAdmin) {
                    const [approvedRes, pendingRes] = await Promise.all([
                        eventsService.list({ status: "approved" }),
                        eventsService.list({ status: "pending" })
                    ]);
                    const approved = approvedRes.data || approvedRes || [];
                    const pending = pendingRes.data || pendingRes || [];
                    setEvents([...approved, ...pending]);
                } else {
                    const data = await eventsService.list({ status: "approved" });
                    setEvents(data.data || data || []);
                }

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

    const [branches, setBranches] = useState([]);
    const [formData, setFormData] = useState({ branchId: "", title: "", type: "other", eventDate: "", location: "", description: "", privacy: "internal", personIdsText: "" });

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

    const handleApproveEvent = async (eventId) => {
        setApprovingId(eventId);
        try {
            await eventsService.updateStatus(eventId, "approved");
            // Sau khi duyệt xong, cập nhật status trong local state
            setEvents(prev => prev.map(e =>
                (e._id || e.id) === eventId ? { ...e, status: "approved" } : e
            ));
        } catch (e) {
            alert("Lỗi khi duyệt sự kiện: " + e.message);
        } finally {
            setApprovingId(null);
        }
    };

    const handleRejectEvent = async (eventId) => {
        if (!window.confirm("Bạn có chắc chắn muốn từ chối sự kiện này?")) return;
        setApprovingId(eventId);
        try {
            await eventsService.updateStatus(eventId, "rejected");
            setEvents(prev => prev.filter(e => (e._id || e.id) !== eventId));
        } catch (e) {
            alert("Lỗi khi từ chối sự kiện: " + e.message);
        } finally {
            setApprovingId(null);
        }
    };

    const handleDeleteEvent = async (eventId) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa sự kiện này?")) return;
        try {
            await eventsService.remove(eventId);
            setEvents(prev => prev.filter(e => (e._id || e.id) !== eventId));
        } catch (e) {
            alert("Lỗi khi xóa sự kiện: " + e.message);
        }
    };

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
            alert(isAdmin ? "Đã tạo sự kiện thành công!" : "Đã gửi yêu cầu tạo sự kiện thành công. Vui lòng chờ Ban quản trị duyệt!");

            // Refetch based on role
            if (isAdmin) {
                const [approvedRes, pendingRes] = await Promise.all([
                    eventsService.list({ status: "approved" }),
                    eventsService.list({ status: "pending" })
                ]);
                const approved = approvedRes.data || approvedRes || [];
                const pending = pendingRes.data || pendingRes || [];
                setEvents([...approved, ...pending]);
            } else {
                const data = await eventsService.list({ status: "approved" });
                setEvents(data.data || data || []);
            }
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
                    {/* Cho phép tất cả user nhấn Tạo mới, user thường tạo ra sẽ ở trạng thái pending */}
                    <button className="btn primary" onClick={() => setShowAddModal(true)}>
                        <Plus size={18} style={{ marginRight: 6 }} /> Tạo sự kiện / Đăng ký Phát trực tiếp
                    </button>
                </div>

                {/* Tabs */}
                <div style={{ display: "flex", gap: 16, borderBottom: "1px solid var(--border)", marginBottom: 24 }}>
                    <button
                        onClick={() => setActiveTab("events")}
                        style={{
                            padding: "12px 24px", background: "none", border: "none",
                            borderBottom: activeTab === "events" ? "3px solid var(--primary)" : "3px solid transparent",
                            color: activeTab === "events" ? "var(--primary)" : "var(--text-light)",
                            fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8
                        }}
                    >
                        <Calendar size={18} /> Lịch Sự kiện {isAdmin && approvedEvents.length > 0 && <span style={{ background: "var(--primary-light)", color: "var(--primary)", borderRadius: 12, padding: "2px 8px", fontSize: 12 }}>{approvedEvents.length}</span>}
                    </button>
                    {isAdmin && (
                        <button
                            onClick={() => setActiveTab("pending")}
                            style={{
                                padding: "12px 24px", background: "none", border: "none",
                                borderBottom: activeTab === "pending" ? "3px solid var(--primary)" : "3px solid transparent",
                                color: activeTab === "pending" ? "var(--primary)" : "var(--text-light)",
                                fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8
                            }}
                        >
                            Chờ duyệt
                            {pendingEvents.length > 0 && (
                                <span style={{ background: "var(--danger)", color: "#fff", borderRadius: 12, padding: "2px 8px", fontSize: 12 }}>{pendingEvents.length}</span>
                            )}
                        </button>
                    )}
                    <button
                        onClick={() => setActiveTab("live")}
                        style={{
                            padding: "12px 24px", background: "none", border: "none",
                            borderBottom: activeTab === "live" ? "3px solid var(--primary)" : "3px solid transparent",
                            color: activeTab === "live" ? "var(--primary)" : "var(--text-light)",
                            fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8
                        }}
                    >
                        <Video size={18} /> Phát trực tiếp
                    </button>
                </div>

                <div className="row" style={{ alignItems: "flex-start", gap: 24 }}>

                    <div style={{ flex: 2 }}>
                        {/* Tab: Sự kiện đã duyệt (tất cả user) */}
                        {activeTab === "events" && (
                            <div className="stack" style={{ gap: 16 }}>
                                {(isAdmin ? approvedEvents : userEvents).map(ev => (
                                    <div key={ev._id || ev.id} className="card">
                                        <div className="row" style={{ justifyContent: "space-between", marginBottom: 12 }}>
                                            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--primary)" }}>{ev.title}</div>
                                            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                                <span className="badge public" style={{ fontSize: 11 }}>✓ Đã duyệt</span>
                                                <span className="badge internal">{ev.type || "Sự kiện"}</span>
                                            </div>
                                        </div>
                                        <div className="stack" style={{ gap: 8, color: "var(--text-dark)" }}>
                                            <div className="row" style={{ gap: 8 }}><Calendar size={16} color="var(--text-light)" /> <strong>{ev.date || ev.eventDate ? new Date(ev.date || ev.eventDate).toLocaleDateString('vi-VN') : "N/A"}</strong></div>
                                            <div className="row" style={{ gap: 8 }}><MapPin size={16} color="var(--text-light)" /> <span>{ev.location || "Chưa cập nhật địa điểm"}</span></div>
                                            <p className="small" style={{ color: "var(--text-light)" }}>{ev.description}</p>
                                        </div>
                                        <div className="row" style={{ marginTop: 16, gap: 12 }}>
                                            {!isAdmin && (
                                                !registeredEvents[ev._id || ev.id] ? (
                                                    <button className="btn primary" onClick={() => setRegisteredEvents(prev => ({ ...prev, [ev._id || ev.id]: true }))}>
                                                        Đăng ký tham gia
                                                    </button>
                                                ) : (
                                                    <button className="btn" style={{ background: "#e0f2fe", color: "var(--primary)", fontWeight: "bold" }} onClick={() => setRegisteredEvents(prev => ({ ...prev, [ev._id || ev.id]: false }))}>
                                                        ✓ Đã đăng ký
                                                    </button>
                                                )
                                            )}
                                            {isAdmin && (
                                                <button className="btn outline" style={{ color: "var(--danger)", borderColor: "var(--danger)" }} onClick={() => handleDeleteEvent(ev._id || ev.id)}>Xóa</button>
                                            )}
                                            <button className="btn outline">Xem chi tiết</button>
                                        </div>
                                    </div>
                                ))}
                                {(isAdmin ? approvedEvents : userEvents).length === 0 && !loading && (
                                    <div className="card" style={{ textAlign: "center", padding: 40, color: "var(--text-light)" }}>Chưa có sự kiện nào được duyệt.</div>
                                )}
                            </div>
                        )}

                        {/* Tab: Hàng chờ duyệt (chỉ admin) */}
                        {activeTab === "pending" && isAdmin && (
                            <div className="stack" style={{ gap: 16 }}>
                                {pendingEvents.length === 0 ? (
                                    <div className="card" style={{ textAlign: "center", padding: 60, color: "var(--text-light)" }}>
                                        <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
                                        <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 8 }}>Sạch hàng chờ!</div>
                                        <div className="small">Không có sự kiện nào đang chờ duyệt.</div>
                                    </div>
                                ) : pendingEvents.map(ev => (
                                    <div key={ev._id || ev.id} className="card" style={{ borderLeft: "4px solid var(--primary)" }}>
                                        <div className="row" style={{ justifyContent: "space-between", marginBottom: 12 }}>
                                            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text-dark)" }}>{ev.title}</div>
                                            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                                <span className="badge sensitive" style={{ fontSize: 11 }}>Chờ duyệt</span>
                                                <span className="badge internal">{ev.type || "Sự kiện"}</span>
                                            </div>
                                        </div>
                                        <div className="stack" style={{ gap: 8, color: "var(--text-dark)", marginBottom: 16 }}>
                                            <div className="row" style={{ gap: 8 }}><Calendar size={16} color="var(--text-light)" /> <strong>{ev.date || ev.eventDate ? new Date(ev.date || ev.eventDate).toLocaleDateString('vi-VN') : "N/A"}</strong></div>
                                            <div className="row" style={{ gap: 8 }}><MapPin size={16} color="var(--text-light)" /> <span>{ev.location || "Chưa cập nhật địa điểm"}</span></div>
                                            <p className="small" style={{ color: "var(--text-light)" }}>{ev.description}</p>
                                        </div>
                                        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16, display: "flex", gap: 12 }}>
                                            <button
                                                className="btn primary"
                                                disabled={approvingId === (ev._id || ev.id)}
                                                onClick={() => handleApproveEvent(ev._id || ev.id)}
                                            >
                                                {approvingId === (ev._id || ev.id) ? "Đang duyệt..." : "✓ Duyệt sự kiện"}
                                            </button>
                                            <button
                                                className="btn outline"
                                                disabled={approvingId === (ev._id || ev.id)}
                                                style={{ color: "var(--danger)", borderColor: "rgba(239,68,68,0.4)" }}
                                                onClick={() => handleRejectEvent(ev._id || ev.id)}
                                            >
                                                Từ chối
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {loading && <div className="small" style={{ textAlign: "center", padding: 40 }}>Đang tải sự kiện...</div>}

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

                        {!isAdmin && (
                            <div style={{ background: "rgba(239, 68, 68, 0.1)", color: "var(--danger)", padding: "12px", borderRadius: "8px", marginBottom: "16px", fontSize: "14px", fontWeight: "500", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
                                ℹ️ Sự kiện bạn tạo sẽ được đưa vào hàng chờ duyệt. Vui lòng chờ Ban quản trị (Admin) kiểm duyệt trước khi hiển thị công khai.
                            </div>
                        )}

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
                                    {isAdmin ? "Tạo sự kiện" : "Gửi yêu cầu phê duyệt"}
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
