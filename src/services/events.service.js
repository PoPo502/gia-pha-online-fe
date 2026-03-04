import { api, unwrap } from "../lib/api.js";
import { DEV_BYPASS_AUTH } from "../dev/devConfig.js";
import { mockEvents } from "../dev/mockData.js";

export const eventsService = {
  async create(payload) {
    if (DEV_BYPASS_AUTH) return { ...payload, id: Date.now().toString() };
    const res = await api.post("/events", payload);
    return unwrap(res);
  },
  async list(params) {
    if (DEV_BYPASS_AUTH) return mockEvents;
    const res = await api.get("/events", { params });
    return unwrap(res);
  },
  async get(id) {
    if (DEV_BYPASS_AUTH) return mockEvents.find(e => e.id === id) || mockEvents[0];
    const res = await api.get(`/events/${id}`);
    return unwrap(res);
  },
  async update(id, payload) {
    if (DEV_BYPASS_AUTH) return { id, ...payload };
    const res = await api.put(`/events/${id}`, payload);
    return unwrap(res);
  },
  async updateStatus(id, status) {
    if (DEV_BYPASS_AUTH) return { id, status };
    const res = await api.put(`/events/${id}/status`, { status });
    return unwrap(res);
  },
  async remove(id) {
    if (DEV_BYPASS_AUTH) return { success: true };
    const res = await api.delete(`/events/${id}`);
    return unwrap(res);
  },
};
