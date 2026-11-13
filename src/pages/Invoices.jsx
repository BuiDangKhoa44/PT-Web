import { useEffect, useState } from 'react';
import { Search, Calendar, MessageSquare, Plus, CheckCircle2, ClipboardCheck, AlertTriangle, Receipt, Zap, Droplet, Printer, Banknote, QrCode, Info } from 'lucide-react';
import { invoicesApi } from '../api/endpoints.js';
import { useFetch, useDebounce } from '../hooks/useFetch.js';
import { Async, PageHead, Pill, Progress, Toast } from '../components/ui.jsx';
import { vnd, invoiceStatus } from '../utils/format.js';

export default function Invoices() {
  const [q, setQ] = useState('');
  const [period, setPeriod] = useState('2024-10');
  const [status, setStatus] = useState('all');
  const [selectedId, setSelectedId] = useState(null);
  const [toast, setToast] = useState('');
  const dq = useDebounce(q);
  const state = useFetch(() => invoicesApi.list({ q: dq, status, period }), [dq, status, period]);

  const flash = (m) => { setToast(m); setTimeout(() => setToast(''), 2400); };
  const act = async (fn, msg) => { try { await fn(); flash(msg); state.reload(); } catch (e) { flash(e.message); } };

  return (
    <>
      <PageHead eyebrow={<>Tài chính & Kế toán <span className="muted">› Kỳ đối soát định kỳ</span></>} title="Quản lý Hóa đơn & Thu phí">
        <div className="input-wrap"><Calendar size={13}/><input aria-label="Kỳ hóa đơn" type="month" value={period} onChange={e=>setPeriod(e.target.value)} /></div>
        <button className="btn" onClick={() => act(() => invoicesApi.notify(period), 'Đã gửi nhắc nợ qua Zalo/SMS')}><MessageSquare size={13} /> Gửi Zalo / SMS</button>
        <button className="btn" onClick={() => { const rows = [['Mã HĐ','Phòng','Khách thuê','Tổng tiền','Hạn nộp','Trạng thái'], ...(state.data?.items || []).map(i => [i.code,i.roomCode,i.tenantName,i.total,i.dueDate,i.status])]; const csv='\\uFEFF'+rows.map(r=>r.map(v=>`"${String(v ?? '').replaceAll('"','""')}"`).join(',')).join('\\n'); const u=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'})); const a=document.createElement('a'); a.href=u; a.download=`hoa-don-${period}.csv`; a.click(); URL.revokeObjectURL(u); }}><Receipt size={13}/> Xuất CSV</button>
        <button className="btn btn-primary" onClick={() => act(() => invoicesApi.generate(period), 'Đã xử lý tạo hóa đơn kỳ hiện tại')}><Plus size={14} /> Tạo hóa đơn mới</button>
      </PageHead>

      <Async state={state.data ? { ...state, loading: false } : state}>
        {({ items, stats, counts }) => {
          const selected = items.find((i) => i.id === selectedId) || items[0];
          return (
            <>
              <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                <div className="card stat"><div className="label">Đã thu ngân sách</div><div className="value c-green">{vnd(stats.collected)}<small>đ</small></div><div className="ico c-green"><CheckCircle2 size={16} /></div>
                  <div className="foot" style={{ display: 'flex', justifyContent: 'space-between' }}><span className="c-green">● {stats.collectedCount} hóa đơn đã quyết toán</span><Pill cls="green">{stats.collectedPct}%</Pill></div><Progress value={stats.collectedPct} /></div>
                <div className="card stat"><div className="label">Chờ thu tháng 10</div><div className="value c-blue">{vnd(stats.pending)}<small>đ</small></div><div className="ico"><ClipboardCheck size={16} /></div>
                  <div className="foot" style={{ display: 'flex', justifyContent: 'space-between' }}><span>● {stats.pendingCount} hóa đơn chưa tới hạn</span><Pill>{stats.pendingPct}%</Pill></div><Progress value={stats.pendingPct} tone="gray" /></div>
                <div className="card stat"><div className="label">Quá hạn nợ đọng</div><div className="value" style={{ color: '#ff9b9b' }}>{vnd(stats.overdue)}<small>đ</small></div><div className="ico c-red"><AlertTriangle size={16} /></div>
                  <div className="foot" style={{ display: 'flex', justifyContent: 'space-between' }}><span className="c-red">● {stats.overdueRooms} phòng trễ hạn đóng</span><Pill cls="red">Cần nhắc nợ</Pill></div><Progress value={25} tone="red" /></div>
              </div>

              <div className="grid" style={{ gridTemplateColumns: '1.9fr 1fr', marginTop: 14, alignItems: 'start' }}>
                <div className="card" style={{ padding: 0 }}>
                  <div style={{ padding: 14 }}>
                    <div className="input-wrap" style={{ maxWidth: 260 }}><Search size={13} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm theo mã HĐ, số phòng..." /></div>
                    <div className="chips" style={{ marginTop: 10 }}>
                      {[['all', `Tất cả (${counts.all})`], ['PAID', `Đã thu (${counts.PAID})`], ['PENDING', `Chờ thu (${counts.PENDING})`], ['OVERDUE', `Quá hạn (${counts.OVERDUE})`]].map(([v, l]) => (
                        <button key={v} className={`chip ${status === v ? 'active' : ''}`} onClick={() => setStatus(v)}>{l}</button>
                      ))}
                    </div>
                  </div>
                  <div className="table-wrap">
                    <table>
                      <thead><tr><th>Mã HĐ</th><th>Phòng</th><th>Đại diện</th><th className="num">Tiền phòng</th><th className="num">Điện nước</th><th className="num">Dịch vụ</th><th className="num">Tổng cộng</th><th>Hạn nộp</th><th>Trạng thái</th></tr></thead>
                      <tbody>
                        {items.map((i) => {
                          const st = invoiceStatus[i.status];
                          return (
                            <tr key={i.id} onClick={() => setSelectedId(i.id)} style={{ cursor: 'pointer', background: selected?.id === i.id ? 'var(--panel-2)' : undefined }}>
                              <td style={{ fontWeight: 700 }}>{i.code}</td>
                              <td><span className="tag">{i.roomCode}</span></td>
                              <td className="name" style={{ maxWidth: 110 }}>{i.tenantName}</td>
                              <td className="num">{vnd(i.rent)}</td>
                              <td className="num">{vnd(i.electric)}</td>
                              <td className="num">{vnd(i.service)}</td>
                              <td className="num c-green" style={{ fontWeight: 700 }}>{vnd(i.total)} đ</td>
                              <td className="c-muted">{i.dueDate}</td>
                              <td><Pill cls={st.cls}>{st.label}</Pill></td>
                            </tr>
                          );
                        })}
                        {items.length === 0 && <tr><td colSpan={9} className="empty">Không có hóa đơn</td></tr>}
                      </tbody>
                    </table>
                  </div>
                  <div className="pager"><span>Hiển thị {items.length} / {counts.all} hóa đơn</span><div className="pages"><button className="active">1</button><button>2</button></div></div>
                </div>

                {selected && (
                  <div>
                    <div className="card detail-panel">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div className="card-title"><Receipt size={15} /> Chi tiết Phiếu Thu</div><Pill cls={invoiceStatus[selected.status].cls}>{invoiceStatus[selected.status].label}</Pill>
                      </div>
                      <div className="lines" style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <div><small className="c-muted">Phòng quản lý</small><div style={{ fontSize: 24, fontWeight: 700 }}>{selected.roomCode}</div><div style={{ fontSize: 11 }}>{selected.tenantName}</div></div>
                        <div style={{ textAlign: 'right', fontSize: 11 }}><small className="c-muted">Mã chứng từ</small><div style={{ fontWeight: 700 }}>{selected.code}</div><div className="c-muted">Hạn: {selected.dueDate}</div></div>
                      </div>
                      <div className="lines">
                        <div className="r"><span className="c-muted">Tiền thuê phòng</span><b>{vnd(selected.rent)} đ</b></div>
                        <div className="r"><span className="c-muted"><Zap size={11} /> Tiền điện tiêu thụ ({selected.electricKwh} kWh)</span><b>{vnd(selected.electric)} đ</b></div>
                        <div className="r"><span className="c-muted"><Droplet size={11} /> Tiền nước & Vệ sinh</span><b>{vnd(selected.service)} đ</b></div>
                        <div className="total"><span>TỔNG CỘNG PHIẾU:<br /><small className="c-muted">Đã bao gồm VAT & Dịch vụ</small></span><big>{vnd(selected.total)} đ</big></div>
                      </div>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center', background: 'var(--panel-2)', borderRadius: 10, padding: 10, fontSize: 11 }}>
                        <img src="/qr-zalopay.png" alt="QR ZaloPay" style={{ width: 64, height: 64, borderRadius: 6, background: '#fff', flexShrink: 0 }} />
                        <div><b>ZaloPay • BUI DANG KHOA</b><div className="c-muted">SĐT/STK: 0345209492</div><div>Nội dung: <b className="c-green">{selected.code.replace(/-/g, '')} {selected.roomCode.replace('.', '')}</b></div></div>
                      </div>
                      <div className="panel-btns">
                        <button className="btn" onClick={() => window.print()}><Printer size={13} /> In Phiếu Thu</button>
                        <button className="btn btn-primary" disabled={selected.status === 'PAID'} onClick={() => act(() => invoicesApi.confirm(selected.id, 'Tiền mặt trực tiếp'), `Đã xác nhận thu ${selected.code}`)}><Banknote size={13} /> Xác Nhận Thu</button>
                      </div>
                    </div>
                    <div className="notice"><Info size={15} className="c-red" /><span style={{ fontSize: 11 }}>Hệ thống tự động kích hoạt gửi SMS/Zalo trước hạn 03 ngày (vào ngày 02 hàng tháng) và áp dụng cảnh báo nợ đọng tự động.</span></div>
                  </div>
                )}
              </div>
            </>
          );
        }}
      </Async>
      <Toast msg={toast} />
    </>
  );
}
