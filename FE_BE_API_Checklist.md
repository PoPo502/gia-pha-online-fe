# FE ↔ BE API Checklist (Gia Phả Online)

> Sinh tự động từ `walkthrough.md` (BE endpoints) và `src/services/*.service.js` (FE).

## Tổng quan

- **BE endpoints (theo walkthrough):** 46
- **FE service endpoints match BE:** 39/46 (**84.8%**)
- **FE endpoints đã được UI sử dụng (import trong pages/components/store):** 27/46 (**58.7%**)

### Legend

- `Service`: FE đã có hàm gọi API trong `src/services/*`
- `UI`: Có màn hình/logic FE đang import service đó (đã “wire”)

## Các endpoint BE chưa có trong FE (cần bổ sung service)

- [ ] **GET /api/relationships/person/:id**  _(Auth: Token)_
- [ ] **PUT /api/media/:id**  _(Auth: Admin/Editor)_
- [ ] **DELETE /api/media/:id**  _(Auth: Admin/Editor)_
- [ ] **GET /api/search/events**  _(Auth: Token)_
- [ ] **GET /api/search/branches**  _(Auth: Token)_
- [ ] **GET /api/audit**  _(Auth: Admin)_
- [ ] **GET /api/audit/:id**  _(Auth: Admin)_

## Endpoint đã có service nhưng chưa được UI dùng (cần wire màn hình/flow)

- [ ] **POST /api/relationships** → Service: `relationships.service.js`
- [ ] **GET /api/relationships/:id** → Service: `relationships.service.js`
- [ ] **PUT /api/relationships/:id** → Service: `relationships.service.js`
- [ ] **DELETE /api/relationships/:id** → Service: `relationships.service.js`
- [ ] **POST /api/events** → Service: `events.service.js`
- [ ] **GET /api/events** → Service: `events.service.js`
- [ ] **GET /api/events/:id** → Service: `events.service.js`
- [ ] **PUT /api/events/:id** → Service: `events.service.js`
- [ ] **DELETE /api/events/:id** → Service: `events.service.js`
- [ ] **POST /api/media/upload** → Service: `media.service.js`
- [ ] **GET /api/media/:id** → Service: `media.service.js`
- [ ] **GET /api/media/stream/:id** → Service: `media.service.js`

---

## Checklist theo module


### audit

| Done | Method | Endpoint | Auth | FE Service | UI | Ghi chú |
|---|---|---|---|---|---|---|
| [ ] | GET | `/api/audit` | Admin | — | — | Thiếu service |
| [ ] | GET | `/api/audit/:id` | Admin | — | — | Thiếu service |

### auth

| Done | Method | Endpoint | Auth | FE Service | UI | Ghi chú |
|---|---|---|---|---|---|---|
| [x] | POST | `/api/auth/login` | Public | `auth.service.js` | ✅ | OK |
| [x] | POST | `/api/auth/logout` | Token | `auth.service.js` | ✅ | OK |
| [x] | POST | `/api/auth/refresh` | Cookie | `auth.service.js` | ✅ | OK |
| [x] | POST | `/api/auth/register` | Public | `auth.service.js` | ✅ | OK |

### branches

| Done | Method | Endpoint | Auth | FE Service | UI | Ghi chú |
|---|---|---|---|---|---|---|
| [x] | GET | `/api/branches` | Token | `branches.service.js` | ✅ | OK |
| [x] | POST | `/api/branches` | Admin/Editor | `branches.service.js` | ✅ | OK |
| [x] | DELETE | `/api/branches/:id` | Admin | `branches.service.js` | ✅ | OK |
| [x] | GET | `/api/branches/:id` | Token | `branches.service.js` | ✅ | OK |
| [x] | PUT | `/api/branches/:id` | Admin/Editor | `branches.service.js` | ✅ | OK |
| [x] | GET | `/api/branches/:id/members` | Admin/Editor | `branches.service.js` | ✅ | OK |
| [x] | POST | `/api/branches/:id/members` | Admin/Editor | `branches.service.js` | ✅ | OK |
| [x] | DELETE | `/api/branches/:id/members/:id` | Admin/Editor | `branches.service.js` | ✅ | OK |

### events

| Done | Method | Endpoint | Auth | FE Service | UI | Ghi chú |
|---|---|---|---|---|---|---|
| [ ] | GET | `/api/events` | Token + Privacy | `events.service.js` | ❌ | Chưa wire UI |
| [ ] | POST | `/api/events` | Admin/Editor | `events.service.js` | ❌ | Chưa wire UI |
| [ ] | DELETE | `/api/events/:id` | Admin/Editor | `events.service.js` | ❌ | Chưa wire UI |
| [ ] | GET | `/api/events/:id` | Token + Privacy | `events.service.js` | ❌ | Chưa wire UI |
| [ ] | PUT | `/api/events/:id` | Admin/Editor | `events.service.js` | ❌ | Chưa wire UI |

