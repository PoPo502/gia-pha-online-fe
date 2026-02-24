import { api, unwrap } from "../lib/api.js";

/**
 * Spec:
 * GET /api/search/persons?q=...&page&limit&branchId&privacy&generation
 */
export const searchService = {
  async persons(params) {
    const res = await api.get("/search/persons", { params });
    return unwrap(res);
  },
};
