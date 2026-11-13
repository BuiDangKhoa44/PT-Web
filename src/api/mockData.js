// Dữ liệu giả dùng khi VITE_USE_MOCK=true. Hình dạng dữ liệu (camelCase) chính là
// "hợp đồng" gợi ý cho DTO của NestJS — backend trả đúng các field này là frontend chạy ngay.

export const mockUser = { id: 1, fullName: 'Quản trị viên', username: 'admin', role: 'ADMIN' };

export const mockDashboard = {
  branchName: 'Dãy trọ Tình Yêu - 12 Phòng',
  period: '2024-10',
  totalRooms: 24, rentedRooms: 18, vacantRooms: 4, maintenanceRooms: 2,
  expectedRevenue: 68500000, collected: 48000000, outstanding: 20500000,
  unpaidRooms: 5, paidInvoices: 13, totalInvoices: 18, revenueGrowth: 8,
  chart: [
    { label: 'T05', income: 52, expense: 9 }, { label: 'T06', income: 55, expense: 11 },
    { label: 'T07', income: 58, expense: 7 }, { label: 'T08', income: 61, expense: 13 },
    { label: 'T09', income: 63, expense: 8 }, { label: 'T10', income: 68, expense: 9, current: true },
  ],
  avgMonthlyIncome: 58800000, netMargin: 81.2,
  tasks: [
    { id: 1, type: 'METER', title: '3 phòng chưa chốt điện nước', detail: 'P.102, P.204, P.301 còn thiếu chỉ số cuối tháng', action: 'Nhập ngay', to: '/utilities' },
    { id: 2, type: 'CONTRACT', title: '2 khách sắp hết hạn (7 ngày tới)', detail: 'Lê Văn Hùng (P.104) & Trần Thị Mai (P.202)', action: 'Tái ký', to: '/tenants' },
    { id: 3, type: 'REPAIR', title: 'Sửa điều hòa Phòng 203', detail: 'Báo chảy nước dàn lạnh • Gửi lúc 08:30 sáng', action: 'Gọi thợ', to: '/rooms' },
  ],
  recentPayments: [
    { id: 1, roomCode: 'P.101', tenantName: 'Nguyễn Tuấn Anh', phone: '0912.839.221', period: 'Tháng 10/2024', amount: 3850000, method: 'Chuyển khoản (VietQR)', status: 'PAID' },
    { id: 2, roomCode: 'P.205', tenantName: 'Hoàng Minh Thảo', phone: '0983.112.449', period: 'Tháng 10/2024', amount: 4200000, method: 'Chuyển khoản liên NH', status: 'PENDING' },
    { id: 3, roomCode: 'P.302', tenantName: 'Võ Đăng Khoa', phone: '0977.000.123', period: 'Tháng 10/2024', amount: 3500000, method: 'Tiền mặt trực tiếp', status: 'PAID' },
    { id: 4, roomCode: 'P.103', tenantName: 'Lê Thị Hoàng Yến', phone: '0974.119.502', period: 'Tháng 10/2024', amount: 2900000, method: 'Chuyển khoản (VietQR)', status: 'PAID' },
  ],
};

export const mockRooms = [
  { id: 1, code: '101', name: 'Phòng Studio', floor: 1, area: 25, price: 3400000, status: 'RENTED', tenantName: 'Trần Anh Quân', phone: '0918.423.882', dueText: 'Ngày 05 hàng tháng' },
  { id: 2, code: '102', name: 'Phòng Gác lửng', floor: 1, area: 28, price: 3600000, status: 'VACANT', note: 'Đã vệ sinh hoàn tất' },
  { id: 3, code: '103', name: 'Phòng Cơ bản', floor: 1, area: 20, price: 2900000, status: 'RENTED', tenantName: 'Lê Thị Hoàng Yến', phone: '0974.119.502', dueText: 'Ngày 02 hàng tháng' },
  { id: 4, code: '104', name: 'Phòng Gác lửng', floor: 1, area: 28, price: 3500000, status: 'MAINTENANCE', reason: 'Sửa máy lạnh & Vòi sen', expectedDone: '18/05/2025', technician: 'Chú Bảy Thợ Điện' },
  { id: 5, code: '201', name: 'Ban công thoáng', floor: 2, area: 30, price: 4200000, status: 'RENTED', tenantName: 'Vũ Minh Đức', phone: '0903.654.120', dueText: 'Hôm nay (Quá hạn 1d)', overdue: true },
  { id: 6, code: '202', name: 'Phòng Gác lửng', floor: 2, area: 28, price: 3300000, status: 'VACANT', note: 'Đã sơn sửa mới' },
  { id: 7, code: '203', name: 'Phòng Ban công', floor: 2, area: 28, price: 3800000, status: 'RENTED', tenantName: 'Ngô Thanh Vân', phone: '0988.224.781', dueText: 'Ngày 10 hàng tháng' },
  { id: 8, code: '301', name: 'Phòng Cửa sổ lớn', floor: 3, area: 24, price: 3200000, status: 'RENTED', tenantName: 'Đinh Hoàng Long', phone: '0932.771.849', dueText: 'Ngày 08 hàng tháng' },
];

