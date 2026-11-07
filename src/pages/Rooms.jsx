import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, LayoutGrid, List, Download, Plus, Info, KeyRound, Phone, CheckCheck, Wrench, Droplets, Zap, RefreshCw, Pencil, UserPlus } from 'lucide-react';
import { roomsApi } from '../api/endpoints.js';
import { useFetch, useDebounce } from '../hooks/useFetch.js';
import { Async, Loading, PageHead, StatCard, Toast, Modal } from '../components/ui.jsx';
import { vnd } from '../utils/format.js';

const STATUS = {
  RENTED: { label: 'Đang thuê', cls: 'green' },
  VACANT: { label: 'Còn trống', cls: 'gray' },
  MAINTENANCE: { label: 'Bảo trì', cls: 'red' },
};
const emptyForm = { code: '', name: 'Phòng tiêu chuẩn', floor: 1, area: 20, price: 3000000, note: '' };

function exportCsv(items) {
  const rows = [['Mã phòng','Tên phòng','Tầng','Diện tích','Giá thuê','Trạng thái','Khách thuê'], ...items.map(r => [r.code,r.name,r.floor,r.area,r.price,STATUS[r.status]?.label,r.tenantName || ''])];
  const csv = '\uFEFF' + rows.map(row => row.map(v => `"${String(v ?? '').replaceAll('"','""')}"`).join(',')).join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a'); a.href = url; a.download = 'danh-sach-phong.csv'; a.click(); URL.revokeObjectURL(url);
}

