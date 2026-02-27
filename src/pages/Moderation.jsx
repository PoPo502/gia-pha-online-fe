import { useState } from "react";
import Topbar from "../components/Topbar.jsx";
import { CheckCircle, XCircle, Clock, Image as ImageIcon, Video, FileText } from "lucide-react";

export default function Moderation() {
    const [activeTab, setActiveTab] = useState("pending");

    // Mock pending items
    const [items, setItems] = useState([
        {
            id: 1,
            type: "post",
            user: "Nguyễn Văn A",
            time: "10 phút trước",
            content: "Nhớ ngày xưa ông nội hay dẫn đi hội làng, giờ bồi hồi quá...",
            status: "pending"
        },
        {
            id: 2,
            type: "image",
            user: "Trần Thị B",
            time: "2 giờ trước",
            content: "Ảnh gia đình mùng 1 Tết",
            image: "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=300&q=80",
            status: "pending"
        },
        {
            id: 3,
            type: "livestream",
            user: "Lê Văn C",
            time: "Hôm qua",
            content: "Phát trực tiếp: Lễ khánh thành từ đường",
            status: "pending"
        },
        {
            id: 4,
            type: "post",
            user: "Hoàng Đức D",
            time: "2 ngày trước",
            content: "Chúc mừng sinh nhật bác Hai!",
            status: "approved"
        }
    ]);

    const handleAction = (id, newStatus) => {
        setItems(items.map(item => item.id === id ? { ...item, status: newStatus } : item));
    };

    const pendingItems = items.filter(i => i.status === "pending");
    const processedItems = items.filter(i => i.status !== "pending");

    const displayItems = activeTab === "pending" ? pendingItems : processedItems;

    const getTypeIcon = (type) => {
        switch (type) {
            case "image": return <ImageIcon size={18} color="var(--primary)" />;
            case "livestream": return <Video size={18} color="var(--danger)" />;
            default: return <FileText size={18} color="var(--green)" />;
        }
    };

    return (
        <>
            <Topbar />
            <div className="container" style={{ maxWidth: 860 }}>
                <div className="title-md" style={{ marginBottom: 8 }}>Trạm kiểm duyệt Nội dung</div>
                <div className="small" style={{ color: "var(--text-light)", marginBottom: 24 }}>
                    Kiểm duyệt bài viết, hình ảnh, và yêu cầu phát trực tiếp từ các thành viên trong nhánh trước khi hiển thị công khai.
                </div>

                {/* Tabs */}
                <div className="tabs" style={{ marginBottom: 24, display: "flex", gap: 8, borderBottom: "1px solid var(--border)", paddingBottom: 8 }}>
                    <button
                        className={`btn ${activeTab === "pending" ? "primary" : "outline"}`}
                        onClick={() => setActiveTab("pending")}
                        style={{ borderRadius: 999, padding: "8px 20px" }}
                    >
                        Chờ duyệt ({pendingItems.length})
                    </button>
                    <button
                        className={`btn ${activeTab === "processed" ? "primary" : "outline"}`}
                        onClick={() => setActiveTab("processed")}
                        style={{ borderRadius: 999, padding: "8px 20px" }}
                    >
                        Đã xử lý ({processedItems.length})
                    </button>
                </div>

                {/* Content List */}
                <div className="stack" style={{ gap: 16 }}>
                    {displayItems.length === 0 ? (
                        <div className="card" style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-light)" }}>
                            <CheckCircle size={48} color="var(--border)" style={{ marginBottom: 16, margin: "0 auto" }} />
                            <div style={{ fontSize: 18, fontWeight: 500, color: "var(--text-dark)", marginTop: 16 }}>Không có nội dung nào</div>
                            <div className="small">Bạn đã duyệt hết tất cả yêu cầu!</div>
                        </div>
                    ) : (
                        displayItems.map(item => (
                            <div key={item.id} className="card" style={{ padding: 20 }}>
                                <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                                    <div className="row" style={{ gap: 12 }}>
                                        <div className="avatar" style={{ width: 40, height: 40 }}>{item.user[0]}</div>
                                        <div>
                                            <div style={{ fontWeight: 600 }}>{item.user}</div>
                                            <div className="small row" style={{ color: "var(--text-light)", gap: 6, marginTop: 4 }}>
                                                <Clock size={12} /> {item.time}
                                                <span style={{ margin: "0 4px" }}>•</span>
                                                {getTypeIcon(item.type)} {item.type.toUpperCase()}
                                            </div>
                                        </div>
                                    </div>

                                    {item.status !== "pending" && (
                                        <span className={`badge ${item.status === "approved" ? "public" : "internal"}`}>
                                            {item.status === "approved" ? "Đã duyệt" : "Từ chối"}
                                        </span>
                                    )}
                                </div>

                                <div style={{ background: "var(--surface-solid)", padding: 16, borderRadius: 8, marginBottom: 16 }}>
                                    <div style={{ fontSize: 15, lineHeight: 1.5 }}>{item.content}</div>
                                    {item.image && (
                                        <img src={item.image} alt="Preview" style={{ width: "100%", maxHeight: 300, objectFit: "cover", borderRadius: 8, marginTop: 12 }} />
                                    )}
                                    {item.type === "livestream" && (
                                        <div style={{ marginTop: 12, padding: 12, border: "1px dashed var(--danger)", borderRadius: 8, color: "var(--danger)", textAlign: "center", fontWeight: 500 }}>
                                            Yêu cầu mở luồng Phát trực tiếp
                                        </div>
                                    )}
                                </div>

                                {item.status === "pending" && (
                                    <div className="row" style={{ gap: 12, justifyContent: "flex-end", marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
                                        <button className="btn outline" style={{ color: "var(--danger)", borderColor: "rgba(239, 68, 68, 0.2)" }} onClick={() => handleAction(item.id, "rejected")}>
                                            <XCircle size={16} style={{ marginRight: 6 }} /> Từ chối
                                        </button>
                                        <button className="btn primary" onClick={() => handleAction(item.id, "approved")}>
                                            <CheckCircle size={16} style={{ marginRight: 6 }} /> Phê duyệt
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>

            </div>
        </>
    );
}
