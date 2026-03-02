import { api, unwrap } from "../lib/api.js";
import { DEV_BYPASS_AUTH } from "../dev/devConfig.js";

export const moderationService = {
    async getPending() {
        if (DEV_BYPASS_AUTH) return [
            {
                id: "mod1",
                type: "post",
                user: "Thành viên A",
                time: "10 phút trước",
                content: "Nội dung cần được duyệt bởi Admin.",
                status: "pending"
            },
            {
                id: "mod2",
                type: "image",
                user: "Thành viên B",
                time: "30 phút trước",
                content: "Một bức ảnh mới về nhà thờ tổ.",
                image: "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400",
                status: "pending"
            }
        ];
        const res = await api.get("/moderation/pending");
        return unwrap(res);
    },
    async updateStatus(id, status) {
        if (DEV_BYPASS_AUTH) return { success: true };
        const res = await api.put(`/moderation/${id}`, { status });
        return unwrap(res);
    }
};