export default function Rooms() {
  const [q, setQ] = useState('');
  const [floor, setFloor] = useState('all');
  const [status, setStatus] = useState('all');
  const [view, setView] = useState('grid');
  const [toast, setToast] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const dq = useDebounce(q);
  const state = useFetch(() => roomsApi.list({ q: dq, floor, status }), [dq, floor, status]);
  const navigate = useNavigate();

  const flash = (m) => { setToast(m); setTimeout(() => setToast(''), 2600); };
  const refresh = () => { state.reload(); };
  const finishMaintenance = async (r) => {
    try { await roomsApi.setStatus(r.id, 'VACANT'); flash(`Đã chuyển phòng ${r.code} sang Còn trống`); refresh(); }
    catch (e) { flash(e.message); }
  };
  const createRoom = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await roomsApi.create({ ...form, floor: Number(form.floor), area: Number(form.area), price: Number(form.price) });
      setShowForm(false); setForm(emptyForm); flash('Đã thêm phòng mới'); refresh();
    } catch (e) { flash(e.message); } finally { setSaving(false); }
  };
  const changeStatus = async (r, next) => {
    try {
      let extra = {};
      if (next === 'MAINTENANCE') {
        const reason = window.prompt('Lý do bảo trì phòng:', 'Sửa chữa thiết bị');
        if (reason === null) return;
        extra = { reason, expectedDone: new Date(Date.now()+7*86400000).toISOString().slice(0,10), technician: 'Chưa phân công' };
      }
      await roomsApi.setStatus(r.id, next, extra);
      flash(`Đã cập nhật trạng thái phòng ${r.code}`); setSelected(null); refresh();
    } catch (e) { flash(e.message); }
  };

  return (
    <>
      <PageHead title="Danh sách phòng" desc="Quản lý trạng thái, giá thuê và thông tin từng phòng.">
        <button className="btn" onClick={refresh}><RefreshCw size={13}/> Làm mới</button>
        <button className="btn" onClick={() => exportCsv(state.data?.items || [])}><Download size={13}/> Xuất CSV</button>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}><Plus size={14}/> Thêm phòng mới</button>
      </PageHead>
      <Async state={state.data ? { ...state, loading: false } : state}>
        {({ items, stats, floors }) => (
          <>
            <div className="grid g4">
              <StatCard label="Tổng công suất" value={stats.total} unit="Phòng" icon={LayoutGrid}/>
              <StatCard label="Đang cho thuê" value={stats.rented} unit="Phòng" valueClass="c-green"/>
              <StatCard label="Phòng còn trống" value={String(stats.vacant).padStart(2,'0')} unit="Phòng"/>
              <StatCard label="Đang sửa & bảo trì" value={String(stats.maintenance).padStart(2,'0')} unit="Phòng" valueClass="c-red"/>
            </div>
            <div className="card" style={{marginTop:14}}>
              <div className="toolbar">
                <div className="input-wrap grow"><Search size={14}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Tìm số phòng, tên khách, số điện thoại..."/></div>
                <div className="chips">
                  <button className={`chip ${view==='grid'?'active green':''}`} onClick={()=>setView('grid')}><LayoutGrid size={11}/> Lưới</button>
                  <button className={`chip ${view==='table'?'active green':''}`} onClick={()=>setView('table')}><List size={11}/> Bảng</button>
                </div>
              </div>
              <div className="toolbar" style={{marginTop:12,justifyContent:'space-between'}}>
                <div className="chips"><span className="chip-label">Tầng:</span>
                  <button className={`chip ${floor==='all'?'active':''}`} onClick={()=>setFloor('all')}>Tất cả</button>
                  {floors.map(f=><button key={f.floor} className={`chip ${floor===String(f.floor)?'active':''}`} onClick={()=>setFloor(String(f.floor))}>Tầng {f.floor} ({f.count})</button>)}
                </div>
                <div className="chips"><span className="chip-label">Trạng thái:</span>
                  {[['all','Tất cả'],['RENTED','Đang thuê'],['VACANT','Còn trống'],['MAINTENANCE','Bảo trì']].map(([v,l])=><button key={v} className={`chip ${status===v?'active green':''}`} onClick={()=>setStatus(v)}>{l}</button>)}
                </div>
              </div>
            </div>
            {state.loading && <Loading/>}
            {!items.length && !state.loading && <div className="empty">Không tìm thấy phòng phù hợp</div>}
            {view==='grid' ? <div className="room-grid">{items.map(r=><RoomCard key={r.id} r={r} onDone={()=>finishMaintenance(r)} onDetail={()=>setSelected(r)} onInvoice={()=>navigate('/invoices')} onTenant={()=>navigate('/tenants')} onMaintenance={()=>changeStatus(r,'MAINTENANCE')}/>)}</div> :
              <div className="card table-wrap" style={{marginTop:14,padding:0}}><table><thead><tr><th>Phòng</th><th>Loại</th><th>Tầng</th><th>Diện tích</th><th>Khách thuê</th><th>Giá niêm yết</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
                <tbody>{items.map(r=><tr key={r.id}><td><span className="tag">{r.code}</span></td><td>{r.name}</td><td>{r.floor}</td><td>{r.area}m²</td><td>{r.tenantName||'—'}</td><td>{vnd(r.price)} đ</td><td><span className={`pill ${STATUS[r.status].cls}`}>{STATUS[r.status].label}</span></td><td><button className="btn btn-sm" onClick={()=>setSelected(r)}>Chi tiết</button></td></tr>)}</tbody>
              </table></div>}
            <div className="notice"><span>Tổng cộng: <b>{stats.total} phòng</b></span><span className="c-green">• Đang thuê: <b>{stats.rented}</b></span><span>• Trống: <b>{stats.vacant}</b></span><span className="c-red">• Bảo trì: <b>{stats.maintenance}</b></span><span style={{marginLeft:'auto'}}><Zap size={12} className="c-yellow"/> Điện &nbsp;<Droplets size={12} className="c-blue"/> Nước</span></div>
          </>
        )}
      </Async>
      {showForm && <Modal title="Thêm phòng mới" onClose={()=>setShowForm(false)}>
        <form onSubmit={createRoom}>
          <div className="grid g2">
            <div className="field"><label>Mã phòng *</label><input required value={form.code} onChange={e=>setForm({...form,code:e.target.value})} placeholder="Ví dụ: 305"/></div>
            <div className="field"><label>Tên phòng *</label><input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></div>
            <div className="field"><label>Tầng *</label><input type="number" min="1" required value={form.floor} onChange={e=>setForm({...form,floor:e.target.value})}/></div>
            <div className="field"><label>Diện tích (m²) *</label><input type="number" min="1" required value={form.area} onChange={e=>setForm({...form,area:e.target.value})}/></div>
            <div className="field"><label>Giá thuê/tháng (VNĐ) *</label><input type="number" min="0" required value={form.price} onChange={e=>setForm({...form,price:e.target.value})}/></div>
          </div>
          <div className="field"><label>Ghi chú</label><input value={form.note} onChange={e=>setForm({...form,note:e.target.value})} placeholder="Nội thất, tiện ích..."/></div>
          <div className="modal-actions"><button type="button" className="btn" onClick={()=>setShowForm(false)}>Hủy</button><button className="btn btn-primary" disabled={saving}>{saving?'Đang lưu...':'Lưu phòng'}</button></div>
        </form>
      </Modal>}
      {selected && <Modal title={`Thông tin phòng ${selected.code}`} onClose={()=>setSelected(null)}>
        <div className="grid g2">
          <div className="room-info"><div className="r"><span>Loại phòng</span><b>{selected.name}</b></div><div className="r"><span>Tầng / Diện tích</span><b>{selected.floor} / {selected.area}m²</b></div><div className="r"><span>Giá thuê</span><b>{vnd(selected.price)} đ/tháng</b></div></div>
          <div className="room-info"><div className="r"><span>Trạng thái</span><b>{STATUS[selected.status]?.label}</b></div><div className="r"><span>Khách thuê</span><b>{selected.tenantName||'Chưa có'}</b></div><div className="r"><span>Điện thoại</span><b>{selected.phone||'—'}</b></div></div>
        </div>
        <div className="modal-actions">
          {selected.status==='VACANT' && <button className="btn btn-green" onClick={()=>{setSelected(null);navigate('/tenants')}}><UserPlus size={13}/> Tiếp nhận khách</button>}
          {selected.status==='RENTED' && <button className="btn btn-primary" onClick={()=>{setSelected(null);navigate('/invoices')}}>Xem hóa đơn</button>}
          {selected.status==='MAINTENANCE' ? <button className="btn btn-green" onClick={()=>finishMaintenance(selected)}>Hoàn tất bảo trì</button> : selected.status!=='RENTED' && <button className="btn" onClick={()=>changeStatus(selected,'MAINTENANCE')}><Wrench size={13}/> Đưa vào bảo trì</button>}
          <button className="btn" onClick={()=>setSelected(null)}>Đóng</button>
        </div>
      </Modal>}
      <Toast msg={toast}/>
    </>
  );
}

