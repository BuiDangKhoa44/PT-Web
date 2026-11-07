import { AlertTriangle } from 'lucide-react';

export function StatCard({ label, value, unit, icon: Icon, children, valueClass = '' }) {
  return (
    <div className="card stat">
      <div className="label">{label}</div>
      <div className={`value ${valueClass}`}>{value}{unit && <small>{unit}</small>}</div>
      {Icon && <div className="ico"><Icon size={16} /></div>}
      {children && <div className="foot">{children}</div>}
    </div>
  );
}

export function Pill({ cls = 'gray', children }) {
  return <span className={`pill ${cls}`}>{children}</span>;
}

export function Progress({ value, tone = '' }) {
  return <div className={`progress ${tone}`}><i style={{ width: `${Math.min(100, value)}%` }} /></div>;
}

export function Loading() {
  return <div className="loading"><div className="spinner" />Đang tải dữ liệu...</div>;
}

export function ErrorBox({ error, onRetry }) {
  return (
    <div className="empty">
      <AlertTriangle size={22} className="c-red" />
      <p style={{ margin: '8px 0' }}>{error?.message || 'Có lỗi xảy ra'}</p>
      {onRetry && <button className="btn btn-sm" onClick={onRetry}>Thử lại</button>}
    </div>
  );
}

// Dùng cho trang cần data: <Async state={useFetch(...)}>{(data)=>...}</Async>
export function Async({ state, children }) {
  if (state.loading && !state.data) return <Loading />;
  if (state.error) return <ErrorBox error={state.error} onRetry={state.reload} />;
  return children(state.data);
}

export function PageHead({ eyebrow, title, desc, children }) {
  return (
    <div className="page-head">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        {desc && <p>{desc}</p>}
      </div>
      <div className="head-actions">{children}</div>
    </div>
  );
}

export function Toast({ msg }) {
  return msg ? <div className="toast">{msg}</div> : null;
}


export function Modal({ title, onClose, children, wide = false }) {
  return (
    <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose?.(); }}>
      <section className={`modal ${wide ? 'modal-wide' : ''}`} role="dialog" aria-modal="true">
        <div className="modal-head"><h2>{title}</h2><button className="btn btn-sm" type="button" onClick={onClose}>Đóng ✕</button></div>
        {children}
      </section>
    </div>
  );
}
