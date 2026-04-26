import { useState, useEffect } from 'react';

export default function UpdateReturnModal({ purchase, onSave, onClose }) {
  const [returnAmount, setReturnAmount] = useState('');
  const [cnStatus, setCnStatus] = useState('not_received');
  const [cnNumber, setCnNumber] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (purchase) {
      setReturnAmount(purchase.return_amount > 0 ? purchase.return_amount : '');
      setCnStatus(purchase.cn_status || 'not_received');
      setCnNumber(purchase.cn_number || '');
    }
  }, [purchase]);

  if (!purchase) return null;

  const handleSave = async () => {
    const ret = parseFloat(returnAmount || 0);
    if (ret > parseFloat(purchase.amount)) {
      alert('Return amount cannot exceed the invoice amount.');
      return;
    }
    setLoading(true);
    await onSave(purchase.id, {
      return_amount: ret,
      cn_status: cnStatus,
      cn_number: cnStatus === 'received' ? cnNumber : '',
    });
    setLoading(false);
  };

  const fmtAED = (n) =>
    'AED ' + parseFloat(n || 0).toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">Update Return &amp; Credit Note</div>
        <div className="modal-info">
          <strong>{purchase.supplier}</strong> &nbsp;|&nbsp; Invoice: {purchase.invoice_number}
          <br />
          Invoice Amount: {fmtAED(purchase.amount)}
          {parseFloat(purchase.return_amount) > 0 && (
            <> &nbsp;|&nbsp; Previous Return: {fmtAED(purchase.return_amount)}</>
          )}
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label>Return Amount (AED)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={returnAmount}
              onChange={(e) => setReturnAmount(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Credit Note Status</label>
            <select value={cnStatus} onChange={(e) => setCnStatus(e.target.value)}>
              <option value="not_received">Not Received</option>
              <option value="received">Received</option>
            </select>
          </div>
        </div>

        {cnStatus === 'received' && (
          <div className="form-group" style={{ marginTop: '12px' }}>
            <label>Credit Note Number</label>
            <input
              type="text"
              placeholder="CN-001"
              value={cnNumber}
              onChange={(e) => setCnNumber(e.target.value)}
            />
          </div>
        )}

        <div style={{ marginTop: '1rem', padding: '10px 12px', background: 'var(--bg)', borderRadius: 'var(--radius-sm)', fontSize: '13px', color: 'var(--text-muted)' }}>
          Net due after return:{' '}
          <strong style={{ color: 'var(--text)' }}>
            {fmtAED(parseFloat(purchase.amount) - parseFloat(returnAmount || 0))}
          </strong>
        </div>

        <div className="modal-actions">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save Update'}
          </button>
        </div>
      </div>
    </div>
  );
}
