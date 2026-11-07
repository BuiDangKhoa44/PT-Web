# TrọManager Pro – Frontend (React + Vite)

Giao diện dark theme cho hệ thống quản lý nhà trọ, làm theo 7 màn hình thiết kế:
Đăng nhập · Tổng quan · Danh sách phòng · Khách thuê · Điện nước & Dịch vụ · Hóa đơn & Thu phí · Báo cáo & Cài đặt.

## Chạy

```bash
npm install
cp .env.example .env
npm run dev          # http://localhost:5173
```

Tài khoản demo (chế độ mock): `admin` / `123456`

## Chuyển sang NestJS

1. Trong `.env` đổi `VITE_USE_MOCK=false`.
2. Đặt `VITE_PROXY_TARGET` là địa chỉ NestJS (mặc định `http://localhost:3000`). Vite proxy `/api/*` sang đó nên không bị CORS khi dev.
3. NestJS nên đặt global prefix `api`: `app.setGlobalPrefix('api')`.
4. Khi deploy, đặt `VITE_API_URL=https://api.ten-mien.com` và bật CORS ở NestJS.

## Cấu trúc

```
src/
  api/
    client.js      fetch wrapper: gắn JWT, xử lý 401, đọc lỗi dạng NestJS
    endpoints.js   TẤT CẢ lời gọi API (mỗi hàm ghi sẵn route NestJS)
    mockData.js    dữ liệu giả = hình dạng JSON mong muốn từ backend
  context/AuthContext.jsx   đăng nhập, lưu token, tự đăng xuất khi 401
  hooks/useFetch.js         useFetch + useDebounce
  components/               Layout (sidebar/topbar), ui (StatCard, Pill, Async...)
  pages/                    7 trang
  styles/index.css          theme (biến CSS ở :root)
```

## Danh sách API cần làm ở NestJS

| Method | Route | Ghi chú |
|---|---|---|
| POST | `/auth/login` | body `{username,password}` → `{accessToken,user}` |
| GET | `/auth/me` | user hiện tại (JWT guard) |
| GET | `/dashboard/summary?period=2024-10` | xem `mockDashboard` |
| GET | `/rooms?floor=&status=RENTED\|VACANT\|MAINTENANCE&q=` | → `{items,stats,floors}` |
| POST | `/rooms` | tạo phòng |
| PATCH | `/rooms/:id/status` | body `{status}` |
| GET | `/tenants?q=&status=ACTIVE\|EXPIRING\|EXPIRED&page=&limit=` | → `{items,total,page,pages,stats}` |
| POST | `/tenants` · `/tenants/:id/checkout` | tiếp nhận / trả phòng |
| GET | `/utilities/rates` | đơn giá điện, nước, rác, internet |
| GET | `/utilities/readings?period=` | chỉ số công tơ từng phòng |
| PUT | `/utilities/readings` | body `{period,items:[{roomId,elecNew,waterNew}]}` |
| GET | `/invoices?status=PAID\|PENDING\|OVERDUE&q=` | → `{items,stats,counts}` |
| PATCH | `/invoices/:id/confirm-payment` | xác nhận thu tiền |
| POST | `/invoices/generate` · `/invoices/notify` | tạo hóa đơn / gửi Zalo-SMS |
| GET | `/reports/revenue?months=4` | báo cáo doanh thu |
| GET | `/reports/export?format=pdf\|xlsx` | trả file |
| GET/PUT | `/settings` | thông tin cơ sở, tài khoản ngân hàng, đơn giá |

Tên field (camelCase) và giá trị enum xem trong `src/api/mockData.js`. Tiền là số nguyên VNĐ, ngày hiện đang là chuỗi `dd/MM/yyyy` – nếu backend trả ISO thì sửa trong `utils/format.js`.

## Lưu ý

- Tiền tạm tính ở trang Điện nước chỉ để xem nhanh; backend nên tính lại khi tạo hóa đơn.
- Token JWT lưu ở `localStorage`. Nếu cần bảo mật hơn, chuyển sang cookie httpOnly và sửa `client.js` (`credentials: 'include'`).
- Các nút chưa có chức năng (Thêm phòng mới, Sửa khách, In phiếu...) mới là giao diện; thêm modal/form khi làm backend.


## Các chức năng tương tác đã mở rộng

- **Phòng:** tạo phòng bằng biểu mẫu, lọc theo tầng/trạng thái, chuyển phòng sang bảo trì, hoàn tất bảo trì, xem chi tiết và xuất CSV.
- **Khách thuê:** tiếp nhận khách mới vào phòng còn trống, nhập CCCD/điện thoại/ngày hợp đồng/tiền cọc/chỉ số đầu kỳ, xem hồ sơ, in hồ sơ và xác nhận trả phòng.
- **Hóa đơn:** lọc theo kỳ tháng và trạng thái, tìm kiếm, tạo hóa đơn theo kỳ, gửi yêu cầu nhắc nợ, xác nhận đã thu, in phiếu và xuất CSV.
- **Điện nước:** chọn kỳ chốt số, nhập chỉ số mới, tính tạm tiền, lọc phòng chưa đủ chỉ số và lưu chỉ số.
- **Chi phí:** trang mới `/expenses` để ghi nhận khoản chi theo kỳ, tìm kiếm, tổng hợp và xuất CSV.
- Các thao tác gọi API NestJS khi `VITE_USE_MOCK=false`. Khi `VITE_USE_MOCK=true`, thao tác demo cập nhật dữ liệu trong bộ nhớ trình duyệt; dữ liệu demo sẽ trở về ban đầu khi tải lại trang.

## Kiểm tra nhanh

1. Chạy backend theo hướng dẫn bên dưới và cấu hình MySQL trong `.env`.
2. Chạy frontend bằng `npm install` rồi `npm run dev`.
3. Chế độ demo mặc định dùng `admin / 123456`. Để dùng dữ liệu backend, đặt `VITE_USE_MOCK=false` và cấu hình `VITE_API_URL`.
