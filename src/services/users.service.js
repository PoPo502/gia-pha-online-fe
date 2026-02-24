import { api, unwrap } from "../lib/api.js";

/**
 * Spec:
 * GET /api/users/me
 * PUT /api/users/me
 * GET /api/users (ADMIN)
 * PUT /api/users/:id/role (ADMIN)
 * PUT /api/users/:id/ban (ADMIN)
 */
export const usersService = {
  async me() {
    const res = await api.get("/users/me");
    return unwrap(res);
  },
  async updateMe(payload) {
    const res = await api.put("/users/me", payload);
    return unwrap(res);
  },
  async list(params) {
    const res = await api.get("/users", { params });
    return unwrap(res);
  },
  async updateRole(id, payload) {
    const res = await api.put(`/users/${id}/role`, payload);
    return unwrap(res);
  },
  async ban(id, payload) {
    const res = await api.put(`/users/${id}/ban`, payload);
    return unwrap(res);
  },
};