export const mockTenants = [
  { id: 1, fullName: 'Nguyễn Văn An', idCard: '001201004928', phone: '0912 345 678', roomCode: 'P.101', moveInDate: '15/03/2023', deposit: 3500000, contractStatus: 'ACTIVE' },
  { id: 2, fullName: 'Trần Thị Mai', idCard: '034199008215', phone: '0987 654 321', roomCode: 'P.102', moveInDate: '01/08/2023', deposit: 4000000, contractStatus: 'ACTIVE' },
  { id: 3, fullName: 'Lê Hoàng Nam', idCard: '025188001192', phone: '0903 112 233', roomCode: 'P.201', moveInDate: '10/11/2022', deposit: 3200000, contractStatus: 'EXPIRING' },
  { id: 4, fullName: 'Phạm Thu Hương', idCard: '079195006674', phone: '0938 998 877', roomCode: 'P.202', moveInDate: '20/05/2023', deposit: 3800000, contractStatus: 'ACTIVE' },
  { id: 5, fullName: 'Đặng Quốc Tuấn', idCard: '031190005512', phone: '0974 556 877', roomCode: 'P.301', moveInDate: '05/01/2023', deposit: 3000000, contractStatus: 'EXPIRED' },
  { id: 6, fullName: 'Vũ Minh Đức', idCard: '001194002341', phone: '0945 123 789', roomCode: 'P.302', moveInDate: '12/09/2023', deposit: 3500000, contractStatus: 'ACTIVE' },
];
export const mockTenantStats = { staying: 28, capacity: 32, activeContracts: 24, expiringSoon: 3, totalDeposit: 84500000 };

export const mockRates = { electric: 3500, water: 25000, waterPerPerson: 100000, garbage: 50000, internet: 80000 };
export const mockReadings = {
  period: '2024-10',
  consumption: [
    { label: 'T6', electric: 62, water: 38 }, { label: 'T7', electric: 70, water: 45 },
    { label: 'T8', electric: 85, water: 60 }, { label: 'T9', electric: 66, water: 44 },
    { label: 'T10', electric: 92, water: 55, current: true },
  ],
  rows: [
    { roomId: 1, roomCode: 'P.101', tenantName: 'Nguyễn Văn Bình', phoneMasked: '0903 *** 122', people: 2, elecOld: 1240, elecNew: 1382, waterOld: 84, waterNew: 96, recorded: true },
    { roomId: 2, roomCode: 'P.102', tenantName: 'Trần Thị Mai', phoneMasked: '0982 *** 451', people: 1, elecOld: 890, elecNew: 978, waterOld: 52, waterNew: 59, recorded: true },
    { roomId: 3, roomCode: 'P.201', tenantName: 'Lê Hoàng Quân', phoneMasked: '0912 *** 903', people: 3, elecOld: 2410, elecNew: 2635, waterOld: 160, waterNew: 178, recorded: true },
    { roomId: 4, roomCode: 'P.202', tenantName: 'Phạm Thu Hương', phoneMasked: '0938 *** 877', people: 2, elecOld: 1520, elecNew: null, waterOld: 98, waterNew: null, recorded: false },
  ],
};