function RoomCard({r,onDone,onDetail,onInvoice,onTenant,onMaintenance}) {
  const st=STATUS[r.status];
  return <div className="room">
    <div className="room-head"><div className="room-no">{r.code}</div><div className="meta"><b>{r.name}</b>Tầng {r.floor} • {r.area}m²</div><span className={`pill ${st.cls}`}>{st.label}</span></div>
    {r.status==='RENTED' && <div className="room-info"><div className="r"><span>Khách thuê:</span><b>{r.tenantName}</b></div><div className="r"><span>Liên hệ:</span><b className="c-red"><Phone size={10}/> {r.phone}</b></div><div className="r"><span>Hạn thanh toán:</span><b className={r.overdue?'c-red':'c-green'}>{r.dueText||'Theo hợp đồng'}</b></div></div>}
    {r.status==='VACANT' && <div className="room-info room-empty"><KeyRound size={18}/><b>Sẵn sàng đón khách</b>{r.note||'Có thể tiếp nhận khách thuê mới'}</div>}
    {r.status==='MAINTENANCE' && <div className="room-info"><div className="r"><span>Lý do:</span><b className="c-red">{r.reason}</b></div><div className="r"><span>Dự kiến xong:</span><b>{r.expectedDone||'Chưa xác định'}</b></div><div className="r"><span>Thợ phụ trách:</span><b>{r.technician||'Chưa phân công'}</b></div></div>}
    <div className="room-price"><span>Giá niêm yết:</span><div><b>{vnd(r.price)}</b>đ/tháng</div></div>
    <div className="room-actions">
      <button className="btn" onClick={onDetail}><Info size={12}/> Chi tiết</button>
      {r.status==='RENTED' && <button className="btn btn-primary" onClick={onInvoice}>Hóa đơn</button>}
      {r.status==='VACANT' && <button className="btn btn-green" onClick={onTenant}><UserPlus size={12}/> Thêm khách</button>}
      {r.status==='MAINTENANCE' ? <button className="btn btn-green" onClick={onDone}><CheckCheck size={12}/> Xong bảo trì</button> : r.status==='VACANT' ? <button className="btn" onClick={onMaintenance}><Wrench size={12}/> Bảo trì</button> : null}
    </div>
  </div>;
}
