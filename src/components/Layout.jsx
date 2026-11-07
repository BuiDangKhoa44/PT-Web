import { NavLink, Outlet } from 'react-router-dom';
import { Bell, ChevronDown, Building2, Home, LayoutGrid, DoorOpen, Users, Zap, Receipt, Settings, User, LogOut, Wallet } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const NAV = [
  { to: '/', label: 'Tổng quan', icon: LayoutGrid, end: true },
  { to: '/rooms', label: 'Danh sách phòng', icon: DoorOpen },
  { to: '/tenants', label: 'Khách thuê', icon: Users },
  { to: '/utilities', label: 'Điện nước & Dịch vụ', icon: Zap },
  { to: '/invoices', label: 'Hóa đơn & Thu phí', icon: Receipt },
  { to: '/expenses', label: 'Quản lý chi phí', icon: Wallet },
  { to: '/reports', label: 'Báo cáo & Cài đặt', icon: Settings },
];

export default function Layout() {
  const { user, logout } = useAuth();
  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo"><Home size={22} /></div>
          <div><b>TrọManager</b><small>BẢN QUẢN TRỊ</small></div>
        </div>
        <div className="zone-pill"><span>Khu: Đang quản lý</span><em>Hoạt động</em></div>
        <nav className="nav">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => (isActive ? 'active' : '')}>
              <Icon size={16} /> {label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-foot">
          <div>Hệ thống khóa<b>Phiên bản 2.4.0</b></div>
          <span className="dot" />
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="topbar-left">
            <div className="home-btn"><Home size={17} /></div>
            <div className="branch-select"><Building2 size={14} /> Dãy trọ An Bình - 12 Phòng <ChevronDown size={14} /></div>
          </div>
          <div className="topbar-right">
            <button className="icon-btn" aria-label="Thông báo"><Bell size={16} /><span className="badge-dot" /></button>
            <div className="user-chip" onClick={logout} title="Bấm để đăng xuất">
              <div><b>{user?.fullName}</b><small>Online</small></div>
              <div className="avatar-lg"><User size={16} /></div>
            </div>
          </div>
        </header>
        <Outlet />
      </main>
    </div>
  );
}