export const mockInvoices = [
  { id: 1, code: 'HD-10-101', roomCode: 'P.101', tenantName: 'Nguyễn Thị Bích Trâm', rent: 3500000, electric: 420000, electricKwh: 120, service: 100000, total: 4020000, dueDate: '05/10/2024', status: 'PAID' },
  { id: 2, code: 'HD-10-202', roomCode: 'P.202', tenantName: 'Lê Hoàng Nam', rent: 2800000, electric: 350000, electricKwh: 100, service: 80000, total: 3230000, dueDate: '02/10/2024', status: 'OVERDUE' },
  { id: 3, code: 'HD-10-303', roomCode: 'P.303', tenantName: 'Trần Đình Khang', rent: 4200000, electric: 580000, electricKwh: 166, service: 120000, total: 4900000, dueDate: '10/10/2024', status: 'PENDING' },
  { id: 4, code: 'HD-10-104', roomCode: 'P.104', tenantName: 'Phạm Ngọc Mai', rent: 3000000, electric: 390000, electricKwh: 111, service: 100000, total: 3490000, dueDate: '05/10/2024', status: 'PAID' },
  { id: 5, code: 'HD-10-205', roomCode: 'P.205', tenantName: 'Vũ Quốc Huy', rent: 1500000, electric: 210000, electricKwh: 60, service: 60000, total: 1770000, dueDate: '03/10/2024', status: 'OVERDUE' },
  { id: 6, code: 'HD-10-401', roomCode: 'P.401', tenantName: 'Đỗ Thùy Trang', rent: 5200000, electric: 650000, electricKwh: 185, service: 150000, total: 6000000, dueDate: '12/10/2024', status: 'PENDING' },
];
export const mockInvoiceStats = { collected: 48000000, collectedCount: 14, collectedPct: 71.6, pending: 15500000, pendingCount: 3, pendingPct: 23.1, overdue: 5000000, overdueRooms: 2 };

export const mockReport = {
  period: 'T3/2025',
  totalRevenue: 48650000, growth: 8.4, rentCollected: 38400000, roomsDone: 12, roomsTotal: 12,
  utilityCost: 7820000, utilityPct: 16.1, maintenance: 2430000, maintenanceNote: 'Thay máy bơm & phao điện',
  netProfitPct: 78.9,
  chart: [
    { label: 'T12/2024', total: 41.2, service: 5, hit: 95 }, { label: 'T01/2025', total: 43.6, service: 6, hit: 97 },
    { label: 'T02/2025', total: 44.9, service: 6, hit: 98 }, { label: 'T03/2025', total: 48.65, service: 7, current: true },
  ],
  costShare: [
    { name: 'Điện năng tiêu thụ', pct: 11.4, amount: '5,55 Tr', color: '#ff5252' },
    { name: 'Nước sinh hoạt', pct: 4.7, amount: '2,27 Tr', color: '#4ade9e' },
    { name: 'Bảo trì thiết bị', pct: 5.0, amount: '2,43 Tr', color: '#a9b8d8' },
  ],
  rows: [
    { period: 'Tháng 03/2025 (Tạm tính)', rented: '12 / 12 (100%)', rent: 38400000, electric: 5550000, water: 2270000, maintenance: 2430000, net: 43790000 },
    { period: 'Tháng 02/2025', rented: '12 / 12 (100%)', rent: 38400000, electric: 4920000, water: 2110000, maintenance: 650000, net: 44780000 },
    { period: 'Tháng 01/2025', rented: '11 / 12 (91.6%)', rent: 35200000, electric: 5780000, water: 2340000, maintenance: 1200000, net: 42120000 },
    { period: 'Tháng 12/2024', rented: '12 / 12 (100%)', rent: 38400000, electric: 5120000, water: 2080000, maintenance: 450000, net: 45150000 },
  ],
};

export const mockSettings = {
  facilityName: 'Ký túc xá / Nhà trọ An Bình',
  address: 'Số 128/4 Đỗ Xuân Hợp, Phường Phước Long B, TP. Thủ Đức, TP.HCM',
  ownerName: 'Bùi Đăng Khoa', ownerPhone: '0345209492',
 bankName: 'ZaloPay (Ví điện tử)', bankAccount: '0345209492', bankHolder: 'BUI DANG KHOA',
  electricPrice: 3500, waterPrice: 18000, servicePrice: 50000,
  meterCloseDay: 25, rentDueFrom: 1, rentDueTo: 5,
};

export const mockExpenses = [
  { id: 1, period: '2024-10', category: 'Bảo trì', amount: 850000, note: 'Thay vòi nước phòng 104' },
  { id: 2, period: '2024-10', category: 'Vệ sinh', amount: 450000, note: 'Vệ sinh khu vực chung' },
  { id: 3, period: '2024-10', category: 'Điện khu chung', amount: 620000, note: 'Tiền điện hành lang' },
];

// Các hóa đơn mẫu thuộc kỳ 10/2024 để bộ lọc kỳ hoạt động đúng trong chế độ demo.
mockInvoices.forEach((invoice) => { invoice.period ||= '2024-10'; });
