import { useState, useEffect, useCallback } from 'react';
import * as XLSX from 'xlsx';
import {
  getPurchases, getMonths, getSummary,
  createPurchase, updatePurchase, updateReturn, deletePurchase,
} from './api';
import AddPurchaseForm from './components/AddPurchaseForm';
import PurchasesTable from './components/PurchasesTable';
import EditModal from './components/EditModal';
import UpdateReturnModal from './components/UpdateReturnModal';
import SummaryPanel from './components/SummaryPanel';
import { Toast, useToast } from './components/Toast';

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function monthLabel(mk) {
  if (!mk) return '';
  const [y, m] = mk.split('-');
  return MONTH_NAMES[parseInt(m) - 1] + ' ' + y;
}

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB') : '-';
const fmtAED = (n) => 'AED ' + parseFloat(n || 0).toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function App() {
  const [purchases, setPurchases] = useState([]);
  const [months, setMonths] = useState([]);
  const [filterMonth, setFilterMonth] = useState('');
  const [filterSupplier, setFilterSupplier] = useState('');
  const [summary, setSummary] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [returnTarget, setReturnTarget] = useState(null);
  const [loading, setLoading] = useState(false);
  const { toast, showToast } = useToast();

  const loadPurchases = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterMonth) params.month = filterMonth;
      if (filterSupplier) params.supplier = filterSupplier;
      const res = await getPurchases(params);
      setPurchases(res.data);
    } catch {
      showToast('Failed to load records');
    }
    setLoading(false);
  }, [filterMonth, filterSupplier]);

  const loadMonths = useCallback(async () => {
    try {
      const res = await getMonths();
      setMonths(res.data);
    } catch {}
  }, []);

  const loadSummary = useCallback(async () => {
    if (!filterMonth) { setSummary(null); return; }
    try {
      const res = await getSummary(filterMonth);
      setSummary(res.data);
    } catch {}
  }, [filterMonth]);

  useEffect(() => { loadPurchases(); }, [loadPurchases]);
  useEffect(() => { loadMonths(); }, [loadMonths]);
  useEffect(() => { loadSummary(); }, [loadSummary]);

  const handleAdd = async (data) => {
    try {
      await createPurchase(data);
      showToast('Entry added');
      await Promise.all([loadPurchases(), loadMonths()]);
    } catch { showToast('Failed to add entry'); }
  };

  const handleEdit = async (id, data) => {
    try {
      await updatePurchase(id, data);
      setEditTarget(null);
      showToast('Entry updated');
      await loadPurchases();
    } catch { showToast('Failed to update entry'); }
  };

  const handleUpdateReturn = async (id, data) => {
    try {
      await updateReturn(id, data);
      setReturnTarget(null);
      showToast('Return & credit note updated');
      await Promise.all([loadPurchases(), loadSummary()]);
    } catch { showToast('Failed to update return'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this entry?')) return;
    try {
      await deletePurchase(id);
      showToast('Entry deleted');
      await Promise.all([loadPurchases(), loadMonths(), loadSummary()]);
    } catch { showToast('Failed to delete entry'); }
  };

  const handleExport = () => {
    if (!purchases.length) { showToast('No data to export'); return; }
    const rows = purchases.map((p) => ({
      'Date': fmtDate(p.purchase_date),
      'Supplier': p.supplier,
      'Invoice No.': p.invoice_number,
      'GRN No.': p.grn_number || '',
      'Amount (AED)': parseFloat(p.amount),
      'Return Amount (AED)': parseFloat(p.return_amount || 0),
      'Net Due (AED)': parseFloat(p.net_due),
      'Payment Terms (days)': p.payment_terms,
      'Due Date': fmtDate(p.due_date),
      'Credit Note Status': p.cn_status === 'received' ? 'Received' : 'Not Received',
      'Credit Note No.': p.cn_number || '',
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [12,22,14,14,16,18,14,20,12,18,14].map((w) => ({ wch: w }));
    const wb = XLSX.utils.book_new();
    const sheetName = filterMonth ? `Purchases ${monthLabel(filterMonth)}` : 'All Purchases';
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, `Pharmacy_Purchases${filterMonth ? '_' + filterMonth : ''}.xlsx`);
    showToast('Excel file exported');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Header */}
      <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '0 1.5rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '56px' }}>
          <div>
            <span style={{ fontWeight: 700, fontSize: '16px', color: 'var(--text)' }}>Pharmacy</span>
            <span style={{ fontWeight: 400, fontSize: '16px', color: 'var(--text-muted)', marginLeft: '6px' }}>Purchase Tracker</span>
          </div>
          <button className="btn" onClick={handleExport} style={{ fontSize: '13px' }}>
            ↓ Export to Excel
          </button>
        </div>
      </div>

      {/* Main content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem' }}>
        <AddPurchaseForm onAdd={handleAdd} />

        {/* Records card */}
        <div className="card">
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: '1rem' }}>
            <div className="form-group" style={{ minWidth: '160px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '5px' }}>Month</label>
              <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} style={{ width: 'auto', minWidth: '160px' }}>
                <option value="">All months</option>
                {months.map((m) => (
                  <option key={m} value={m}>{monthLabel(m)}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ minWidth: '160px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '5px' }}>Supplier</label>
              <input
                type="text"
                placeholder="Search supplier..."
                value={filterSupplier}
                onChange={(e) => setFilterSupplier(e.target.value)}
                style={{ width: '180px' }}
              />
            </div>
          </div>

          {loading ? (
            <div className="empty-state">Loading...</div>
          ) : (
            <PurchasesTable
              purchases={purchases}
              onEdit={setEditTarget}
              onUpdateReturn={setReturnTarget}
              onDelete={handleDelete}
            />
          )}
        </div>

        <SummaryPanel month={filterMonth} data={summary} />
      </div>

      {editTarget && (
        <EditModal purchase={editTarget} onSave={handleEdit} onClose={() => setEditTarget(null)} />
      )}
      {returnTarget && (
        <UpdateReturnModal purchase={returnTarget} onSave={handleUpdateReturn} onClose={() => setReturnTarget(null)} />
      )}
      <Toast message={toast} />
    </div>
  );
}
