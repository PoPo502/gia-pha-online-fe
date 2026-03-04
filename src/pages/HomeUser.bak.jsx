import { useEffect, useState } from "react";
import Topbar from "../components/Topbar.jsx";
import { useAuth } from "../store/auth.jsx";
import { Link } from "react-router-dom";
import { personsService } from "../services/persons.service.js";
import { eventsService } from "../services/events.service.js";
import { postsService } from "../services/posts.service.js";
import { Search, Edit3, Radio, Home as HomeIcon, Video, Image as ImageIcon, Heart, MessageSquare, Camera, GitBranch, Users, Gift, Calendar } from "lucide-react";

export default function HomeUser() {
    const { me } = useAuth();
    const [members, setMembers] = useState([]);
    const [stats, setStats] = useState({ total: 0 });
    const [todayEvents, setTodayEvents] = useState([]);

    // Post states
    const [posts, setPosts] = useState([]);

    const [showModal, setShowModal] = useState(false);
    const [newContent, setNewContent] = useState("");

    const [showFeelingModal, setShowFeelingModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedFeeling, setSelectedFeeling] = useState("");

    // Bổ sung State dùng cho Bình luận
    const [openComments, setOpenComments] = useState({});
    const [commentsData, setCommentsData] = useState({});
    const [commentTexts, setCommentTexts] = useState({});

    const feelings = [
        { emoji: "😀", label: "Hạnh phúc" },
        { emoji: "🥳", label: "Hào hứng" },
        { emoji: "🥰", label: "Được yêu" },
        { emoji: "😎", label: "Tuyệt vời" },
        { emoji: "🤔", label: "Đang nghĩ" },
        { emoji: "😌", label: "Thư giãn" }
    ];

    useEffect(() => {
        async function fetchData() {
            try {
                const data = await personsService.list({ limit: 12 });
                const list = data.data || data;
                setMembers(Array.isArray(list) ? list : (list.data || []));
                if (data.meta) setStats(s => ({ ...s, total: data.meta.total }));

                const today = new Date().toISOString().split('T')[0];
                const evRes = await eventsService.list({ dateFrom: today, dateTo: today });
                setTodayEvents(evRes.data || evRes || []);

                const postsRes = await postsService.list();
                setPosts(postsRes || []);
            } catch (e) {
                console.error("Failed to fetch data", e);
            }
        }
        fetchData();
    }, []);

    const handleCreatePost = async (e) => {
        e.preventDefault();
        if (!newContent.trim() && !selectedImage) return;

        try {
            const rawContent = newContent + (selectedFeeling ? ` - Đang cảm thấy ${selectedFeeling}` : "");

            // Xây dựng payload để gọi API
            const payload = {
                user: me?.fullName || "Thành viên",
                avatar: (me?.fullName || "U").charAt(0),
                avatarColor: "var(--primary)",
                time: "Vừa xong",
                content: rawContent,
                image: selectedImage,
                likes: 0
            };

            const createdPost = await postsService.create(payload);

            // Cập nhật giao diện với data từ Backend trả về
            setPosts([createdPost, ...posts]);
            setNewContent("");
            setSelectedFeeling("");
            setSelectedImage(null);
            setShowModal(false);
        } catch (err) {
            console.error("Lỗi khi tạo bài viết:", err);
            alert("Đã xảy ra lỗi khi tạo bài viết. Vui lòng thử lại!");
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setSelectedImage(url);
            setShowModal(true);
        }
    };

    const handleLike = async (postId) => {
        try {
            await postsService.toggleLike(postId);
            const postsRes = await postsService.list();
            setPosts(postsRes || []);
        } catch (e) {
            console.error("Lỗi khi thả tim:", e);
        }
    };

    const toggleCommentsBox = async (postId) => {
        const isCurrentlyOpen = !!openComments[postId];
        setOpenComments(prev => ({ ...prev, [postId]: !isCurrentlyOpen }));

        if (!isCurrentlyOpen) {
            try {
                const cmtList = await postsService.getComments(postId);
                setCommentsData(prev => ({ ...prev, [postId]: cmtList }));
            } catch (e) {
                console.error("Lỗi khi tải bình luận", e);
            }
        }
    };

    const handleSendComment = async (postId) => {
        const text = commentTexts[postId];
        if (!text || !text.trim()) return;

        try {
            await postsService.addComment(postId, text);
            setCommentTexts(prev => ({ ...prev, [postId]: "" }));
            const cmtList = await postsService.getComments(postId);
            setCommentsData(prev => ({ ...prev, [postId]: cmtList }));
        } catch (e) {
            console.error("Lỗi gửi bình luận", e);
        }
    };

    return (
        <>
            <Topbar />
            <div className="social-layout">
                {/* ... existing sidebar ... */}
                <aside style={{ width: 280, flexShrink: 0 }}>
                    <div className="sidebar-sticky">
                        <div className="card" style={{ padding: 12, borderRadius: 18, marginBottom: 24 }}>
                            <div className="stack" style={{ gap: 4 }}>
                                <Link to="/search/persons" className="btn" style={{ justifyContent: "flex-start", padding: "10px 16px", background: "rgba(238, 77, 45, 0.04)", border: "none", boxShadow: "none", color: "var(--primary)", fontWeight: 700 }}>
                                    <Search size={22} style={{ marginRight: 12 }} /> <span style={{ fontSize: 15 }}>Tìm kiếm</span>
                                </Link>
                                <button
                                    className="btn"
                                    onClick={() => setShowModal(true)}
                                    style={{ justifyContent: "flex-start", padding: "10px 16px", background: "transparent", border: "none", boxShadow: "none" }}
                                >
                                    <Edit3 size={22} style={{ marginRight: 12 }} /> <span style={{ fontSize: 15, fontWeight: 500 }}>Bài viết mới</span>
                                </button>
                                <Link to="/events" className="btn" style={{ justifyContent: "flex-start", padding: "10px 16px", background: "transparent", border: "none", boxShadow: "none" }}>
                                    <Radio size={22} style={{ marginRight: 12 }} /> <span style={{ fontSize: 15, fontWeight: 500 }}>Phát trực tiếp</span>
                                </Link>
                                <Link to="/" className="btn" style={{ justifyContent: "flex-start", padding: "10px 16px", background: "transparent", border: "none", boxShadow: "none" }}>
                                    <HomeIcon size={22} style={{ marginRight: 12 }} /> <span style={{ fontSize: 15, fontWeight: 500 }}>Trang chủ</span>
                                </Link>
                            </div>
                        </div>

                        <div className="card" style={{ padding: 20, borderRadius: 22, marginBottom: 24, border: "1px solid var(--border)", background: "#fff" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                                <div style={{ width: 34, height: 34, background: "var(--primary-light)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <GitBranch size={19} color="var(--primary)" />
                                </div>
                                <div style={{ fontWeight: 800, fontSize: 16 }}>Cây gia phả con</div>
                            </div>
                            <div style={{ height: 160, background: "#fdfdfd", borderRadius: 14, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: "1px dashed #eee" }}>
                                <svg viewBox="0 0 100 80" style={{ width: 80, height: 80, marginBottom: 12 }}>
                                    <circle cx="50" cy="15" r="6" fill="var(--primary)" />
                                    <line x1="50" y1="21" x2="30" y2="40" stroke="#ddd" strokeWidth="2" />
                                    <line x1="50" y1="21" x2="70" y2="40" stroke="#ddd" strokeWidth="2" />
                                    <circle cx="30" cy="40" r="6" fill="var(--accent)" />
                                    <circle cx="70" cy="40" r="6" fill="var(--accent)" />
                                </svg>
                                <Link to={me?.id ? `/persons/${me.id}/tree` : "/search/persons"} className="btn small primary" style={{ borderRadius: 10, padding: "8px 20px", fontWeight: 700 }}>Xem chi cành</Link>
                            </div>
                            <div className="small" style={{ marginTop: 14, color: "var(--muted)", textAlign: "center", fontWeight: 500 }}>Sơ đồ huyết thống trực hệ của gia đình bạn.</div>
                        </div>

                        <div className="card" style={{ padding: 20, borderRadius: 22, border: "1px solid var(--border)", background: "#fff" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                                <div style={{ width: 34, height: 34, background: "rgba(208, 1, 27, 0.08)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <Users size={19} color="var(--red)" />
                                </div>
                                <div style={{ fontWeight: 800, fontSize: 16 }}>Cây gia phả đầy đủ</div>
                            </div>
                            <div style={{ height: 160, background: "#fdfdfd", borderRadius: 14, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: "1px dashed #eee" }}>
                                <svg viewBox="0 0 120 100" style={{ width: 100, height: 80, marginBottom: 12 }}>
                                    <circle cx="60" cy="10" r="5" fill="var(--red)" />
                                    <line x1="60" y1="15" x2="30" y2="35" stroke="#ddd" strokeWidth="2" />
                                    <line x1="60" y1="15" x2="90" y2="35" stroke="#ddd" strokeWidth="2" />
                                    <circle cx="30" cy="35" r="5" fill="var(--accent)" />
                                    <circle cx="90" cy="35" r="5" fill="var(--accent)" />
                                </svg>
                                <Link to="/persons" className="btn small outline" style={{ borderRadius: 10, color: "var(--red)", borderColor: "var(--red)", fontWeight: 700 }}>Toàn cảnh gia tộc</Link>
                            </div>
                            <div className="small" style={{ marginTop: 14, color: "var(--muted)", textAlign: "center", fontWeight: 500 }}>Toàn bộ phả đồ của đại gia đình.</div>
                        </div>
                    </div>
                </aside>

                <main className="feed">
                    <div style={{
                        textAlign: "center",
                        marginBottom: 40,
                        padding: "40px 20px",
                        background: "linear-gradient(135deg, #fff 0%, #fff5f2 100%)",
                        borderRadius: 24,
                        border: "1px solid rgba(238, 77, 45, 0.1)",
                        boxShadow: "0 10px 30px rgba(238, 77, 45, 0.05)"
                    }}>
                        <h1 style={{ fontSize: 32, fontWeight: 900, color: "var(--text-dark)", marginBottom: 16 }}>
                            Chào mừng, <span style={{ color: "var(--primary)" }}>{me?.fullName || "Thành viên"}!</span>
                        </h1>
                        <Link to="/persons" className="btn primary" style={{ height: 52, padding: "0 40px", fontSize: 18, fontWeight: 700, borderRadius: 14 }}>
                            Khám phá gia tộc ngay
                        </Link>
                    </div>

                    <div className="post-input-box" style={{ cursor: "pointer" }}>
                        <div style={{ display: "flex", gap: 12, alignItems: "center" }} onClick={() => setShowModal(true)}>
                            <div className="avatar" style={{ width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center" }}>{(me?.fullName || "U").charAt(0)}</div>
                            <div style={{ flex: 1, background: "#f0f2f5", borderRadius: 20, padding: "10px 16px", color: "var(--muted)", textAlign: "left" }}>Bạn đang nghĩ gì?</div>
                        </div>
                        <hr style={{ margin: "12px 0 8px" }} />
                        <div style={{ display: "flex", justifyContent: "space-between", padding: "0 8px" }}>
                            <Link to="/events" className="btn" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, border: "none", background: "none", boxShadow: "none", color: "var(--muted)", padding: "8px 0", borderRadius: 8, textDecoration: "none" }}>
                                <Video size={20} color="#E42645" /> <span style={{ fontWeight: 600, fontSize: 14 }}>Video trực tiếp</span>
                            </Link>

                            <label className="btn" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, border: "none", background: "none", boxShadow: "none", color: "var(--muted)", padding: "8px 0", borderRadius: 8, cursor: "pointer", margin: 0 }}>
                                <ImageIcon size={20} color="#41B35D" /> <span style={{ fontWeight: 600, fontSize: 14 }}>Ảnh/video</span>
                                <input type="file" accept="image/*,video/*" hidden onChange={handleImageUpload} />
                            </label>

                            <button className="btn" onClick={(e) => { e.stopPropagation(); setShowFeelingModal(true); }} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, border: "none", background: "none", boxShadow: "none", color: "var(--muted)", padding: "8px 0", borderRadius: 8 }}>
                                <Camera size={20} color="#F7B928" /> <span style={{ fontWeight: 600, fontSize: 14 }}>Hoạt động</span>
                            </button>
                        </div>
                    </div>
                    {posts.map(post => {
                        const isLiked = Array.isArray(post.likes) ? post.likes.includes(me?.id) : false;
                        const likeCount = Array.isArray(post.likes) ? post.likes.length : (post.likes || 0);

                        return (
                            <div key={post.id || post._id} className="post-card">
                                <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                                    <div className="avatar" style={{ width: 40, height: 40, background: post.avatarColor || "#8b5cf6", color: "#fff" }}>{post.avatar || (post.user ? post.user.charAt(0) : "U")}</div>
                                    <div>
                                        <div style={{ fontWeight: 700 }}>{post.user}</div>
                                        <div className="small">{post.time || new Date(post.createdAt).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</div>
                                    </div>
                                </div>
                                <div style={{ marginBottom: 16, fontSize: 15, lineHeight: 1.5 }}>{post.content}</div>
                                {post.image_url && (
                                    <div style={{ margin: "0 -20px 16px", overflow: "hidden", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
                                        <img src={post.image_url} alt="Post media" style={{ width: "100%", maxHeight: 500, objectFit: "cover", display: "block" }} />
                                    </div>
                                )}
                                <div style={{ display: "flex", gap: 16, padding: "8px 0", color: "var(--muted)", borderTop: "1px solid var(--border)" }}>
                                    <div onClick={() => handleLike(post.id || post._id)} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", color: isLiked ? "var(--red)" : "inherit", fontWeight: isLiked ? 600 : "normal" }}>
                                        <Heart size={20} fill={isLiked ? "var(--red)" : "none"} /> {likeCount}
                                    </div>
                                    <div onClick={() => toggleCommentsBox(post.id || post._id)} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", color: openComments[post.id || post._id] ? "var(--primary)" : "inherit" }}>
                                        <MessageSquare size={20} /> {(post.commentCount || (Array.isArray(post.comments) ? post.comments.length : (commentsData[post.id || post._id]?.length || 0))) > 0 ? `${(post.commentCount || (Array.isArray(post.comments) ? post.comments.length : (commentsData[post.id || post._id]?.length || 0)))} Bình luận` : "Bình luận"}
                                    </div>
                                </div>

                                {/* Box Bình Luận */}
                                {openComments[post.id || post._id] && (
                                    <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16, marginTop: 8 }}>
                                        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                                            <div className="avatar" style={{ width: 32, height: 32, flexShrink: 0 }}>{(me?.fullName || "U").charAt(0)}</div>
                                            <div style={{ display: "flex", flex: 1, background: "#f0f2f5", borderRadius: 20, padding: "8px 16px", alignItems: "center" }}>
                                                <input
                                                    type="text"
                                                    placeholder="Viết bình luận..."
                                                    value={commentTexts[post.id || post._id] || ""}
                                                    onChange={(e) => setCommentTexts(prev => ({ ...prev, [post.id || post._id]: e.target.value }))}
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter") handleSendComment(post.id || post._id);
                                                    }}
                                                    style={{ flex: 1, border: "none", background: "transparent", outline: "none", fontSize: 14 }}
                                                />
                                                <button
                                                    onClick={() => handleSendComment(post.id || post._id)}
                                                    style={{ border: "none", background: "none", color: "var(--primary)", fontWeight: 600, cursor: "pointer", paddingLeft: 8 }}
                                                >Gửi</button>
                                            </div>
                                        </div>

                                        <div className="comments-list" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                            {(commentsData[post.id || post._id] || []).map(cmt => {
                                                const cmtId = cmt.id || cmt._id;
                                                const isMyComment = (cmt.user_id && cmt.user_id === me?.id) || (cmt.userId && cmt.userId === me?.id) || (cmt.user === me?.fullName);
                                                return (
                                                    <div key={cmtId} style={{ display: "flex", gap: 10 }}>
                                                        <div className="avatar" style={{ width: 32, height: 32, flexShrink: 0, fontSize: 14 }}>{cmt.user ? cmt.user.charAt(0) : "U"}</div>
                                                        <div style={{ flex: 1 }}>
                                                            {editingComment?.id === cmtId ? (
                                                                <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 350 }}>
                                                                    <input
                                                                        type="text"
                                                                        value={editingComment.text}
                                                                        onChange={e => setEditingComment({ ...editingComment, text: e.target.value })}
                                                                        autoFocus
                                                                        style={{ width: "100%", padding: "8px 12px", borderRadius: 16, border: "1px solid var(--primary)", outline: "none" }}
                                                                        onKeyDown={(e) => {
                                                                            if (e.key === "Enter") handleSaveEditComment(post.id || post._id, cmtId);
                                                                            else if (e.key === "Escape") setEditingComment(null);
                                                                        }}
                                                                    />
                                                                    <div style={{ display: "flex", gap: 12, fontSize: 13 }}>
                                                                        <span style={{ cursor: "pointer", color: "var(--primary)", fontWeight: 700 }} onClick={() => handleSaveEditComment(post.id || post._id, cmtId)}>Lưu lại</span>
                                                                        <span style={{ cursor: "pointer", color: "var(--muted)", fontWeight: 500 }} onClick={() => setEditingComment(null)}>Huỷ</span>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <div style={{ background: "#f0f2f5", padding: "8px 12px", borderRadius: 16, display: "inline-block" }}>
                                                                        <div style={{ fontWeight: 600, fontSize: 13 }}>{cmt.user || "Thành viên"}</div>
                                                                        <div style={{ fontSize: 14 }}>{cmt.content}</div>
                                                                    </div>
                                                                    <div style={{ fontSize: 12, color: "var(--muted)", marginLeft: 12, marginTop: 4, display: "flex", gap: 12 }}>
                                                                        <span>{new Date(cmt.createdAt || Date.now()).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                                                                        {isMyComment && (
                                                                            <>
                                                                                <span style={{ cursor: "pointer", fontWeight: 600 }} onClick={() => setEditingComment({ id: cmtId, text: cmt.content })}>Sửa</span>
                                                                                <span style={{ cursor: "pointer", fontWeight: 600, color: "var(--red)" }} onClick={() => handleDeleteComment(post.id || post._id, cmtId)}>Xóa</span>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </main>

                <aside className="sidebar-right">
                    <div className="sidebar-sticky">
                        <div className="widget-box">
                            <div className="widget-title"><Gift size={18} /> Sinh nhật hôm nay</div>
                            <div className="small">
                                {todayEvents.filter(e => e.type === "birthday").length > 0 ? (
                                    todayEvents.filter(e => e.type === "birthday").map(e => <div key={e.id}><b>{e.title}</b></div>)
                                ) : ("Không có sinh nhật nào.")}
                            </div>
                        </div>
                        <div className="widget-box">
                            <div className="widget-title"><Calendar size={18} /> Ngày giỗ hôm nay</div>
                            <div className="small">
                                {todayEvents.filter(e => e.type === "death").length > 0 ? (
                                    todayEvents.filter(e => e.type === "death").map(e => <div key={e.id}><b>{e.title}</b></div>)
                                ) : ("Không có ngày giỗ nào.")}
                            </div>
                        </div>
                    </div>
                </aside>
            </div>

            {/* Main Post Modal */}
            {showModal && (
                <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(255,255,255,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(8px)" }}>
                    <div className="card" style={{ width: 500, padding: 0, borderRadius: 16, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}>
                        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ fontWeight: 800, fontSize: 18, flex: 1, textAlign: "center" }}>Tạo bài viết</div>
                            <button onClick={() => { setShowModal(false); setSelectedImage(null); setSelectedFeeling(""); }} style={{ background: "var(--surface-hover)", width: 32, height: 32, borderRadius: "50%", border: "none", fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-dark)" }}>×</button>
                        </div>

                        <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 12 }}>
                            <div className="avatar" style={{ width: 44, height: 44, background: "var(--primary-light)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{(me?.fullName || "U").charAt(0)}</div>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: 15 }}>{me?.fullName || "Thành viên"} {selectedFeeling && <span style={{ fontWeight: 400, color: "var(--text-light)" }}>đang cảm thấy <b>{selectedFeeling}</b></span>}</div>
                                <div style={{ background: "rgba(0,0,0,0.05)", padding: "2px 8px", borderRadius: 6, fontSize: 12, display: "inline-block", marginTop: 4, fontWeight: 600 }}>Công khai</div>
                            </div>
                        </div>

                        <form onSubmit={handleCreatePost} style={{ padding: "0 20px 20px" }}>
                            <textarea autoFocus placeholder="Bạn đang nghĩ gì?" value={newContent} onChange={(e) => setNewContent(e.target.value)} style={{ width: "100%", height: selectedImage ? 80 : 150, border: "none", outline: "none", fontSize: selectedImage ? 16 : 24, resize: "none", fontFamily: "inherit", padding: "10px 0" }} />

                            {selectedImage && (
                                <div style={{ position: "relative", marginBottom: 16, borderRadius: 12, overflow: "hidden", border: "1px solid var(--border)", padding: 8 }}>
                                    <img src={selectedImage} alt="Preview" style={{ width: "100%", maxHeight: 300, objectFit: "contain", borderRadius: 8, display: "block" }} />
                                    <button type="button" onClick={() => setSelectedImage(null)} style={{ position: "absolute", top: 16, right: 16, background: "#fff", border: "1px solid var(--border)", width: 32, height: 32, borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>×</button>
                                </div>
                            )}

                            <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                                <div style={{ fontWeight: 600 }}>Thêm vào bài viết</div>
                                <div style={{ display: "flex", gap: 12 }}>
                                    <label style={{ display: "flex", cursor: "pointer", padding: 6, borderRadius: 8, background: "var(--surface-hover)" }}>
                                        <ImageIcon size={24} color="#41B35D" />
                                        <input type="file" accept="image/*,video/*" hidden onChange={handleImageUpload} />
                                    </label>
                                    <button type="button" onClick={() => { setShowModal(false); setShowFeelingModal(true); }} style={{ border: "none", background: "var(--surface-hover)", padding: 6, borderRadius: 8, cursor: "pointer", display: "flex" }}>
                                        <Camera size={24} color="#F7B928" />
                                    </button>
                                </div>
                            </div>

                            <button type="submit" className="btn primary" disabled={!newContent.trim() && !selectedImage} style={{ width: "100%", height: 44, borderRadius: 8, fontWeight: 700, fontSize: 16 }}>Đăng</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Feelings/Activity Modal */}
            {showFeelingModal && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(255,255,255,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100, backdropFilter: "blur(8px)" }}>
                    <div className="card" style={{ width: 400, padding: 0, borderRadius: 16, boxShadow: "0 20px 40px rgba(0,0,0,0.1)", display: "flex", flexDirection: "column", maxHeight: "80vh" }}>
                        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <button onClick={() => { setShowFeelingModal(false); setShowModal(true); }} style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer", color: "var(--text-light)", width: 32, display: "flex", alignItems: "center", justifyContent: "flex-start" }}>{"←"}</button>
                            <div style={{ fontWeight: 800, fontSize: 18, flex: 1, textAlign: "center" }}>Bạn đang cảm thấy thế nào?</div>
                            <div style={{ width: 32 }} /> {/* Spacer */}
                        </div>

                        <div style={{ padding: 16, overflowY: "auto", flex: 1 }}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                                {feelings.map((f, i) => (
                                    <button
                                        key={i}
                                        onClick={() => {
                                            setSelectedFeeling(f.label);
                                            setShowFeelingModal(false);
                                            setShowModal(true);
                                        }}
                                        style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 12, border: "1px solid var(--border)", background: selectedFeeling === f.label ? "var(--primary-light)" : "#fff", cursor: "pointer", transition: "all 0.2s" }}
                                    >
                                        <div style={{ fontSize: 24 }}>{f.emoji}</div>
                                        <div style={{ fontWeight: 600, fontSize: 15, color: "var(--text-dark)" }}>{f.label}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
