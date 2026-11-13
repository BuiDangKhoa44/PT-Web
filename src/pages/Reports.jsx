import { useState } from 'react';
import { TrendingUp, Banknote, Plug, Wrench, FileText, Table2, Building2, SlidersHorizontal, QrCode, Save, GraduationCap, CalendarDays, CalendarCheck, AlertTriangle, Zap, Droplet, Trash2 } from 'lucide-react';
import { reportsApi, settingsApi } from '../api/endpoints.js';
import { useFetch } from '../hooks/useFetch.js';
import { Async, PageHead, Pill, Toast } from '../components/ui.jsx';
import { vnd } from '../utils/format.js';

export default function Reports() {
  const [tab, setTab] = useState('report');
  const report = useFetch(() => reportsApi.revenue(4), []);
  const settings = useFetch(() => settingsApi.get(), []);

  return (
    <>
      <PageHead eyebrow={<><span className="c-red">●</span> HỆ THỐNG TRUNG TÂM</>} title="Báo Cáo Doanh Thu & Cài Đặt Hệ Thống" desc="Phân tích dòng tiền định kỳ, giám sát chỉ số hạ tầng và tùy chỉnh thông số vận hành">
        <button className={`btn ${tab === 'report' ? 'btn-primary' : ''}`} onClick={() => setTab('report')}><TrendingUp size={13} /> Báo Cáo & Dòng Tiền</button>
        <button className={`btn ${tab === 'config' ? 'btn-primary' : ''}`} onClick={() => setTab('config')}><SlidersHorizontal size={13} /> Cấu Hình Cơ Sở</button>
      </PageHead>

      {tab === 'report' && <Async state={report}>{(d) => <ReportView d={d} />}</Async>}
      {tab === 'config' && <Async state={settings}>{(s) => <SettingsView initial={s} />}</Async>}

      <div className="footer-card">
        <GraduationCap size={22} className="c-muted" />
        <div style={{ flex: 1, minWidth: 200 }}><div className="eyebrow c-muted" style={{ color: 'var(--muted)' }}>Đồ án tốt nghiệp chuyên ngành CNTT</div><b>Hệ Thống Số Hóa Quản Lý Nhà Trọ Đa Phòng (TroManager Pro)</b><div className="c-muted" style={{ fontSize: 11 }}>Kiến trúc: Dark Architecture Dashboard • React + Vite • NestJS API</div></div>
        <div className="col"><span>SINH VIÊN THỰC HIỆN</span><b>Bùi Đăng Khoa (MSSV: 2613042003)</b><b>Ngô Quốc Đại (MSSV: 2613042002)</b></div>
        <div className="col"><span>GIẢNG VIÊN HƯỚNG DẪN</span><b>Lê Hữu Phú</b><b>Sơn Hà</b></div>
      </div>
    </>
  );
}

