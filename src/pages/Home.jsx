import { useEffect, useState } from "react";
import Topbar from "../components/Topbar.jsx";
import { useAuth } from "../store/auth.jsx";
import { Link } from "react-router-dom";
import { personsService } from "../services/persons.service.js";
import { eventsService } from "../services/events.service.js";

import { Search, Edit3, Radio, Home as HomeIcon, Video, Image as ImageIcon, Heart, MessageSquare, Send, Gift, Calendar, UserPlus, Filter, Camera, GitBranch, Users } from "lucide-react";

export default function Home() {
  const { me } = useAuth();
  const [members, setMembers] = useState([]);
  const [stats, setStats] = useState({ total: 0 });
  const [todayEvents, setTodayEvents] = useState([]);

  // Post states
  const [posts, setPosts] = useState([
    {
      id: "p1",
      user: "Nguyễn Ngọc A",
      avatar: "A",
      avatarColor: "#8b5cf6",
      time: "1 giờ trước",
      content: "Chào mừng mọi người đến với hệ thống Gia phả Online mới!",
      likes: 12,
    },
    {
      id: "p2",
      user: "Nguyễn Xuân B",
      avatar: "X",
      avatarColor: "#10b981",
      time: "3 giờ trước",
      content: "Hôm nay thời tiết thật đẹp để đi thăm mộ tổ.",
      likes: 5,
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [newContent, setNewContent] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await personsService.list({ limit: 12 });
        const list = data.data || data;
        setMembers(Array.isArray(list) ? list : (list.data || []));
        if (data.meta) setStats(s => ({ ...s, total: data.meta.total }));

        // Fetch today's events for widgets
        const today = new Date().toISOString().split('T')[0];
        const evRes = await eventsService.list({ dateFrom: today, dateTo: today });
        setTodayEvents(evRes.data || evRes || []);
      } catch (e) {
        console.error("Failed to fetch data", e);
      }
    }
    fetchData();
  }, []);

  const handleCreatePost = (e) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    const newPost = {
      id: Date.now().toString(),
      user: me?.fullName || "Thành viên",
      avatar: (me?.fullName || "U").charAt(0),
      avatarColor: "var(--primary)",
      time: "Vừa xong",
      content: newContent,
      likes: 0
    };

    setPosts([newPost, ...posts]);
    setNewContent("");
    setShowModal(false);
  };

  return (
    <>
      <Topbar />
      <div className="social-layout">

        {/* LEFT SIDEBAR: Tree Summaries */}
        <aside style={{ width: 280, flexShrink: 0 }}>
          <div className="sidebar-sticky">
            {/* Quick Navigation Card */}
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

            {/* Sub-tree Card */}
            <div className="card" style={{ padding: 20, borderRadius: 22, marginBottom: 24, border: "1px solid var(--border)", background: "#fff" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                <div style={{ width: 34, height: 34, background: "var(--primary-light)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <GitBranch size={19} color="var(--primary)" />
                </div>
                <div style={{ fontWeight: 800, fontSize: 16 }}>Cây gia phả con</div>
              </div>
              <div style={{ height: 160, background: "#fdfdfd", borderRadius: 14, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: "1px dashed #eee" }}>
                <svg viewBox="0 0 100 80" style={{ width: 80, height: 80, marginBottom: 12, filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.05))" }}>
                  <circle cx="50" cy="15" r="6" fill="var(--primary)" />
                  <line x1="50" y1="21" x2="30" y2="40" stroke="#ddd" strokeWidth="2" />
                  <line x1="50" y1="21" x2="70" y2="40" stroke="#ddd" strokeWidth="2" />
                  <circle cx="30" cy="40" r="6" fill="var(--accent)" />
                  <circle cx="70" cy="40" r="6" fill="var(--accent)" />
                  <line x1="30" y1="46" x2="20" y2="65" stroke="#ddd" strokeWidth="2" />
                  <line x1="30" y1="46" x2="40" y2="65" stroke="#ddd" strokeWidth="2" />
                  <circle cx="20" cy="65" r="5" fill="var(--primary)" opacity="0.4" />
                  <circle cx="40" cy="65" r="5" fill="var(--primary)" opacity="0.4" />
                </svg>
                <Link to={me?.id ? `/persons/${me.id}/tree` : "/search/persons"} className="btn small primary" style={{ borderRadius: 10, padding: "8px 20px", fontWeight: 700 }}>Xem chi cành</Link>
              </div>
              <div className="small" style={{ marginTop: 14, color: "var(--muted)", textAlign: "center", fontWeight: 500, lineHeight: 1.4 }}>Sơ đồ huyết thống trực hệ của gia đình bạn.</div>
            </div>

            {/* Full-tree Card */}
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
                  <g opacity="0.3">
                    <circle cx="15" cy="60" r="4" fill="var(--red)" />
                    <circle cx="45" cy="60" r="4" fill="var(--red)" />
                    <circle cx="75" cy="60" r="4" fill="var(--red)" />
                    <circle cx="105" cy="60" r="4" fill="var(--red)" />
                  </g>
                </svg>
                <Link to="/persons" className="btn small outline" style={{ borderRadius: 10, color: "var(--red)", borderColor: "var(--red)", fontWeight: 700 }}>Toàn cảnh gia tộc</Link>
              </div>
              <div className="small" style={{ marginTop: 14, color: "var(--muted)", textAlign: "center", fontWeight: 500, lineHeight: 1.4 }}>Toàn bộ phả đồ của đại gia đình từ thuở khai tổ.</div>
            </div>
          </div>
        </aside>

        {/* MAIN FEED */}
        <main className="feed">
          {/* Welcome Header */}
          <div style={{
            textAlign: "center",
            marginBottom: 40,
            padding: "40px 20px",
            background: "linear-gradient(135deg, #fff 0%, #fff5f2 100%)",
            borderRadius: 24,
            border: "1px solid rgba(238, 77, 45, 0.1)",
            boxShadow: "0 10px 30px rgba(238, 77, 45, 0.05)"
          }}>
            <h1 style={{ fontSize: 32, fontWeight: 900, color: "var(--text-dark)", marginBottom: 16, letterSpacing: "-1px" }}>
              Chào mừng quay trở lại, <span style={{ color: "var(--primary)" }}>{me?.fullName || (me?.email ? me.email.split('@')[0] : "Thành viên")}!</span>
            </h1>
            <Link to="/persons" className="btn primary" style={{
              height: 52,
              padding: "0 40px",
              fontSize: 18,
              fontWeight: 700,
              borderRadius: 14,
              boxShadow: "0 8px 25px rgba(238, 77, 45, 0.35)",
              display: "inline-flex"
            }}>
              Khám phá gia tộc ngay
            </Link>
          </div>

          {/* Create Post */}
          <div className="post-input-box" onClick={() => setShowModal(true)} style={{ cursor: "pointer" }}>
            <div style={{ display: "flex", gap: 12 }}>
              <div className="avatar" style={{ width: 40, height: 40 }}>{(me?.fullName || "U").charAt(0)}</div>
              <div style={{ flex: 1, background: "#f0f2f5", borderRadius: 20, padding: "10px 16px", color: "var(--muted)" }}>
                Bạn đang nghĩ gì?
              </div>
            </div>
            <hr style={{ margin: "4px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-around" }}>
              <button className="btn" style={{ border: "none", background: "none", boxShadow: "none", color: "var(--muted)" }}><Video size={20} /> Video trực tiếp</button>
              <button className="btn" style={{ border: "none", background: "none", boxShadow: "none", color: "var(--muted)" }}><ImageIcon size={20} /> Ảnh/video</button>
              <button className="btn" style={{ border: "none", background: "none", boxShadow: "none", color: "var(--muted)" }}><Camera size={20} /> Hoạt động</button>
            </div>
          </div>

          {/* Posts List */}
          {posts.map(post => (
            <div key={post.id} className="post-card">
              <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                <div className="avatar" style={{ width: 40, height: 40, background: post.avatarColor || "#8b5cf6", color: "#fff" }}>
                  {post.avatar}
                </div>
                <div>
                  <div style={{ fontWeight: 700 }}>{post.user}</div>
                  <div className="small">{post.time}</div>
                </div>
              </div>
              <div style={{ marginBottom: 16, fontSize: 15, lineHeight: 1.5 }}>{post.content}</div>

              <div style={{ display: "flex", gap: 16, padding: "8px 0", color: "var(--muted)", borderTop: "1px solid var(--border)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}><Heart size={20} /> {post.likes}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}><MessageSquare size={20} /> Bình luận</div>
              </div>
            </div>
          ))}
        </main>

        {/* RIGHT SIDEBAR */}
        <aside className="sidebar-right">
          <div className="sidebar-sticky">
            <div className="widget-box">
              <div className="widget-title"><Gift size={18} color="var(--text-dark)" /> Sinh nhật & Sự kiện hôm nay</div>
              <div className="small" style={{ color: "var(--text-dark)", lineHeight: 1.4 }}>
                {todayEvents.filter(e => e.type === "birthday").length > 0 ? (
                  todayEvents.filter(e => e.type === "birthday").map(e => <div key={e._id || e.id}>Chúc mừng sinh nhật <b>{e.title}</b></div>)
                ) : (
                  "Không có sinh nhật nào hôm nay."
                )}
              </div>
            </div>

            <div className="widget-box">
              <div className="widget-title"><Calendar size={18} color="var(--text-dark)" /> Ngày giỗ & Tưởng niệm</div>
              <div className="small" style={{ color: "var(--text-dark)", lineHeight: 1.4 }}>
                {todayEvents.filter(e => e.type === "anniversary" || e.type === "death").length > 0 ? (
                  todayEvents.filter(e => e.type === "anniversary" || e.type === "death").map(e => <div key={e._id || e.id}>Ngày giỗ <b>{e.title}</b></div>)
                ) : (
                  "Không có ngày giỗ nào hôm nay."
                )}
              </div>
            </div>

            <div className="widget-box" style={{ background: "transparent", border: "none", boxShadow: "none", padding: 0 }}>
              <div className="widget-title" style={{ paddingLeft: 8 }}>Người trong gia phả</div>
              <div className="stack" style={{ gap: 4 }}>
                {members.map((m) => (
                  <Link key={m._id || m.id} to={`/persons/${m._id || m.id}`} className="btn" style={{ justifyContent: "flex-start", padding: "8px", border: "none", background: "none", boxShadow: "none" }}>
                    <div className="avatar" style={{ width: 36, height: 36, fontSize: 13, marginRight: 12 }}>{(m.fullName || m.name || "U").charAt(0)}</div>
                    <span style={{ fontWeight: 500, fontSize: 14, color: "var(--text-dark)" }}>{m.fullName || m.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </aside>

      </div>

      {/* CREATE POST MODAL */}
      {showModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000, backdropFilter: "blur(4px)"
        }}>
          <div className="card" style={{ width: 500, padding: 0, borderRadius: 16, overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontWeight: 800, fontSize: 18 }}>Tạo bài viết</div>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer", color: "var(--muted)" }}>×</button>
            </div>
            <form onSubmit={handleCreatePost} style={{ padding: 20 }}>
              <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                <div className="avatar" style={{ width: 44, height: 44 }}>{(me?.fullName || "U").charAt(0)}</div>
                <div>
                  <div style={{ fontWeight: 700 }}>{me?.fullName || "Thành viên"}</div>
                  <div style={{ fontSize: 12, background: "#f0f2f5", padding: "2px 8px", borderRadius: 4, display: "inline-block", marginTop: 4 }}>Công khai</div>
                </div>
              </div>
              <textarea
                autoFocus
                placeholder="Bạn đang nghĩ gì?"
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                style={{
                  width: "100%", height: 150, border: "none", outline: "none",
                  fontSize: 18, resize: "none", fontFamily: "inherit"
                }}
              />
              <button
                type="submit"
                className="btn primary"
                disabled={!newContent.trim()}
                style={{ width: "100%", height: 44, borderRadius: 8, marginTop: 16, fontWeight: 700 }}
              >
                Đăng bài
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}