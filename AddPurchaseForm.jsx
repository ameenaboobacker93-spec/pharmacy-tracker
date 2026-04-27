import { useState } from 'react';

const EMPTY = {
  purchase_date: '',
  supplier: '',
  invoice_number: '',
  grn_number: '',
  amount: '',
  payment_terms: '60',
};

export default function AddPurchaseForm({ onAdd }) {
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.purchase_date || !form.supplier || !form.invoice_number || !form.amount) {
      alert('Please fill in Date, Supplier, Invoice Number, and Amount.');
      return;
    }
    setLoading(true);
    await onAdd({ ...form, amount: parseFloat(form.amount), payment_terms: parseInt(form.payment_terms) });
    setForm(EMPTY);
    setLoading(false);
  };

  return (
    <div className="card" style={{ marginBottom: '1rem' }}>
      <div className="section-label">Add New Purchase</div>
      <div className="form-grid">
        <div className="form-group">
          <label>Date *</label>
          <input type="date" value={form.purchase_date} onChange={(e) => set('purchase_date', e.target.value)} />
        </div>
        <div className="form-group">
          <label>Supplier *</label>
          <input type="text" placeholder="e.g. Neogyl Pharma" value={form.supplier} onChange={(e) => set('supplier', e.target.value)} />
        </div>
        <div className="form-group">
          <label>Invoice Number *</label>
          <input type="text" placeholder="INV-001" value={form.invoice_number} onChange={(e) => set('invoice_number', e.target.value)} />
        </div>
        <div className="form-group">
          <label>GRN Number</label>
          <input type="text" placeholder="GRN-001" value={form.grn_number} onChange={(e) => set('grn_number', e.target.value)} />
        </div>
        <div className="form-group">
          <label>Amount (AED) *</label>
          <input type="number" placeholder="0.00" min="0" step="0.01" value={form.amount} onChange={(e) => set('amount', e.target.value)} />
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
      <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Adding...' : '+ Add Entry'}
        </button>
        <span style={{ fontSize: '12px', color: 'var(--text-hint)' }}>
          Return amount &amp; credit note can be updated later on each entry
        </span>
      </div>
    </div>
  );
}
