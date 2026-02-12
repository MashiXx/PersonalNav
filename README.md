# Personal NAV - Hệ thống Quản lý Tài sản Cá nhân

Hệ thống quản lý tài sản cá nhân toàn diện, giúp theo dõi tài sản, nợ, và tính toán NAV (Net Asset Value - Giá trị tài sản ròng).

## Tính năng

- **Đăng nhập/Đăng ký**: Bảo mật thông tin người dùng, Remember Me lên đến 30 ngày
- **Quản lý nhóm tài sản**: Phân loại tài sản theo nhóm (bất động sản, sổ tiết kiệm, cổ phiếu, crypto, v.v.)
  - Bảo vệ dữ liệu: Không cho phép xóa nhóm tài sản đã có dữ liệu
  - Icon tùy chỉnh: 10+ icon mặc định, cho phép upload icon riêng (128x128px)
  - Mỗi nhóm có loại tiền tệ riêng, tài sản trong nhóm tự động dùng tiền tệ của nhóm
- **Quản lý tài sản**: Thêm, sửa, xóa tài sản với giá trị và số lượng
- **Lịch sử giá**: Theo dõi biến động giá trị tài sản theo thời gian
- **Quản lý khoản nợ**: Theo dõi các khoản nợ với lãi suất và hạn thanh toán
- **Đa tiền tệ**: Hỗ trợ VND và USD với tỷ giá quy đổi cấu hình trong `src/config/currencies.ts`. Đồng báo cáo là VND
- **Tính toán NAV**: Tự động tính toán giá trị tài sản ròng (quy đổi về VND)
- **Báo cáo thống kê**: Biểu đồ NAV theo tháng, năm và phân bổ tài sản
- **Snapshot NAV**: Lưu trữ lịch sử NAV để theo dõi xu hướng
- **Trang cá nhân**: Avatar mặc định hoặc upload ảnh cá nhân, cập nhật thông tin

## Công nghệ sử dụng

| Layer | Công nghệ |
|-------|-----------|
| Runtime | Node.js + TypeScript |
| Web Framework | Express |
| Views | EJS (Server-side rendering) |
| Database | SQLite via TypeORM |
| Auth | bcryptjs + express-session |
| Charts | Chart.js |
| Image Processing | sharp + multer |

## Cài đặt

### Yêu cầu

- Node.js 18+

### Bước 1: Clone và cài đặt dependencies

```bash
npm install
```

### Bước 2: Cấu hình

Sao chép file `.env.example` thành `.env`:

```bash
cp .env.example .env
```

Cập nhật thông tin trong file `.env`:

| Biến | Mặc định | Mô tả |
|------|----------|-------|
| `PORT` | `3000` | Port của server |
| `NODE_ENV` | `development` | Môi trường |
| `DB_DATABASE` | `./data/personal_nav.sqlite` | Đường dẫn file SQLite |
| `SESSION_SECRET` | — | Khóa bí mật cho session (cần thay đổi trong production) |

Sử dụng SQLite — không cần cài đặt database server riêng.

### Bước 3: Build và chạy ứng dụng

```bash
# Chạy ở chế độ development (với auto-reload)
npm run dev

# Hoặc build và chạy production
npm run build
npm start
```

Ứng dụng sẽ chạy tại: `http://localhost:3000`

## Cấu trúc thư mục

```
src/
├── config/
│   ├── database.ts        # Cấu hình TypeORM DataSource
│   └── currencies.ts      # Định nghĩa tiền tệ và hàm quy đổi
├── controllers/           # Xử lý HTTP request
├── middleware/
│   └── auth.ts            # requireAuth / redirectIfAuth guards
├── models/                # TypeORM entities
│   ├── User.ts
│   ├── AssetGroup.ts
│   ├── Asset.ts
│   ├── Debt.ts
│   ├── PriceHistory.ts
│   └── NAVSnapshot.ts
├── routes/                # Định nghĩa routes
├── services/              # Business logic
├── views/                 # EJS templates
│   ├── partials/          # Header, footer, flash messages
│   ├── auth/              # Login, register
│   ├── dashboard/         # Tổng quan, báo cáo
│   ├── asset-groups/      # CRUD + chi tiết nhóm
│   ├── assets/            # CRUD + lịch sử giá
│   ├── debts/             # CRUD
│   └── profile/           # Trang cá nhân
├── public/                # Static assets (CSS, JS, images)
└── index.ts               # Entry point
```

## Đa tiền tệ

Tiền tệ được cấu hình trong `src/config/currencies.ts`. Mỗi nhóm tài sản có một loại tiền tệ — tất cả tài sản trong nhóm sẽ dùng tiền tệ của nhóm. Khi đổi tiền tệ nhóm, tài sản trong nhóm tự động cập nhật theo.

Để thêm tiền tệ mới, thêm một entry vào mảng `currencies`:

```typescript
{ code: 'EUR', name: 'Euro', symbol: '\u20ac', locale: 'de-DE', rateToVND: 27000 }
```

Tất cả tổng (dashboard, NAV, báo cáo) được quy đổi về VND.

## Sử dụng

1. **Đăng ký** tại `/auth/register`
2. **Đăng nhập** tại `/auth/login`
3. **Tạo nhóm tài sản** (Nhóm tài sản > Thêm nhóm mới) — chọn loại, tiền tệ, icon
4. **Thêm tài sản** vào nhóm — hệ thống tự động lưu lịch sử mỗi khi cập nhật giá trị
5. **Thêm khoản nợ** với số tiền, lãi suất, hạn thanh toán
6. **Xem báo cáo** — biểu đồ NAV theo tháng/năm, phân bổ tài sản
7. **Tạo Snapshot NAV** tại Dashboard để lưu trạng thái hiện tại

## Routes

### Authentication
- `GET/POST /auth/login` — Đăng nhập
- `GET/POST /auth/register` — Đăng ký
- `GET /auth/logout` — Đăng xuất

### Dashboard
- `GET /dashboard` — Trang tổng quan
- `GET /dashboard/reports` — Báo cáo thống kê
- `POST /dashboard/snapshot` — Tạo NAV snapshot

### Asset Groups
- `GET /asset-groups` — Danh sách nhóm
- `GET /asset-groups/create` — Form tạo mới
- `POST /asset-groups` — Tạo nhóm
- `GET /asset-groups/:id` — Chi tiết nhóm
- `GET /asset-groups/:id/edit` — Form chỉnh sửa
- `POST /asset-groups/:id` — Cập nhật nhóm
- `POST /asset-groups/:id/delete` — Xóa nhóm

### Assets
- `GET /assets` — Danh sách tài sản
- `GET /assets/create` — Form tạo mới
- `POST /assets` — Tạo tài sản
- `GET /assets/:id/edit` — Form chỉnh sửa
- `POST /assets/:id` — Cập nhật tài sản
- `POST /assets/:id/delete` — Xóa tài sản
- `GET /assets/:id/history` — Lịch sử giá

### Debts
- `GET /debts` — Danh sách khoản nợ
- `GET /debts/create` — Form tạo mới
- `POST /debts` — Tạo khoản nợ
- `GET /debts/:id/edit` — Form chỉnh sửa
- `POST /debts/:id` — Cập nhật khoản nợ
- `POST /debts/:id/delete` — Xóa khoản nợ

## Bảo mật

- Mật khẩu được hash bằng bcryptjs
- Session-based authentication
- Middleware kiểm tra đăng nhập cho các route protected
- SQL injection prevention với TypeORM parameterized queries
- XSS protection với EJS escaping
- Data integrity: Ngăn chặn xóa nhóm tài sản có dữ liệu

## License

MIT
