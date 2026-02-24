import { useEffect, useState } from "react";
import Topbar from "../components/Topbar.jsx";
import { useAuth } from "../store/auth.jsx";
import { systemService } from "../services/system.service.js";

export default function Home() {
  const { me } = useAuth();
  const [health, setHealth] = useState(null);

  useEffect(() => {
    systemService.health().then(setHealth).catch(() => setHealth({ status: "unknown" }));
  }, []);

  return (
    <>
      <Topbar />
      <div className="container">
        <div className="card">
          <div style={{ fontWeight: 800, fontSize: 18 }}>Xin chào, {me?.name || me?.email || "User"}</div>
          <div className="small" style={{ marginTop: 6 }}>API health: {JSON.stringify(health)}</div>
          <hr style={{ margin: "16px 0" }} />
          <div className="small">
            Gợi ý: vào “Tìm thành viên” để tìm theo tên (full-text) hoặc “Danh sách” để xem persons theo branch/privacy.
          </div>
        </div>
      </div>
    </>
  );
}
