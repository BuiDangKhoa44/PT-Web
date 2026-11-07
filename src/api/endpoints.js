// TẤT CẢ lời gọi API nằm ở đây. Mỗi hàm có chú thích route NestJS tương ứng.
// Component chỉ import từ file này, không gọi fetch trực tiếp.
import { http, USE_MOCK, tokenStore } from './client.js';
import * as M from './mockData.js';

const delay = (data, ms = 350) => new Promise((r) => setTimeout(() => r(structuredClone(data)), ms));
const mock = (data) => delay(data);

/* ---------------- AUTH ---------------- */
export const authApi = {
  // POST /auth/login  body {username,password} -> { accessToken, user }
  async login(username, password) {
    if (USE_MOCK) {
      if (username === 'admin' && password === '123456') {
        return delay({ accessToken: 'mock-token', user: M.mockUser });
      }
      throw new Error('Sai tên đăng nhập hoặc mật khẩu');
    }
    return http.post('/auth/login', { username, password });
  },
  // GET /auth/me -> user
  async me() {
    if (USE_MOCK) return tokenStore.get() ? delay(M.mockUser, 100) : Promise.reject(new Error('unauthorized'));
    return http.get('/auth/me');
  },
};

/* ---------------- DASHBOARD ---------------- */
export const dashboardApi = {
  // GET /dashboard/summary?period=2024-10
  summary: (period) => (USE_MOCK ? mock(M.mockDashboard) : http.get('/dashboard/summary', { period })),
};

/* ---------------- ROOMS ---------------- */
export const roomsApi = {
  // GET /rooms?floor=1&status=RENTED|VACANT|MAINTENANCE&q=...
  // -> { items: Room[], stats: { total, rented, vacant, maintenance } }
  async list({ floor, status, q } = {}) {
    if (USE_MOCK) {
      let items = M.mockRooms;
      if (floor && floor !== 'all') items = items.filter((r) => r.floor === Number(floor));
      if (status && status !== 'all') items = items.filter((r) => r.status === status);
      if (q) {
        const s = q.toLowerCase();
        items = items.filter((r) => [r.code, r.tenantName, r.phone].some((v) => v?.toLowerCase().includes(s)));
      }
      const all = M.mockRooms;
      const floorCounts = [...new Set(all.map(r => r.floor))].sort((a,b)=>a-b).map(floor => ({ floor, count: all.filter(r => r.floor === floor).length }));
      return delay({
        items,
        stats: { total: all.length, rented: all.filter(r=>r.status==='RENTED').length, vacant: all.filter(r=>r.status==='VACANT').length, maintenance: all.filter(r=>r.status==='MAINTENANCE').length },
        floors: floorCounts,
      });
    }
    return http.get('/rooms', { floor, status, q });
  },
  // POST /rooms
  create: async (dto) => {
    if (!USE_MOCK) return http.post('/rooms', dto);
    const room = { ...dto, id: Date.now(), status: 'VACANT', tenantName: null, phone: null };
    M.mockRooms.unshift(room); return mock(room);
  },
  // PATCH /rooms/:id/status  body { status }
  setStatus: async (id, status, extra = {}) => {
    if (!USE_MOCK) return http.patch(`/rooms/${id}/status`, { status, ...extra });
    const room = M.mockRooms.find((r) => r.id === id);
    if (room) { room.status = status; if (status === 'MAINTENANCE') { room.reason = extra.reason || 'Đang bảo trì'; room.expectedDone = extra.expectedDone || null; room.technician = extra.technician || null; } else { room.reason = null; room.expectedDone = null; room.technician = null; } }
    return mock({ id, status });
  },
};

/* ---------------- TENANTS ---------------- */
export const tenantsApi = {
  // GET /tenants?q=&room=&status=&page=1&limit=6
  // -> { items, total, page, pages, stats }
  async list({ q, status, page = 1, limit = 6 } = {}) {
    if (USE_MOCK) {
      let items = M.mockTenants;
      if (status && status !== 'all') items = items.filter((t) => t.contractStatus === status);
      if (q) {
        const s = q.toLowerCase();
        items = items.filter((t) => [t.fullName, t.idCard, t.phone].some((v) => v.toLowerCase().includes(s)));
      }
      const total = items.length;
      const pages = Math.max(1, Math.ceil(total / limit));
      return delay({ items: items.slice((page - 1) * limit, page * limit), total, page, pages, stats: { ...M.mockTenantStats, staying: M.mockTenants.filter(t=>t.contractStatus!=='EXPIRED').length, totalDeposit: M.mockTenants.reduce((n,t)=>n+Number(t.deposit||0),0) } });
    }
    return http.get('/tenants', { q, status, page, limit });
  },
  create: async (dto) => {
    if (!USE_MOCK) return http.post('/tenants', dto);
    const room = M.mockRooms.find((r) => r.id === Number(dto.roomId));
    const tenant = { ...dto, id: Date.now(), roomCode: `P.${room?.code || ''}`, moveInDate: dto.moveInDate, contractStatus: 'ACTIVE' };
    M.mockTenants.unshift(tenant);
    if (room) { room.status = 'RENTED'; room.tenantName = dto.fullName; room.phone = dto.phone; }
    return mock(tenant);
  },
  // POST /tenants/:id/checkout
  checkout: async (id) => {
    if (!USE_MOCK) return http.post(`/tenants/${id}/checkout`);
    const tenant = M.mockTenants.find((t) => t.id === id);
    if (tenant) {
      tenant.contractStatus = 'EXPIRED';
      const room = M.mockRooms.find((r) => `P.${r.code}` === tenant.roomCode);
      if (room) { room.status = 'VACANT'; room.tenantName = null; room.phone = null; }
    }
    return mock({ id, checkedOut: true });
  },
};

