import { useEffect, useState } from 'react';
import { Search, Download, UserPlus, Phone, Pencil, FileText, LogOut, RefreshCw, Info, ArrowRight, Filter, IdCard, ShieldCheck, ClipboardList, Wallet } from 'lucide-react';
import { tenantsApi, roomsApi } from '../api/endpoints.js';
import { useFetch, useDebounce } from '../hooks/useFetch.js';
import { Async, PageHead, Pill, StatCard, Toast, Modal } from '../components/ui.jsx';
import { vnd, initials, contractStatus } from '../utils/format.js';

const initialForm = { fullName:'', idCard:'', phone:'', roomId:'', moveInDate:new Date().toISOString().slice(0,10), contractEndDate:'', deposit:0, people:1, dueDay:5, elecStart:0, waterStart:0 };
function exportCsv(items) {
  const rows=[['Họ tên','CCCD','Điện thoại','Phòng','Ngày vào','Tiền cọc','Hợp đồng'],...items.map(t=>[t.fullName,t.idCard,t.phone,t.roomCode,t.moveInDate,t.deposit,t.contractStatus])];
  const csv='\uFEFF'+rows.map(r=>r.map(v=>`"${String(v??'').replaceAll('"','""')}"`).join(',')).join('\n');
  const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'})); const a=document.createElement('a');a.href=url;a.download='khach-thue.csv';a.click();URL.revokeObjectURL(url);
}
export default function Tenants() {
  const [q,setQ]=useState(''); const [status,setStatus]=useState('all'); const [page,setPage]=useState(1);
  const [showForm,setShowForm]=useState(false); const [form,setForm]=useState(initialForm); const [vacantRooms,setVacantRooms]=useState([]);
  const [toast,setToast]=useState(''); const [selected,setSelected]=useState(null); const [saving,setSaving]=useState(false);
  const dq=useDebounce(q); const state=useFetch(()=>tenantsApi.list({q:dq,status,page}),[dq,status,page]);
  const flash=m=>{setToast(m);setTimeout(()=>setToast(''),2600);};
  const loadVacant=async()=>{try{const r=await roomsApi.list({status:'VACANT'});setVacantRooms(r.items||[]);}catch(e){flash(e.message);}};
  const openCreate=()=>{setForm(initialForm);loadVacant();setShowForm(true);};
  const createTenant=async e=>{e.preventDefault();setSaving(true);try{
    if(!form.contractEndDate){flash('Vui lòng chọn ngày kết thúc hợp đồng');setSaving(false);return;}
    await tenantsApi.create({...form,roomId:Number(form.roomId),deposit:Number(form.deposit),people:Number(form.people),dueDay:Number(form.dueDay),elecStart:Number(form.elecStart),waterStart:Number(form.waterStart)});
    setShowForm(false);flash('Đã tiếp nhận khách thuê và cập nhật trạng thái phòng');state.reload();
  }catch(err){flash(err.message);}finally{setSaving(false);}};
  const checkout=async t=>{if(!window.confirm(`Xác nhận ${t.fullName} trả phòng ${t.roomCode}?`))return;try{await tenantsApi.checkout(t.id);flash('Đã hoàn tất thủ tục trả phòng');setSelected(null);state.reload();}catch(e){flash(e.message);}};
  return <>
    <PageHead eyebrow={<>Cơ sở dữ liệu cư dân <span className="muted">• Quản lý hợp đồng</span></>} title="Danh sách khách thuê" desc="Tiếp nhận khách, theo dõi tiền cọc và xử lý trả phòng.">
      <button className="btn" onClick={()=>exportCsv(state.data?.items||[])}><Download size={13}/> Xuất CSV</button>
      <button className="btn" onClick={state.reload}><RefreshCw size={13}/> Làm mới</button>
      <button className="btn btn-primary" onClick={openCreate}><UserPlus size={14}/> Tiếp nhận khách mới</button>
    </PageHead>
    <Async state={state.data?{...state,loading:false}:state}>{({items,stats,total,pages})=><>
      <div className="grid g4">
        <StatCard label="Đang cư trú" value={`${stats.staying} / ${stats.capacity}`} icon={IdCard} valueClass="c-green"/>
        <StatCard label="Hợp đồng còn hạn" value={stats.activeContracts} icon={ShieldCheck} valueClass="c-green"/>
        <StatCard label="Sắp hết hạn (< 30 ngày)" value={String(stats.expiringSoon).padStart(2,'0')} icon={ClipboardList}/>
        <StatCard label="Tổng tiền cọc nắm giữ" value={`${vnd(stats.totalDeposit)} đ`} icon={Wallet}/>
      </div>
      <div className="card" style={{marginTop:14}}>
        <div className="toolbar">
          <div className="input-wrap grow"><Search size={14}/><input value={q} onChange={e=>{setQ(e.target.value);setPage(1);}} placeholder="Tìm theo tên, CCCD/CMND, số điện thoại..."/></div>
          <div className="input-wrap"><select value={status} onChange={e=>{setStatus(e.target.value);setPage(1);}}><option value="all">Tất cả tình trạng</option><option value="ACTIVE">Còn hạn</option><option value="EXPIRING">Sắp hết hạn</option><option value="EXPIRED">Hết hạn</option></select><Filter size={12}/></div>
          <button className="btn" onClick={state.reload}><RefreshCw size={13}/></button>
        </div>
      </div>
      <div className="card table-wrap" style={{marginTop:14,padding:0}}>
        <table><thead><tr><th>Khách thuê</th><th>Số điện thoại</th><th>Phòng thuê</th><th>Ngày vào ở</th><th>Tiền cọc (VNĐ)</th><th>Tình trạng HĐ</th><th>Thao tác</th></tr></thead>
          <tbody>{items.map(t=>{const cs=contractStatus[t.contractStatus];return <tr key={t.id}>
            <td style={{display:'flex',gap:10,alignItems:'center'}}><div className="avatar-lg" style={{background:'var(--panel-3)',color:'var(--blue)',fontSize:11,fontWeight:700}}>{initials(t.fullName)}</div><div><div className="name">{t.fullName}</div><div className="sub">CCCD: {t.idCard}</div></div></td>
            <td className="c-red"><Phone size={11}/> {t.phone}</td><td><span className="tag">{t.roomCode}</span></td><td className="c-muted">{t.moveInDate}</td><td style={{fontWeight:700}}>{vnd(t.deposit)} đ</td><td><Pill cls={cs.cls}>{cs.label}</Pill></td>
            <td><div className="row-actions"><button title="Xem hồ sơ" onClick={()=>setSelected(t)}><Info size={14}/></button><button title="Hợp đồng / in hồ sơ" onClick={()=>{setSelected(t);}}><FileText size={14}/></button><button title="Trả phòng" onClick={()=>checkout(t)}><LogOut size={14}/></button></div></td>
          </tr>;})}{!items.length&&<tr><td colSpan={7} className="empty">Không có khách thuê phù hợp</td></tr>}</tbody>
        </table>
        <div className="pager"><span>Hiển thị {items.length} trong số {total} khách thuê</span><div className="pages"><button onClick={()=>setPage(Math.max(1,page-1))}>‹</button>{Array.from({length:pages},(_,i)=>i+1).map(n=><button key={n} className={n===page?'active':''} onClick={()=>setPage(n)}>{n}</button>)}<button onClick={()=>setPage(Math.min(pages,page+1))}>›</button><span>Trang {page}/{pages}</span></div></div>
      </div>
      <div className="notice"><Info size={15} className="c-red"/><span>Hãy kiểm tra CCCD, số điện thoại, tiền cọc và ngày kết thúc hợp đồng trước khi xác nhận tiếp nhận.</span></div>
    </>}</Async>
    {showForm&&<Modal title="Tiếp nhận khách thuê mới" onClose={()=>setShowForm(false)} wide>
      <form onSubmit={createTenant}>
        <div className="grid g2">
          <div className="field"><label>Họ và tên *</label><input required value={form.fullName} onChange={e=>setForm({...form,fullName:e.target.value})} placeholder="Nguyễn Văn A"/></div>
          <div className="field"><label>Số CCCD *</label><input required value={form.idCard} onChange={e=>setForm({...form,idCard:e.target.value})} placeholder="012345678901"/></div>
          <div className="field"><label>Số điện thoại *</label><input required value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="09xxxxxxxx"/></div>
          <div className="field"><label>Phòng còn trống *</label><select required value={form.roomId} onChange={e=>setForm({...form,roomId:e.target.value})}><option value="">-- Chọn phòng --</option>{vacantRooms.map(r=><option key={r.id} value={r.id}>{r.code} · {r.name} · {vnd(r.price)} đ/tháng</option>)}</select></div>
          <div className="field"><label>Ngày vào ở *</label><input type="date" required value={form.moveInDate} onChange={e=>setForm({...form,moveInDate:e.target.value})}/></div>
          <div className="field"><label>Ngày kết thúc hợp đồng *</label><input type="date" required min={form.moveInDate} value={form.contractEndDate} onChange={e=>setForm({...form,contractEndDate:e.target.value})}/></div>
          <div className="field"><label>Tiền cọc (VNĐ)</label><input type="number" min="0" value={form.deposit} onChange={e=>setForm({...form,deposit:e.target.value})}/></div>
          <div className="field"><label>Số người ở</label><input type="number" min="1" value={form.people} onChange={e=>setForm({...form,people:e.target.value})}/></div>
          <div className="field"><label>Ngày đóng tiền hàng tháng</label><input type="number" min="1" max="28" value={form.dueDay} onChange={e=>setForm({...form,dueDay:e.target.value})}/></div>
          <div className="field"><label>Chỉ số điện đầu kỳ</label><input type="number" min="0" value={form.elecStart} onChange={e=>setForm({...form,elecStart:e.target.value})}/></div>
          <div className="field"><label>Chỉ số nước đầu kỳ</label><input type="number" min="0" value={form.waterStart} onChange={e=>setForm({...form,waterStart:e.target.value})}/></div>
        </div>
        {!vacantRooms.length&&<div className="notice c-yellow">Không có phòng trống. Hãy tạo phòng hoặc hoàn tất trả phòng trước.</div>}
        <div className="modal-actions"><button type="button" className="btn" onClick={()=>setShowForm(false)}>Hủy</button><button className="btn btn-primary" disabled={saving||!vacantRooms.length}>{saving?'Đang lưu...':'Xác nhận tiếp nhận'}</button></div>
      </form>
    </Modal>}
    {selected&&<Modal title="Hồ sơ khách thuê" onClose={()=>setSelected(null)}>
      <div className="detail-panel"><div className="card-title">{selected.fullName}</div><div className="lines">
        <div className="r"><span>CCCD</span><b>{selected.idCard}</b></div><div className="r"><span>Điện thoại</span><b>{selected.phone}</b></div><div className="r"><span>Phòng</span><b>{selected.roomCode}</b></div><div className="r"><span>Ngày vào ở</span><b>{selected.moveInDate}</b></div><div className="r"><span>Tiền cọc</span><b>{vnd(selected.deposit)} đ</b></div><div className="r"><span>Hợp đồng</span><b>{contractStatus[selected.contractStatus]?.label}</b></div>
      </div><div className="modal-actions"><button className="btn" onClick={()=>window.print()}><FileText size={13}/> In hồ sơ</button><button className="btn btn-primary" onClick={()=>checkout(selected)}><LogOut size={13}/> Xác nhận trả phòng</button></div></div>
    </Modal>}
    <Toast msg={toast}/>
  </>;
}
