const fmtAED = (n) =>
  'AED ' + parseFloat(n || 0).toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function monthLabel(mk) {
  if (!mk) return '';
  const [y, m] = mk.split('-');
  return MONTH_NAMES[parseInt(m) - 1] + ' ' + y;
}

export default function SummaryPanel({ month, data }) {
  if (!month || !data) return null;
  const { summary, by_supplier } = data;

  return (
    <div className="card" style={{ marginTop: '1rem' }}>
      <div className="section-label">Summary — {monthLabel(month)}</div>
      <div className="metric-grid">
        <div className="metric">
          <div className="metric-label">Total Invoiced</div>
          <div className="metric-value">{fmtAED(summary.total_invoiced)}</div>
        </div>
        <div className="metric">
          <div className="metric-label">Total Returned</div>
          <div className="metric-value">{fmtAED(summary.total_returned)}</div>
        </div>
        <div className="metric">
          <div className="metric-label">Net Payable</div>
          <div className="metric-value" style={{ color: 'var(--primary)' }}>{fmtAED(summary.net_payable)}</div>
        </div>
        <div className="metric">
          <div className="metric-label">Invoices</div>
          <div className="metric-value">{summary.invoice_count}</div>
        </div>
      </div>

      <div className="section-label" style={{ marginTop: '0.5rem' }}>Payable by Supplier</div>
      {by_supplier.map((s) => (
        <div
          key={s.supplier}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '9px 0',
            borderBottom: '1px solid var(--border)',
            fontSize: '13px',
          }}
        >
          <div>
            <span style={{ fontWeight: 500 }}>{s.supplier}</span>
            {parseFloat(s.total_returned) > 0 && (
              <span style={{ marginLeft: '8px', fontSize: '11px', color: 'var(--text-muted)' }}>
                ({fmtAED(s.total_invoiced)} − {fmtAED(s.total_returned)} return)
              </span>
            )}
          </div>
          <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{fmtAED(s.net_payable)}</span>
        </div>
      ))}
    </div>
  );
}
