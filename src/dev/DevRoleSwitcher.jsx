import { useAuth } from "../store/auth.jsx";
import { DEV_BYPASS_AUTH } from "./devConfig.js";

const ROLES = [
    { value: "SUPER_ADMIN", label: "🔴 Admin Hệ thống", color: "#ef4444" },
    { value: "TREE_ADMIN", label: "🟠 Admin Gia phả", color: "#f97316" },
    { value: "USER", label: "🟢 Thành viên", color: "#22c55e" },
];

export default function DevRoleSwitcher() {
    const { me, login } = useAuth();

    if (!DEV_BYPASS_AUTH) return null;

    const currentRole = me?.role || "USER";

    const switchRole = (role) => {
        login({ role });
    };

    return (
        <div style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 9999,
            background: "#1e293b",
            color: "#fff",
            borderRadius: 16,
            padding: "14px 18px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            fontFamily: "monospace",
            fontSize: 13,
            minWidth: 210,
            border: "1px solid rgba(255,255,255,0.1)"
        }}>
            <div style={{ fontWeight: 800, marginBottom: 10, letterSpacing: 1, color: "#94a3b8", fontSize: 11, textTransform: "uppercase" }}>
                🛠 Dev — Role Switcher
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {ROLES.map(r => (
                    <button
                        key={r.value}
                        onClick={() => switchRole(r.value)}
                        style={{
                            background: currentRole === r.value ? r.color : "rgba(255,255,255,0.07)",
                            color: currentRole === r.value ? "#fff" : "#cbd5e1",
                            border: `1.5px solid ${currentRole === r.value ? r.color : "transparent"}`,
                            borderRadius: 8,
                            padding: "7px 12px",
                            cursor: "pointer",
                            fontWeight: currentRole === r.value ? 700 : 500,
                            fontSize: 13,
                            textAlign: "left",
                            transition: "all 0.15s",
                        }}
                    >
                        {r.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
