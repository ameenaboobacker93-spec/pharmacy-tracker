import { useState, useEffect } from 'react';

export default function EditModal({ purchase, onSave, onClose }) {
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (purchase) {
      setForm({
        purchase_date: purchase.purchase_date?.slice(0, 10) || '',
        supplier: purchase.supplier || '',
        invoice_number: purchase.invoice_number || '',
        grn_number: purchase.grn_number || '',
        amount: purchase.amount || '',
        payment_terms: String(purchase.payment_terms || 60),
      });
    }
  }, [purchase]);

  if (!purchase) return null;

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setLoading(true);
    await onSave(purchase.id, { ...form, amount: parseFloat(form.amount), payment_terms: parseInt(form.payment_terms) });
    setLoading(false);
  };

  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">Edit Purchase Entry</div>
        <div className="modal-info">
          {purchase.supplier} — Invoice {purchase.invoice_number}
        </div>
        <div className="form-grid">
          <div className="form-group">
            <label>Date</label>
            <input type="date" value={form.purchase_date} onChange={(e) => set('purchase_date', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Supplier</label>
            <input type="text" value={form.supplier} onChange={(e) => set('supplier', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Invoice Number</label>
            <input type="text" value={form.invoice_number} onChange={(e) => set('invoice_number', e.target.value)} />
          </div>
          <div className="form-group">
            <label>GRN Number</label>
            <input type="text" value={form.grn_number} onChange={(e) => set('grn_number', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Amount (AED)</label>
            <input type="number" min="0" step="0.01" value={form.amount} onChange={(e) => set('amount', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Payment Terms</label>
            <select value={form.payment_terms} onChange={(e) => set('payment_terms', e.target.value)}>
              <option value="0">Cash (Immediate)</option>
              <option value="60">60 days</option>
              <option value="90">90 days</option>
              <option value="120">120 days</option>
            </select>
          </div>
        </div>
        <div className="modal-actions">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