/* ---------------- UTILITIES (điện nước) ---------------- */
export const utilitiesApi = {
  // GET /utilities/rates
  rates: () => (USE_MOCK ? mock(M.mockRates) : http.get('/utilities/rates')),
  // GET /utilities/readings?period=2024-10
  readings: (period) => (USE_MOCK ? mock(M.mockReadings) : http.get('/utilities/readings', { period })),
  // PUT /utilities/readings  body { period, items:[{roomId, elecNew, waterNew}] }
  saveReadings: (period, items) =>
    USE_MOCK ? mock({ saved: items.length }) : http.put('/utilities/readings', { period, items }),
};

/* ---------------- INVOICES ---------------- */
export const invoicesApi = {
  // GET /invoices?period=&status=PAID|PENDING|OVERDUE&q=
  // -> { items, stats }
  async list({ status, q, period } = {}) {
    if (USE_MOCK) {
      let items = M.mockInvoices.filter(i => !period || i.period === period);
      if (status && status !== 'all') items = items.filter((i) => i.status === status);
      if (q) items = items.filter((i) => (i.code + i.roomCode).toLowerCase().includes(q.toLowerCase()));
      return delay({ items, stats: M.mockInvoiceStats, counts: { all: M.mockInvoices.filter(i=>!period || i.period===period).length, PAID: M.mockInvoices.filter(i=>i.status==='PAID' && (!period || i.period===period)).length, PENDING: M.mockInvoices.filter(i=>i.status==='PENDING' && (!period || i.period===period)).length, OVERDUE: M.mockInvoices.filter(i=>i.status==='OVERDUE' && (!period || i.period===period)).length } });
    }
    return http.get('/invoices', { status, q, period });
  },
  // PATCH /invoices/:id/confirm-payment
  confirm: async (id, method = 'Tiền mặt trực tiếp') => {
    if (!USE_MOCK) return http.patch(`/invoices/${id}/confirm-payment`, { method });
    const invoice = M.mockInvoices.find((i) => i.id === id);
    if (invoice) invoice.status = 'PAID';
    return mock({ id, status: 'PAID' });
  },
  // POST /invoices/generate  body { period }
  generate: async (period) => {
    if (!USE_MOCK) return http.post('/invoices/generate', { period });
    return mock({ created: 0, message: 'Dữ liệu demo: chưa có chỉ số mới để tạo hóa đơn.' });
  },
  // POST /invoices/notify  (gửi Zalo/SMS nhắc nợ)
  notify: (period) => (USE_MOCK ? mock({ sent: 5 }) : http.post('/invoices/notify', { period })),
};

/* ---------------- REPORTS & SETTINGS ---------------- */
export const reportsApi = {
  // GET /reports/revenue?months=4
  revenue: (months = 4) => (USE_MOCK ? mock(M.mockReport) : http.get('/reports/revenue', { months })),
  // GET /reports/export?format=pdf|xlsx  (trả file blob — xử lý ở backend)
  exportUrl: (format) => `${import.meta.env.VITE_API_URL || '/api'}/reports/export?format=${format}`,
};

export const settingsApi = {
  // GET /settings
  get: () => (USE_MOCK ? mock(M.mockSettings) : http.get('/settings')),
  // PUT /settings
  save: (dto) => (USE_MOCK ? mock(dto) : http.put('/settings', dto)),
};


/* ---------------- EXPENSES ---------------- */
export const expensesApi = {
  list: (period) => (USE_MOCK ? mock(M.mockExpenses.filter(x => !period || x.period === period)) : http.get('/expenses', { period })),
  create: async (dto) => {
    if (!USE_MOCK) return http.post('/expenses', dto);
    const item = { ...dto, id: Date.now() }; M.mockExpenses.unshift(item); return mock(item);
  },
};
