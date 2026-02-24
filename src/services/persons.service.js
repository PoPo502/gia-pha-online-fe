import { api, unwrap } from "../lib/api.js";

/**
 * Spec:
 * POST /api/persons
 * GET /api/persons/:id
 * PUT /api/persons/:id
 * DELETE /api/persons/:id
 * GET /api/persons (list)
 * GET /api/persons/:id/tree (depth, includeSpouses, format)
 * GET /api/persons/:id/ancestors
 * GET /api/persons/:id/descendants
 */
export const personsService = {
  async create(payload) {
    const res = await api.post("/persons", payload);
    return unwrap(res);
  },
  async get(id) {
    const res = await api.get(`/persons/${id}`);
    return unwrap(res);
  },
  async update(id, payload) {
    const res = await api.put(`/persons/${id}`, payload);
    return unwrap(res);
  },
  async remove(id) {
    const res = await api.delete(`/persons/${id}`);
    return unwrap(res);
  },
  async list(params) {
    const res = await api.get("/persons", { params });
    return unwrap(res);
  },
  async tree(id, params) {
    const res = await api.get(`/persons/${id}/tree`, { params });
    return unwrap(res);
  },
  async ancestors(id, params) {
    const res = await api.get(`/persons/${id}/ancestors`, { params });
    return unwrap(res);
  },
  async descendants(id, params) {
    const res = await api.get(`/persons/${id}/descendants`, { params });
    return unwrap(res);
  },
};