function ReportView({ d }) {
  const maxTotal = Math.max(...d.chart.map((c) => c.total));
  const circ = 2 * Math.PI * 52;
  let offset = 0;
  return (
    <>
      <div className="grid g4">
        <div className="card stat"><div className="label">Tổng doanh thu {d.period}</div><div className="value">{vnd(d.totalRevenue)} <small>đ</small></div><div className="ico"><Banknote size={15} /></div><div className="foot c-green">↗ +{d.growth}% so với T2/2025</div><div className="progress red" style={{ marginTop: 8 }}><i style={{ width: '85%' }} /></div></div>
        <div className="card stat"><div className="label">Thu tiền phòng thực tế</div><div className="value">{vnd(d.rentCollected)} <small>đ</small></div><div className="ico"><Building2 size={15} /></div><div className="foot">{d.roomsDone}/{d.roomsTotal} phòng hoàn thành</div><div className="progress" style={{ marginTop: 8 }}><i style={{ width: '100%' }} /></div></div>
        <div className="card stat"><div className="label">Chi phí điện nước & rác</div><div className="value">{vnd(d.utilityCost)} <small>đ</small></div><div className="ico"><Plug size={15} /></div><div className="foot c-muted">Tỷ trọng {d.utilityPct}% dòng tiền</div><div className="progress gray" style={{ marginTop: 8 }}><i style={{ width: `${d.utilityPct}%` }} /></div></div>
        <div className="card stat"><div className="label">Bảo trì & khắc phục</div><div className="value c-red">{vnd(d.maintenance)} <small>đ</small></div><div className="ico"><Wrench size={15} /></div><div className="foot c-red"><AlertTriangle size={11} /> {d.maintenanceNote}</div><div className="progress red" style={{ marginTop: 8 }}><i style={{ width: '10%' }} /></div></div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1.9fr 1fr', marginTop: 14 }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div><div className="eyebrow c-muted" style={{ color: 'var(--muted)' }}>Hiệu suất vận hành</div><div className="card-title" style={{ fontSize: 17, marginTop: 3 }}>Biểu Đồ Doanh Thu 4 Tháng Gần Nhất</div></div>
            <div style={{ display: 'flex', gap: 6 }}>
              <a className="btn btn-sm" href={reportsApi.exportUrl('pdf')}><FileText size={12} /> PDF</a>
              <a className="btn btn-sm" href={reportsApi.exportUrl('xlsx')}><Table2 size={12} className="c-green" /> Excel</a>
            </div>
          </div>
          <div className="bars" style={{ height: 220, alignItems: 'flex-end' }}>
            {d.chart.map((c) => (
              <div key={c.label} className="bar-col" style={{ alignItems: 'center' }}>
                <small className={c.current ? 'c-red' : 'c-muted'} style={{ fontWeight: 700 }}>{c.total.toString().replace('.', ',')} Tr</small>
                <div className="tall-bar" style={{ height: `${(c.total / maxTotal) * 130}px`, width: 54 }}>
                  <i className={c.current ? 'cur' : 'old'} style={{ height: `${(c.service / c.total) * 100 * 3}%`, maxHeight: '100%', background: c.current ? 'var(--accent)' : '#7a3a3a' }} />
                </div>
                <b style={{ fontSize: 11 }}>{c.label}</b>
                <small className={c.current ? 'c-green' : 'c-muted'}>{c.current ? 'Hiện tại' : `Đạt ${c.hit}%`}</small>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginTop: 10 }} className="c-muted">
            <div className="legend"><span><i style={{ background: '#ff5252' }} />Tiền phòng cơ sở</span><span><i style={{ background: '#7a3a3a' }} />Dịch vụ phát sinh</span></div>
            <span>Trung bình tăng trưởng: +5.8% / tháng</span>
          </div>
        </div>

        <div className="card">
          <div className="eyebrow" style={{ color: 'var(--muted)' }}>Cấu trúc chi tiêu</div>
          <div className="card-title" style={{ fontSize: 17, margin: '3px 0 12px' }}>Tỷ Lệ Chi Phí Vận Hành</div>
          <div style={{ position: 'relative', width: 150, height: 150, margin: '0 auto' }}>
            <svg viewBox="0 0 120 120" width="150" height="150" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="60" cy="60" r="52" fill="none" stroke="var(--panel-3)" strokeWidth="12" />
              {d.costShare.map((c) => {
                const len = (c.pct / 100) * circ * 3.2; // phóng đại để dễ nhìn như thiết kế
                const el = <circle key={c.name} cx="60" cy="60" r="52" fill="none" stroke={c.color} strokeWidth="12" strokeDasharray={`${len} ${circ}`} strokeDashoffset={-offset} strokeLinecap="round" />;
                offset += len;
                return el;
              })}
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center', fontSize: 10, color: 'var(--muted)' }}><div>LỢI NHUẬN RÒNG<b style={{ display: 'block', fontSize: 22, color: 'var(--text)' }}>{d.netProfitPct}%</b></div></div>
          </div>
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {d.costShare.map((c) => (
              <div key={c.name} className="task" style={{ margin: 0, padding: '7px 10px', justifyContent: 'space-between', fontSize: 11 }}>
                <span><i style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: c.color, marginRight: 7 }} />{c.name}</span><b>{c.pct}% ({c.amount})</b>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 14, padding: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: 16, alignItems: 'flex-end' }}>
          <div><div className="eyebrow" style={{ color: 'var(--muted)' }}>Bảng kê đối soát</div><div className="card-title" style={{ fontSize: 17, marginTop: 3 }}>Số Liệu Chi Tiết 4 Chu Kỳ Gần Nhất</div></div>
          <span className="c-muted">Đơn vị: Việt Nam Đồng (VND)</span>
        </div>
        <div className="table-wrap recon">
          <table>
            <thead><tr><th>Chu kỳ tháng</th><th>Phòng thuê</th><th className="num">Tiền phòng</th><th className="num">Tiền điện</th><th className="num">Tiền nước</th><th className="num">Bảo trì</th><th className="num">Thực thu ròng</th></tr></thead>
            <tbody>
              {d.rows.map((r, i) => (
                <tr key={r.period}>
                  <td className={i === 0 ? 'c-red' : ''} style={{ fontWeight: 700 }}>{r.period}</td>
                  <td><Pill cls="green">{r.rented}</Pill></td>
                  <td className="num">{vnd(r.rent)}</td><td className="num">{vnd(r.electric)}</td><td className="num">{vnd(r.water)}</td>
                  <td className="num neg">- {vnd(r.maintenance)}</td>
                  <td className="num c-green" style={{ fontWeight: 700 }}>{vnd(r.net)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function SettingsView({ initial }) {
  const [s, setS] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const set = (k) => (e) => setS({ ...s, [k]: e.target.type === 'number' ? Number(e.target.value) : e.target.value });

  const save = async () => {
    setSaving(true);
    try { await settingsApi.save(s); setToast('Đã lưu cấu hình hệ thống'); } catch (e) { setToast(e.message); }
    setSaving(false); setTimeout(() => setToast(''), 2400);
  };

  return (
    <div className="grid" style={{ gridTemplateColumns: '1.3fr 1fr', alignItems: 'start' }}>
      <div className="card">
        <div className="card-title"><span className="btn btn-primary btn-sm" style={{ padding: 6 }}><Building2 size={14} /></span> Thông Tin Cơ Sở & Thanh Toán</div>
        <div className="card-sub" style={{ marginBottom: 14 }}>Địa chỉ hiển thị trên hợp đồng thuê và biên nhận thu phí điện tử</div>
        <div className="field"><label>Tên Cơ Sở / Dãy Trọ</label><div className="input-wrap"><input value={s.facilityName} onChange={set('facilityName')} /></div></div>
        <div className="field"><label>Địa Chỉ Chi Tiết</label><div className="input-wrap"><input value={s.address} onChange={set('address')} /></div></div>
        <div className="grid g2">
          <div className="field"><label>Họ Tên Quản Lý / Chủ Trọ</label><div className="input-wrap"><input value={s.ownerName} onChange={set('ownerName')} /></div></div>
          <div className="field"><label>Số Điện Thoại Trực Tiếp</label><div className="input-wrap"><input value={s.ownerPhone} onChange={set('ownerPhone')} /></div></div>
        </div>
        <div className="task" style={{ alignItems: 'flex-start', gap: 14, padding: 14 }}>
  <img src="/qr-zalopay.png" alt="QR ZaloPay 0345209492" style={{ width: 120, height: 120, borderRadius: 8, background: '#fff', flexShrink: 0 }} />
  <div style={{ fontSize: 11, flex: 1, minWidth: 0 }}>
    <div className="c-muted" style={{ fontSize: 10, letterSpacing: '.05em', marginBottom: 8 }}>TÀI KHOẢN THỤ HƯỞNG TIỀN THU TRỌ</div>
    <div className="field"><label>Ngân Hàng / Ví</label><div className="input-wrap"><input value={s.bankName || ''} onChange={set('bankName')} /></div></div>
    <div className="field"><label>Số Tài Khoản / SĐT</label><div className="input-wrap"><input value={s.bankAccount || ''} onChange={set('bankAccount')} /></div></div>
    <div className="field"><label>Chủ Tài Khoản</label><div className="input-wrap"><input value={s.bankHolder || ''} onChange={set('bankHolder')} /></div></div>
    <div className="c-muted" style={{ marginTop: 6 }}>Hệ thống sẽ dùng thông tin trên để tạo QR Code động tương ứng với số tiền từng phòng khi phát hành phiếu báo tiền.</div>
  </div>
</div>
</div>

      <div className="card">
        <div className="card-title"><span className="btn btn-sm" style={{ padding: 6 }}><CalendarDays size={14} /></span> Đơn Giá Mặc Định & Chu Kỳ</div>
        <div className="card-sub" style={{ marginBottom: 14 }}>Áp dụng cho kỳ chốt sổ tính tiền tự động</div>
        <div className="field"><label>Giá Điện Tiêu Thụ <span>đ / kWh</span></label><div className="input-wrap"><Zap size={13} className="c-red" /><input type="number" value={s.electricPrice} onChange={set('electricPrice')} /></div></div>
        <div className="field"><label>Giá Nước Sinh Hoạt <span>đ / m³ (khối)</span></label><div className="input-wrap"><Droplet size={13} /><input type="number" value={s.waterPrice} onChange={set('waterPrice')} /></div></div>
        <div className="field"><label>Phí Dịch Vụ / Vệ Sinh Chung <span>đ / phòng / tháng</span></label><div className="input-wrap"><Trash2 size={13} className="c-green" /><input type="number" value={s.servicePrice} onChange={set('servicePrice')} /></div></div>
        <div className="task" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 8, fontSize: 11 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span className="c-muted"><CalendarDays size={12} /> Ngày Chốt Điện Nước:</span><b className="c-red">Ngày {s.meterCloseDay} hàng tháng</b></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span className="c-muted"><CalendarCheck size={12} /> Hạn Thu Tiền Phòng:</span><b className="c-green">Từ ngày {String(s.rentDueFrom).padStart(2, '0')} đến {String(s.rentDueTo).padStart(2, '0')}</b></div>
        </div>
        <button className="btn btn-primary" style={{ width: '100%', padding: 12, marginTop: 6 }} onClick={save} disabled={saving}><Save size={14} /> {saving ? 'Đang lưu...' : 'Lưu Thay Đổi Cấu Hình Hệ Thống'}</button>
      </div>
      <Toast msg={toast} />
    </div>
  );
}
