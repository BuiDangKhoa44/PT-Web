import { Link } from 'react-router-dom';
import { Building2, Banknote, Wallet, ClipboardList, BarChart3, Bell, Zap, FileText, Snowflake, Printer, Plus, RefreshCw, CheckCircle2, ChevronDown, Calendar } from 'lucide-react';
import { dashboardApi } from '../api/endpoints.js';
import { useFetch } from '../hooks/useFetch.js';
import { Async, PageHead, Pill, Progress, StatCard } from '../components/ui.jsx';
import { vnd, invoiceStatus } from '../utils/format.js';

const taskIcon = { METER: Zap, CONTRACT: FileText, REPAIR: Snowflake };

export default function Dashboard() {
  const state = useFetch(() => dashboardApi.summary('2024-10'), []);
  return (
    <Async state={state}>
      {(d) => {
        const max = Math.max(...d.chart.map((c) => c.income));
        return (
          <>
            <PageHead eyebrow={<>Trung tâm điều hành <span className="muted">• Cập nhật 5 phút trước</span></>} title="Xin chào Admin">
              <div className="btn"><Calendar size={13} /> Kỳ báo cáo <b>Tháng 10/2024</b> <ChevronDown size={13} /></div>
              <button className="btn" onClick={state.reload} aria-label="Làm mới"><RefreshCw size={14} /></button>
              <Link to="/rooms" className="btn btn-primary"><Plus size={14} /> Thêm phòng mới</Link>
            </PageHead>

            <div className="grid g4">
              <StatCard label="Tổng số phòng" value={d.totalRooms} unit="phòng trọ" icon={Building2}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Lấp đầy: <b className="c-green">75%</b></span><span>{d.rentedRooms}/{d.totalRooms} phòng</span></div>
                <Progress value={(d.rentedRooms / d.totalRooms) * 100} />
                <span>{d.rentedRooms} Đang thuê • {d.vacantRooms} Trống • {d.maintenanceRooms} Bảo trì</span>
              </StatCard>
              <StatCard label="Doanh thu dự kiến" value={vnd(d.expectedRevenue)} unit="đ" icon={Banknote}>
                <Pill cls="green">+{d.revenueGrowth}% so với T9</Pill> <span style={{ marginLeft: 6 }}>Bao gồm điện/nước</span>
              </StatCard>
              <StatCard label="Tiền trọ đã thu" value={vnd(d.collected)} unit="đ" icon={Wallet} valueClass="c-green">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Tiến độ thu nợ: <b>70.0%</b></span><b className="c-green">{d.paidInvoices}/{d.totalInvoices} phòng</b></div>
                <Progress value={70} />
              </StatCard>
              <StatCard label="Còn nợ / Chưa nộp" value={vnd(d.outstanding)} unit="đ" icon={ClipboardList} valueClass="c-red">
                <Pill cls="red">{d.unpaidRooms} phòng chưa nộp</Pill> <button className="btn btn-sm" style={{ marginLeft: 6 }}>Gửi nhắc nợ</button>
              </StatCard>
            </div>

            <div className="grid g-main" style={{ marginTop: 14 }}>
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div><div className="card-title"><BarChart3 size={15} /> Biểu đồ Thu & Chi 6 tháng</div><div className="card-sub">Theo dõi dòng tiền phòng trọ từ Tháng 5 đến Tháng 10</div></div>
                  <div className="legend"><span><i style={{ background: '#4de0a4' }} />Tổng thu</span><span><i style={{ background: '#ff5252' }} />Chi phí bảo trì</span></div>
                </div>
                <div className="bars">
                  {d.chart.map((c) => (
                    <div className="bar-col" key={c.label}>
                      <div className="bar-pair">
                        <div className="bar green" style={{ height: `${(c.income / max) * 100}%` }} />
                        <div className="bar red" style={{ height: `${(c.expense / max) * 100}%` }} />
                      </div>
                      <span className={`bar-label ${c.current ? 'now' : ''}`}>{c.label}{c.current && ' •'}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--muted)', marginTop: 10 }}>
                  <span>Trung bình thu hàng tháng: <b style={{ color: 'var(--text)' }}>{vnd(d.avgMonthlyIncome)} đ</b></span>
                  <span className="c-green"><CheckCircle2 size={12} /> Biên lợi nhuận ròng: {d.netMargin}%</span>
                </div>
              </div>

              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div className="card-title"><Bell size={15} className="c-red" /> Việc cần xử lý ngay</div>
                  <Pill cls="red">{d.tasks.length * 2} tác vụ</Pill>
                </div>
                {d.tasks.map((t) => {
                  const Icon = taskIcon[t.type] || Zap;
                  return (
                    <div className="task" key={t.id}>
                      <div className={`t-ico ${t.type === 'CONTRACT' ? 'blue' : ''}`}><Icon size={15} /></div>
                      <div className="t-body"><b>{t.title}</b><small>{t.detail}</small></div>
                      <Link to={t.to} className={`btn btn-sm ${t.type === 'REPAIR' ? 'btn-primary' : ''}`}>{t.action}</Link>
                    </div>
                  );
                })}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--muted)', marginTop: 14 }}>
                  <span><CheckCircle2 size={12} className="c-green" /> Hệ thống gửi tin nhắn tự động: Đang bật</span><b style={{ color: 'var(--accent)' }}>Xem tất cả</b>
                </div>
              </div>
            </div>

            <div className="card" style={{ marginTop: 14, padding: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: 16 }}>
                <div className="card-title"><FileText size={15} /> Thanh toán phòng trọ gần nhất</div>
                <div className="c-muted" style={{ fontSize: 11 }}>Hiển thị 4 giao dịch mới nhất <Link to="/invoices" className="btn btn-sm" style={{ marginLeft: 8 }}>Xem sổ thu chi</Link></div>
              </div>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Mã phòng</th><th>Khách thuê</th><th>Kỳ thu</th><th>Số tiền (VNĐ)</th><th>Phương thức</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
                  <tbody>
                    {d.recentPayments.map((p) => (
                      <tr key={p.id}>
                        <td><span className="tag">{p.roomCode}</span></td>
                        <td><div className="name">{p.tenantName}</div><div className="sub">{p.phone}</div></td>
                        <td>{p.period}</td>
                        <td className="c-green" style={{ fontWeight: 700 }}>{vnd(p.amount)} đ</td>
                        <td>{p.method}</td>
                        <td><Pill cls={p.status === 'PAID' ? 'green' : 'yellow'}>{p.status === 'PAID' ? 'Đã thanh toán' : 'Chờ duyệt'}</Pill></td>
                        <td>{p.status === 'PAID' ? <button className="icon-btn" style={{ background: 'none' }}><Printer size={14} /></button> : <button className="btn btn-primary btn-sm">Xác nhận</button>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        );
      }}
    </Async>
  );
}
