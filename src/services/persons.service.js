import { api, unwrap } from "../lib/api.js";
import { DEV_BYPASS_AUTH } from "../dev/devConfig.js";
import { mockPersons, mockPersonById, mockTree } from "../dev/mockData.js";

export const personsService = {
  async create(payload) {
    if (DEV_BYPASS_AUTH) return { ...payload, id: Date.now().toString() };
    const res = await api.post("/persons", payload);
    return unwrap(res);
  },
  async get(id) {
    if (DEV_BYPASS_AUTH) return mockPersonById(id);
    const res = await api.get(`/persons/${id}`);
    return unwrap(res);
  },
  async update(id, payload) {
    if (DEV_BYPASS_AUTH) return { ...mockPersonById(id), ...payload };
    const res = await api.put(`/persons/${id}`, payload);
    return unwrap(res);
  },
  async remove(id) {
    if (DEV_BYPASS_AUTH) return { success: true };
    const res = await api.delete(`/persons/${id}`);
    return unwrap(res);
  },
  async list(params) {
    if (DEV_BYPASS_AUTH) {
      return {
        data: mockPersons,
        meta: { total: mockPersons.length }
      };
    }
    const res = await api.get("/persons", { params });
    return unwrap(res);
  },
  async tree(id, params) {
    if (DEV_BYPASS_AUTH) return mockTree(id);
    const res = await api.get(`/persons/${id}/tree`, { params });
    return unwrap(res);
  },
  // Simple mocks for ancestors/descendants
  async ancestors(id, params) {
    if (DEV_BYPASS_AUTH) return [mockPersonById(id)];
    const res = await api.get(`/persons/${id}/ancestors`, { params });
    return unwrap(res);
  },
  async descendants(id, params) {
    if (DEV_BYPASS_AUTH) return [mockPersonById(id)];
    const res = await api.get(`/persons/${id}/descendants`, { params });
    return unwrap(res);
  },
};
