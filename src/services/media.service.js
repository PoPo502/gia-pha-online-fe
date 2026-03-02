import { api, unwrap } from "../lib/api.js";

/**
 * Spec:
 * POST /api/media/upload (multipart/form-data)
 * GET /api/media/:id
 * GET /api/media/stream/:id (nếu có)
 */
export const mediaService = {
  async upload(formData) {
    const res = await api.post("/media/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return unwrap(res);
  },
  async get(id) {
    const res = await api.get(`/media/${id}`);
    return unwrap(res);
  },
  async stream(id) {
    const res = await api.get(`/media/stream/${id}`);
    return unwrap(res);
  },
};
