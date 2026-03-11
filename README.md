# Gia phả Online - Frontend (generated)

## Requirements
- Node.js 18+ (khuyến nghị)
- Backend chạy và expose base URL theo spec: `/api`

## Setup
```bash
npm install
cp .env.example .env
# sửa VITE_API_BASE_URL cho đúng BE, ví dụ:
# VITE_API_BASE_URL=http://localhost:3000/api
npm run dev
```

## Notes
- Axios đã bật `withCredentials: true` để hỗ trợ refresh token cookie httpOnly.
- Nếu BE không dùng cookie refresh mà trả refresh token trong body, bạn có thể tắt withCredentials và tự lưu refresh token (không khuyến nghị).
---

## 🤖 Phương pháp phát triển

Project này được phát triển theo phong cách **100% vibe coding**.

Thay vì theo quy trình phát triển truyền thống, hệ thống được xây dựng thông qua việc thử nghiệm nhanh, phát triển linh hoạt và có sự hỗ trợ của AI trong quá trình coding. Mục tiêu là nhanh chóng biến ý tưởng thành chức năng hoạt động được, sau đó cải tiến dần thông qua các vòng lặp phát triển.

### Nguyên tắc phát triển

- ⚡ Phát triển nhanh (Rapid prototyping)
- 🧠 Coding có hỗ trợ AI
- 🔁 Cải tiến liên tục
- 🎯 Ưu tiên chức năng trước, tối ưu sau

### Quy trình vibe coding

Quy trình phát triển thường diễn ra theo các bước:

1. Xác định ý tưởng hoặc tính năng cần xây dựng  
2. Đề xuất hướng triển khai  
3. Code nhanh với sự hỗ trợ của AI  
4. Test và điều chỉnh ngay lập tức  
5. Refactor khi cần thiết  

Cách làm này giúp project phát triển nhanh, linh hoạt và dễ thích nghi khi thay đổi yêu cầu.

### Công cụ AI hỗ trợ

Trong quá trình phát triển, các công cụ AI được sử dụng để hỗ trợ:

- sinh code
- debug
- gợi ý kiến trúc
- viết documentation
- refactor code

Nhờ đó quá trình phát triển được tăng tốc nhưng vẫn giữ được cấu trúc code rõ ràng và dễ bảo trì.

### Triết lý phát triển

> Làm cho chạy trước. Cải tiến sau. Biến ý tưởng thành sản phẩm nhanh nhất có thể.

Repository này thể hiện một phong cách phát triển hiện đại, nơi **tốc độ, sự sáng tạo và khả năng lặp lại nhanh** được ưu tiên.
