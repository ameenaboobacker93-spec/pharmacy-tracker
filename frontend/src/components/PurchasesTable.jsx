const fmtAED = (n) =>
  'AED ' + parseFloat(n || 0).toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtDate = (d) => {
  if (!d) return '-';
  const dt = new Date(d);
  return dt.toLocaleDateString('en-GB');
};

function CnBadge({ status, number, hasReturn }) {
  if (status === 'received') {
    return (
      <div>
        <span className="badge badge-success">Received</span>
        {number && <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{number}</div>}
      </div>
    );
  }
  if (hasReturn) return <span className="badge badge-warning">Pending CN</span>;
  return <span className="badge badge-danger">Not Received</span>;
}

export default function PurchasesTable({ purchases, onEdit, onUpdateReturn, onDelete }) {
  if (!purchases.length) {
    return <div className="empty-state">No entries found. Add your first purchase above.</div>;
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Supplier</th>
            <th>Invoice</th>
            <th>GRN</th>
            <th>Amount</th>
            <th>Returned</th>
            <th>Net Due</th>
            <th>Terms</th>
            <th>Due Date</th>
            <th>Credit Note</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {purchases.map((p) => (
            <tr key={p.id}>
              <td>{fmtDate(p.purchase_date)}</td>
              <td style={{ fontWeight: 500 }}>{p.supplier}</td>
              <td>{p.invoice_number}</td>
              <td>{p.grn_number || '-'}</td>
              <td>{fmtAED(p.amount)}</td>
              <td style={{ color: parseFloat(p.return_amount) > 0 ? 'var(--danger)' : 'var(--text-hint)' }}>
                {parseFloat(p.return_amount) > 0 ? `-${fmtAED(p.return_amount)}` : '-'}
              </td>
              <td style={{ fontWeight: 600 }}>{fmtAED(p.net_due)}</td>
              <td>{p.payment_terms}d</td>
              <td>{fmtDate(p.due_date)}</td>
              <td>
                <CnBadge
                  status={p.cn_status}
                  number={p.cn_number}
                  hasReturn={parseFloat(p.return_amount) > 0}
                />
              </td>
              <td style={{ whiteSpace: 'nowrap' }}>
                <div style={{ display: 'flex', gap: '5px' }}>
                  <button
                    className="btn btn-sm"
                    style={{ color: 'var(--primary)', borderColor: 'var(--primary)' }}
                    onClick={() => onUpdateReturn(p)}
                  >
                    Update Return
                  </button>
                  <button className="btn btn-sm" onClick={() => onEdit(p)}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={() => onDelete(p.id)}>Del</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
