import { useState } from 'react';
import { Plus, Search, Download, Receipt, Wallet, CalendarDays, RefreshCw } from 'lucide-react';
import { expensesApi } from '../api/endpoints.js';
import { useFetch, useDebounce } from '../hooks/useFetch.js';
import { Async, PageHead, StatCard, Toast, Modal } from '../components/ui.jsx';
import { vnd } from '../utils/format.js';

const currentPeriod = new Date().toISOString().slice(0,7);
const empty = { period: currentPeriod, category:'Bảo trì', amount:'', note:'' };
export default function Expenses() {
  const [period,setPeriod]=useState(currentPeriod); const [q,setQ]=useState(''); const [show,setShow]=useState(false);
  const [form,setForm]=useState(empty); const [toast,setToast]=useState(''); const [saving,setSaving]=useState(false);
  const state=useFetch(()=>expensesApi.list(period),[period]); const dq=useDebounce(q);
  const items=(state.data||[]).filter(x=>(`${x.category} ${x.note}`).toLowerCase().includes(dq.toLowerCase()));
  const total=items.reduce((sum,x)=>sum+Number(x.amount||0),0);
  const flash=m=>{setToast(m);setTimeout(()=>setToast(''),2400);};
  const save=async e=>{e.preventDefault();setSaving(true);try{await expensesApi.create({...form,amount:Number(form.amount)});setShow(false);setForm({...empty,period});flash('Đã ghi nhận khoản chi phí');state.reload();}catch(e){flash(e.message);}finally{setSaving(false);}};
  const exportCsv=()=>{const rows=[['Kỳ','Danh mục','Số tiền','Ghi chú'],...items.map(x=>[x.period,x.category,x.amount,x.note])];const csv='\uFEFF'+rows.map(r=>r.map(v=>`"${String(v??'').replaceAll('"','""')}"`).join(',')).join('\n');const u=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=u;a.download=`chi-phi-${period}.csv`;a.click();URL.revokeObjectURL(u);};
  return <>
    <PageHead title="Quản lý chi phí" desc="Ghi nhận các khoản chi vận hành để đối soát lợi nhuận thực tế.">
      <button className="btn" onClick={state.reload}><RefreshCw size={13}/> Làm mới</button>
      <button className="btn" onClick={exportCsv}><Download size={13}/> Xuất CSV</button>
      <button className="btn btn-primary" onClick={()=>{setForm({...empty,period});setShow(true);}}><Plus size={14}/> Thêm khoản chi</button>
    </PageHead>
    <div className="toolbar card" style={{marginBottom:14}}>
      <div className="field" style={{margin:0,minWidth:180}}><label>Kỳ thống kê</label><input type="month" value={period} onChange={e=>setPeriod(e.target.value)}/></div>
      <div className="input-wrap grow"><Search size={14}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Tìm danh mục hoặc ghi chú..."/></div>
    </div>
    <div className="grid g2">
      <StatCard label="Tổng chi phí đã ghi nhận" value={`${vnd(total)} đ`} icon={Wallet} valueClass="c-red"/>
      <StatCard label="Số khoản chi" value={items.length} unit="khoản" icon={Receipt}/>
    </div>
    <Async state={state.data?{...state,loading:false}:state}>{()=><div className="card table-wrap" style={{marginTop:14,padding:0}}>
      <table><thead><tr><th>Ngày / Kỳ</th><th>Danh mục</th><th>Ghi chú</th><th className="num">Số tiền</th></tr></thead><tbody>
        {items.map(x=><tr key={x.id}><td>{x.period}</td><td><span className="tag">{x.category}</span></td><td>{x.note||'—'}</td><td className="num c-red" style={{fontWeight:700}}>{vnd(x.amount)} đ</td></tr>)}
        {!items.length&&<tr><td colSpan={4} className="empty">Chưa có khoản chi trong kỳ này</td></tr>}
      </tbody></table>
    </div>}</Async>
    {show&&<Modal title="Ghi nhận khoản chi mới" onClose={()=>setShow(false)}>
      <form onSubmit={save}>
        <div className="field"><label>Kỳ chi phí *</label><input type="month" required value={form.period} onChange={e=>setForm({...form,period:e.target.value})}/></div>
        <div className="field"><label>Danh mục *</label><select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>{['Bảo trì','Vệ sinh','Điện khu chung','Nước khu chung','Internet','Nhân công','Khác'].map(x=><option key={x}>{x}</option>)}</select></div>
        <div className="field"><label>Số tiền (VNĐ) *</label><input type="number" min="1" required value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})}/></div>
        <div className="field"><label>Ghi chú</label><input value={form.note} onChange={e=>setForm({...form,note:e.target.value})} placeholder="Mô tả khoản chi..."/></div>
        <div className="modal-actions"><button type="button" className="btn" onClick={()=>setShow(false)}>Hủy</button><button className="btn btn-primary" disabled={saving}>{saving?'Đang lưu...':'Lưu khoản chi'}</button></div>
      </form>
    </Modal>}
    <Toast msg={toast}/>
  </>;
}
