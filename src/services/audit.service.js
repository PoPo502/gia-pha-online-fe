import { api, unwrap } from "../lib/api.js";
import { DEV_BYPASS_AUTH } from "../dev/devConfig.js";

export const auditService = {
    async list(params) {
        if (DEV_BYPASS_AUTH) return { data: [], meta: { total: 0 } };
        const res = await api.get("/audit", { params });
        return unwrap(res);
    },
    async getEntityHistory(type, id, params) {
        if (DEV_BYPASS_AUTH) return [];
        const res = await api.get(`/audit/entity/${type}/${id}`, { params });
        return unwrap(res);
    },
};
