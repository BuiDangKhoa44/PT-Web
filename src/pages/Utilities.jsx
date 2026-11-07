import { useState } from 'react';
import { Calendar, Save, Zap, Droplet, Trash2, Wifi, ListChecks, Search, Filter, Check, ChevronDown, BarChart3, Gauge } from 'lucide-react';
import { utilitiesApi } from '../api/endpoints.js';
import { useFetch } from '../hooks/useFetch.js';
import { Async, Pill, Toast } from '../components/ui.jsx';
import { vnd } from '../utils/format.js';

export default function Utilities() {
  const [period, setPeriod] = useState('2024-10');
  const rates = useFetch(() => utilitiesApi.rates(), []);
  const readings = useFetch(() => utilitiesApi.readings(period), [period]);
  return (
    <Async state={rates}>
      {(r) => (
        <Async state={readings}>
          {(d) => <Content rates={r} data={d} period={period} />}
        </Async>
      )}
    </Async>
  );
}

function Content({ rates, data, period }) {
  const [rows, setRows] = useState(data.rows);
  const [q, setQ] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [incompleteOnly, setIncompleteOnly] = useState(false);

  const setField = (roomId, field, value) =>
    setRows((rs) => rs.map((r) => (r.roomId === roomId ? { ...r, [field]: value === '' ? null : Number(value) } : r)));

  const calc = (r) => {
    const done = r.elecNew != null && r.waterNew != null;
    if (!done) return { done, elec: null, water: null, total: null };
    const elec = Math.max(0, r.elecNew - r.elecOld);
    const water = Math.max(0, r.waterNew - r.waterOld);
    // Công thức tạm tính phía client; backend nên tính lại khi tạo hóa đơn.
    return { done, elec, water, total: elec * rates.electric + water * rates.water + rates.garbage + rates.internet };
  };

  const doneCount = rows.filter((r) => calc(r).done).length;
  const filtered = rows.filter((r) => (r.roomCode + r.tenantName).toLowerCase().includes(q.toLowerCase()) && (!incompleteOnly || !calc(r).done));

  const save = async () => {
    setSaving(true);
    try {
      const items = rows.filter((r) => calc(r).done).map((r) => ({ roomId: r.roomId, elecNew: r.elecNew, waterNew: r.waterNew }));
      await utilitiesApi.saveReadings(period, items);
      setToast(`Đã lưu chỉ số ${items.length} phòng`);
    } catch (e) { setToast(e.message); }
    setSaving(false);
    setTimeout(() => setToast(''), 2400);
  };

  const maxC = Math.max(...data.consumption.map((c) => Math.max(c.electric, c.water)));
  const pct = Math.round((doneCount / rows.length) * 100);

  return (
    <>
      <div className="card" style={{ background: 'linear-gradient(120deg, var(--panel), #2a1d1f)', marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div><span className="pill red" style={{ borderRadius: 4 }}>KỲ CHỐT SỐ</span> <span className="c-green" style={{ fontSize: 10, marginLeft: 6 }}>• Công tơ thông minh đã đồng bộ</span></div>
            <h1 style={{ fontSize: 26, margin: '10px 0 4px' }}>Ghi chỉ số Điện & Nước</h1>
            <p className="c-muted" style={{ maxWidth: 380 }}>Cập nhật công tơ phòng trọ, tự động tính sản lượng tiêu thụ và đối soát chi phí kỳ hiện tại.</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <div className="input-wrap"><Calendar size={13}/><input aria-label="Kỳ chốt số" type="month" value={period} onChange={e=>setPeriod(e.target.value)}/></div>
              <button className="btn btn-green" onClick={() => { setToast(`Đã tính tạm tiền điện nước cho ${doneCount} phòng.`); setTimeout(()=>setToast(""),2400); }}><Gauge size={13} /> Tính tiền tự động</button>
            </div>
            <button className="btn btn-primary" onClick={save} disabled={saving}><Save size={13} /> {saving ? 'Đang lưu...' : 'Lưu chỉ số'}</button>
          </div>
        </div>
      </div>

      <div className="grid g4">
        <div className="card stat"><div className="label">Đơn giá điện</div><div className="value">{vnd(rates.electric)}<small>đ/kWh</small></div><div className="ico c-red"><Zap size={16} /></div><div className="foot" style={{ display: 'flex', justifyContent: 'space-between' }}>Công tơ điện tử <b className="c-green">Ổn định</b></div></div>
        <div className="card stat"><div className="label">Đơn giá nước</div><div className="value c-blue">{vnd(rates.water)}<small>đ/m³</small></div><div className="ico c-blue"><Droplet size={16} /></div><div className="foot" style={{ display: 'flex', justifyContent: 'space-between' }}>Khoán người <b>{vnd(rates.waterPerPerson)} đ/người</b></div></div>
        <div className="card stat"><div className="label">Rác & vệ sinh</div><div className="value c-green">{vnd(rates.garbage)}<small>đ/phòng</small></div><div className="ico c-green"><Trash2 size={16} /></div><div className="foot">Thu định kỳ <b className="c-green">Cố định hàng tháng</b></div></div>
        <div className="card stat"><div className="label">Internet / Wifi</div><div className="value">{vnd(rates.internet)}<small>đ/phòng</small></div><div className="ico"><Wifi size={16} /></div><div className="foot" style={{ display: 'flex', justifyContent: 'space-between' }}>Băng thông 500Mbps <b className="c-green">Tốc độ cao</b></div></div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1.9fr 1fr', marginTop: 14 }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div className="card-title"><BarChart3 size={15} /> Tiêu thụ 5 kỳ gần nhất</div>
            <div className="legend"><span><i style={{ background: '#ff5252' }} />Điện (kWh)</span><span><i style={{ background: '#a9b8d8' }} />Nước (m³)</span></div>
          </div>
          <div className="bars" style={{ height: 150 }}>
            {data.consumption.map((c) => (
              <div className="bar-col" key={c.label}>
                <div className="bar-pair">
                  <div className="bar dark-red" style={{ height: `${(c.electric / maxC) * 100}%`, background: c.current ? '#ff5252' : '#b94747' }} />
                  <div className="bar blue" style={{ height: `${(c.water / maxC) * 100}%` }} />
                </div>
                <span className={`bar-label ${c.current ? 'now' : ''}`}>{c.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><b>Tiến độ nhập số liệu</b><span className="c-green">{pct}%</span></div>
          <div className="donut" style={{ '--p': pct, marginTop: 14 }}><div><b>{doneCount} / {rows.length}</b>Phòng</div></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14, fontSize: 11 }} className="c-muted">
            <span>Còn {rows.length - doneCount} phòng chưa hoàn tất</span><b style={{ color: 'var(--accent)' }}>Xem ngay</b>
          </div>
        </div>
      </div>

      <div id="meter-table" className="card" style={{ marginTop: 14, padding: 0 }}>
        <div className="toolbar" style={{ padding: 16, justifyContent: 'space-between' }}>
          <div className="card-title"><ListChecks size={15} /> Danh sách phòng & Chỉ số công tơ <Pill>{filtered.length} Phòng hiển thị</Pill></div>
          <div className="toolbar"><div className="input-wrap"><Search size={13} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm theo tên hoặc số phòng..." /></div><button className={`btn ${incompleteOnly ? "btn-primary" : ""}`} onClick={() => setIncompleteOnly(!incompleteOnly)} title="Lọc phòng chưa nhập đủ chỉ số"><Filter size={13} /> {incompleteOnly ? "Đang lọc" : "Lọc thiếu"}</button></div>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Phòng</th><th>Khách thuê</th><th className="num">Điện cũ</th><th className="num">Điện mới</th><th className="num">Sử dụng (kWh)</th><th className="num">Nước cũ</th><th className="num">Nước mới</th><th className="num">Sử dụng (m³)</th><th className="num">Tạm tính (đ)</th><th>Trạng thái</th></tr></thead>
            <tbody>
              {filtered.map((r) => {
                const c = calc(r);
                return (
                  <tr key={r.roomId}>
                    <td><b><span className={`dot ${c.done ? '' : ''}`} style={{ marginRight: 6, background: c.done ? 'var(--green)' : 'var(--yellow)' }} />{r.roomCode}</b></td>
                    <td><div className="name">{r.tenantName}</div><div className="sub">{r.phoneMasked} ({r.people} người)</div></td>
                    <td className="num c-muted">{vnd(r.elecOld)}</td>
                    <td className="num"><input className="cell-input" type="number" value={r.elecNew ?? ''} onChange={(e) => setField(r.roomId, 'elecNew', e.target.value)} /></td>
                    <td className="num c-red" style={{ fontWeight: 700 }}>{c.elec ?? '—'}</td>
                    <td className="num c-muted">{r.waterOld}</td>
                    <td className="num"><input className="cell-input" type="number" value={r.waterNew ?? ''} onChange={(e) => setField(r.roomId, 'waterNew', e.target.value)} /></td>
                    <td className="num" style={{ fontWeight: 700 }}>{c.water ?? '—'}</td>
                    <td className="num" style={{ fontWeight: 700 }}>{c.total != null ? vnd(c.total) : '—'}</td>
                    <td>{c.done ? <Pill cls="green"><Check size={10} /> Đã ghi</Pill> : <Pill cls="yellow">Chưa ghi</Pill>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <Toast msg={toast} />
    </>
  );
}
