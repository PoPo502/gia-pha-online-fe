import { api, unwrap } from "../lib/api.js";
import { DEV_BYPASS_AUTH } from "../dev/devConfig.js";

export const mediaService = {
  async upload(formData) {
    if (DEV_BYPASS_AUTH) return { success: true };
    const res = await api.post("/media/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return unwrap(res);
  },
  async list() {
    if (DEV_BYPASS_AUTH) return [];
    const res = await api.get("/media");
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
