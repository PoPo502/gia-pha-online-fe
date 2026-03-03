import { api, unwrap } from "../lib/api.js";
import { DEV_BYPASS_AUTH } from "../dev/devConfig.js";

export const usersService = {
  async me() {
    if (DEV_BYPASS_AUTH) return { id: "dev-id", fullName: "Admin Hệ Thống", role: "SUPER_ADMIN", email: "admin@gia-pha.online" };
    const res = await api.get("/users/me");
    return unwrap(res);
  },
  async updateMe(payload) {
    if (DEV_BYPASS_AUTH) return { success: true };
    const res = await api.put("/users/me", payload);
    return unwrap(res);
  },
  async list(params) {
    if (DEV_BYPASS_AUTH) return {
      data: [
        { id: "u1", fullName: "Nguyễn Văn Chốt", email: "chot@gmail.com", role: "USER", status: "active" },
        { id: "u2", fullName: "Trần Thị Troll", email: "troll@gmail.com", role: "USER", status: "banned" },
        { id: "u3", fullName: "Lý Thông", email: "thong@gmail.com", role: "TREE_ADMIN", status: "active" },
      ]
    };
    const res = await api.get("/users", { params });
    return unwrap(res);
  },
  async updateRole(id, payload) {
    if (DEV_BYPASS_AUTH) return { success: true };
    const res = await api.put(`/users/${id}/role`, payload);
    return unwrap(res);
  },
  async ban(id, payload) {
    if (DEV_BYPASS_AUTH) return { success: true };
    const res = await api.put(`/users/${id}/ban`, payload);
    return unwrap(res);
  },
  async changePassword(payload) {
    if (DEV_BYPASS_AUTH) return { success: true };
    // Lát nữa chúng ta sẽ viết API PUT /users/me/password ở BE
    const res = await api.put("/users/me/password", payload);
    return unwrap(res);
  },
};
