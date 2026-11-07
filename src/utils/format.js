export const vnd = (n) => (n == null ? '—' : new Intl.NumberFormat('vi-VN').format(n));
export const vndD = (n) => `${vnd(n)} đ`;
export const initials = (name = '') => name.split(' ').filter(Boolean).slice(-2).map((w) => w[0]).join('').toUpperCase();

export const invoiceStatus = {
  PAID: { label: 'Đã thanh toán', cls: 'green' },
  PENDING: { label: 'Chờ thu', cls: 'gray' },
  OVERDUE: { label: 'Quá hạn', cls: 'red' },
};
export const contractStatus = {
  ACTIVE: { label: 'Còn hạn', cls: 'green' },
  EXPIRING: { label: 'Sắp hết hạn', cls: 'red' },
  EXPIRED: { label: 'Hết hạn', cls: 'red' },
};