### health

| Done | Method | Endpoint | Auth | FE Service | UI | Ghi chú |
|---|---|---|---|---|---|---|
| [x] | GET | `/api/health` | Public | `system.service.js` | ✅ | OK |

### media

| Done | Method | Endpoint | Auth | FE Service | UI | Ghi chú |
|---|---|---|---|---|---|---|
| [ ] | DELETE | `/api/media/:id` | Admin/Editor | — | — | Thiếu service |
| [ ] | GET | `/api/media/:id` | Token + Privacy | `media.service.js` | ❌ | Chưa wire UI |
| [ ] | PUT | `/api/media/:id` | Admin/Editor | — | — | Thiếu service |
| [ ] | GET | `/api/media/stream/:id` | Token + Privacy | `media.service.js` | ❌ | Chưa wire UI |
| [ ] | POST | `/api/media/upload` | Admin/Editor | `media.service.js` | ❌ | Chưa wire UI |

### persons

| Done | Method | Endpoint | Auth | FE Service | UI | Ghi chú |
|---|---|---|---|---|---|---|
| [x] | GET | `/api/persons` | Token | `persons.service.js` | ✅ | OK |
| [x] | POST | `/api/persons` | Admin/Editor | `persons.service.js` | ✅ | OK |
| [x] | DELETE | `/api/persons/:id` | Admin/Editor | `persons.service.js` | ✅ | OK |
| [x] | GET | `/api/persons/:id` | Token + Privacy | `persons.service.js` | ✅ | OK |
| [x] | PUT | `/api/persons/:id` | Admin/Editor | `persons.service.js` | ✅ | OK |
| [x] | GET | `/api/persons/:id/ancestors` | Token | `persons.service.js` | ✅ | OK |
| [x] | GET | `/api/persons/:id/descendants` | Token | `persons.service.js` | ✅ | OK |
| [x] | GET | `/api/persons/:id/tree` | Token + Privacy | `persons.service.js` | ✅ | OK |

### relationships

| Done | Method | Endpoint | Auth | FE Service | UI | Ghi chú |
|---|---|---|---|---|---|---|
| [ ] | POST | `/api/relationships` | Admin/Editor | `relationships.service.js` | ❌ | Chưa wire UI |
| [ ] | DELETE | `/api/relationships/:id` | Admin/Editor | `relationships.service.js` | ❌ | Chưa wire UI |
| [ ] | GET | `/api/relationships/:id` | Token | `relationships.service.js` | ❌ | Chưa wire UI |
| [ ] | PUT | `/api/relationships/:id` | Admin/Editor | `relationships.service.js` | ❌ | Chưa wire UI |
| [ ] | GET | `/api/relationships/person/:id` | Token | — | — | Thiếu service |

### search

| Done | Method | Endpoint | Auth | FE Service | UI | Ghi chú |
|---|---|---|---|---|---|---|
| [ ] | GET | `/api/search/branches` | Token | — | — | Thiếu service |
| [ ] | GET | `/api/search/events` | Token | — | — | Thiếu service |
| [x] | GET | `/api/search/persons` | Token | `search.service.js` | ✅ | OK |

### users

| Done | Method | Endpoint | Auth | FE Service | UI | Ghi chú |
|---|---|---|---|---|---|---|
| [x] | GET | `/api/users` | Admin | `users.service.js` | ✅ | OK |
| [x] | PUT | `/api/users/:id/ban` | Admin | `users.service.js` | ✅ | OK |
| [x] | PUT | `/api/users/:id/role` | Admin | `users.service.js` | ✅ | OK |
| [x] | GET | `/api/users/me` | Token | `users.service.js` | ✅ | OK |
| [x] | PUT | `/api/users/me` | Token | `users.service.js` | ✅ | OK |

## Gợi ý ưu tiên hoàn thiện

1. **Audit log**: thêm service + trang Admin để xem log (list + detail).
2. **Search events/branches**: bổ sung `search.service.js` để gọi `/search/events`, `/search/branches` + UI filter.
3. **Relationships theo person**: thêm `GET /relationships/person/:id` để lấy quan hệ nhanh (phục vụ detail/tree tuỳ thiết kế).
4. **Media update/delete**: bổ sung sửa caption/metadata và xoá media; thêm UI quản lý media.
