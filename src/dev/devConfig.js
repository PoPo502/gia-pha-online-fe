// Dev helpers to preview UI without backend/auth

export const DEV_BYPASS_AUTH = false;
// Có thể đổi role tĩnh ở đây để test: "SUPER_ADMIN", "TREE_ADMIN", "USER"
export const DEV_ME = {
  id: "dev-user",
  username: "DevUser",
  fullName: "Đoàn Dự (Admin Hệ thống)",
  role: "SUPER_ADMIN",
  treeId: "tree_1" // ID Cây gia phả (SUPER_ADMIN có thể không cần, nhưng TREE_ADMIN/USER thì bắt buộc)
};