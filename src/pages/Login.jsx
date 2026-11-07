import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ShieldCheck, Zap, User, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setBusy(true);
    try {
      await login(form.username.trim(), form.password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally { setBusy(false); }
  };

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={submit}>
        <div className="login-logo"><Home size={22} /></div>
        <div className="login-title">TrọManager <span className="pro">PRO</span></div>
        <div className="login-sub">Đăng nhập vào bảng điều khiển quản trị</div>

        <div className="demo-box">
          <ShieldCheck size={16} />
          <div>Tài khoản demo đồ án:<b>admin / 123456</b></div>
          <button type="button" className="btn btn-sm" onClick={() => setForm({ username: 'admin', password: '123456' })}>
            <Zap size={11} /> Điền nhanh
          </button>
        </div>

        <div className="field">
          <label>Tên tài khoản / Số điện thoại</label>
          <div className="input-wrap">
            <User size={14} />
            <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="Nhập tên đăng nhập hoặc SĐT..." required />
          </div>
        </div>
        <div className="field">
          <label>Mật khẩu</label>
          <div className="input-wrap">
            <Lock size={14} />
            <input type={show ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Nhập mật khẩu của bạn..." required />
            <button type="button" onClick={() => setShow(!show)} aria-label="Hiện/ẩn mật khẩu">{show ? <EyeOff size={15} /> : <Eye size={15} />}</button>
          </div>
        </div>
        <div style={{ textAlign: 'right', fontSize: 11, fontWeight: 700, color: '#ff9b9b', marginBottom: 14 }}>Quên mật khẩu?</div>

        {error && <div className="error-msg">{error}</div>}
        <button className="btn btn-primary" style={{ width: '100%', padding: 12 }} disabled={busy}>
          {busy ? 'Đang đăng nhập...' : <>Đăng nhập vào hệ thống <ArrowRight size={14} /></>}
        </button>

        <div className="feat-row">
          <div><b style={{ color: '#ffb084' }}>Tốc độ cao</b>Chỉ số điện/nước</div>
          <div><b className="c-green">An toàn</b>Bảo mật dữ liệu</div>
          <div><b>Tối ưu</b>Đa nền tảng</div>
        </div>
        <div style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 10 }}>
          Đồ án tốt nghiệp - Hệ thống Quản lý nhà trọ thông minh
          <div style={{ opacity: .5, marginTop: 3 }}>Phiên bản v2.4 (Dark Edition)</div>
        </div>
      </form>
    </div>
  );
}
