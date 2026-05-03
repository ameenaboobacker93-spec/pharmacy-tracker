import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import './index.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

function App() {
  const [activeTab, setActiveTab] = useState('purchases');
  const [purchases, setPurchases] = useState([]);
  const [ibtData, setIbtData] = useState([]);
  const [months, setMonths] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState(null);
  const [returningPurchase, setReturningPurchase] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    supplier_name: '',
    invoice_no: '',
    invoice_date: '',
    medicine_name: '',
    batch_no: '',
    expiry_date: '',
    quantity: '',
    free_quantity: '',
    mrp: '',
    purchase_rate: '',
    gst: '',
    total_amount: ''
  });
  
  // Filter states
  const [filters, setFilters] = useState({
    month: '',
    supplier: '',
    medicine: ''
  });

  useEffect(() => {
    fetchPurchases();
    fetchIBTData();
    fetchMonths();
    fetchSuppliers();
  }, []);

  const fetchPurchases = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/purchases`);
      setPurchases(response.data);
    } catch (error) {
      console.error('Error fetching purchases:', error);
    }
  };

  const fetchIBTData = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/ibt`);
      setIbtData(response.data);
    } catch (error) {
      console.error('Error fetching IBT data:', error);
    }
  };

  const fetchMonths = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/months`);
      setMonths(response.data);
    } catch (error) {
      console.error('Error fetching months:', error);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/suppliers`);
      setSuppliers(response.data);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/purchases`, formData);
      setShowAddModal(false);
      setFormData({
        supplier_name: '',
        invoice_no: '',
        invoice_date: '',
        medicine_name: '',
        batch_no: '',
        expiry_date: '',
        quantity: '',
        free_quantity: '',
        mrp: '',
        purchase_rate: '',
        gst: '',
        total_amount: ''
      });
      fetchPurchases();
    } catch (error) {
      console.error('Error adding purchase:', error);
    }
  };

  const handleEdit = (purchase) => {
    setEditingPurchase(purchase);
    setFormData({
      supplier_name: purchase.supplier_name,
      invoice_no: purchase.invoice_no,
      invoice_date: purchase.invoice_date,
      medicine_name: purchase.medicine_name,
      batch_no: purchase.batch_no,
      expiry_date: purchase.expiry_date,
      quantity: purchase.quantity,
      free_quantity: purchase.free_quantity,
      mrp: purchase.mrp,
      purchase_rate: purchase.purchase_rate,
      gst: purchase.gst,
      total_amount: purchase.total_amount
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/api/purchases/${editingPurchase.id}`, formData);
      setShowEditModal(false);
      setEditingPurchase(null);
      setFormData({
        supplier_name: '',
        invoice_no: '',
        invoice_date: '',
        medicine_name: '',
        batch_no: '',
        expiry_date: '',
        quantity: '',
        free_quantity: '',
        mrp: '',
        purchase_rate: '',
        gst: '',
        total_amount: ''
      });
      fetchPurchases();
    } catch (error) {
      console.error('Error updating purchase:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this purchase?')) {
      try {
        await axios.delete(`${API_URL}/api/purchases/${id}`);
        fetchPurchases();
      } catch (error) {
        console.error('Error deleting purchase:', error);
      }
    }
  };

  const handleReturn = (purchase) => {
    setReturningPurchase(purchase);
    setShowReturnModal(true);
  };

  const processReturn = async (returnData) => {
    try {
      await axios.post(`${API_URL}/api/returns`, {
        purchase_id: returningPurchase.id,
        ...returnData
      });
      setShowReturnModal(false);
      setReturningPurchase(null);
      fetchPurchases();
      fetchIBTData();
    } catch (error) {
      console.error('Error processing return:', error);
    }
  };

  const exportToExcel = () => {
    const data = activeTab === 'purchases' ? purchases : ibtData;
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, activeTab === 'purchases' ? 'Purchases' : 'IBT');
    XLSX.writeFile(workbook, `${activeTab === 'purchases' ? 'Purchase Ledger' : 'IBT Register'}.xlsx`);
  };

  const filteredPurchases = purchases.filter(purchase => {
    return (
      (!filters.month || purchase.invoice_date.includes(filters.month)) &&
      (!filters.supplier || purchase.supplier_name.toLowerCase().includes(filters.supplier.toLowerCase())) &&
      (!filters.medicine || purchase.medicine_name.toLowerCase().includes(filters.medicine.toLowerCase()))
    );
  });

  return (
    <div className="container">
      <h1>Pharmacy Tracker</h1>
      
      <div className="tabs">
        <button 
          className={`tab-button ${activeTab === 'purchases' ? 'active' : ''}`}
          onClick={() => setActiveTab('purchases')}
        >
          Purchase Ledger
        </button>
        <button 
          className={`tab-button ${activeTab === 'ibt' ? 'active' : ''}`}
          onClick={() => setActiveTab('ibt')}
        >
          IBT Register
        </button>
      </div>

      {activeTab === 'purchases' && (
        <>
          <div className="filter-container">
            <div className="form-group">
              <label>Month</label>
              <select name="month" value={filters.month} onChange={handleFilterChange}>
                <option value="">All Months</option>
                {months.map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Supplier</label>
              <select name="supplier" value={filters.supplier} onChange={handleFilterChange}>
                <option value="">All Suppliers</option>
                {suppliers.map(supplier => (
                  <option key={supplier} value={supplier}>{supplier}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Medicine</label>
              <input 
                type="text" 
                name="medicine" 
                value={filters.medicine} 
                onChange={handleFilterChange}
                placeholder="Search medicine..."
              />
            </div>
          </div>

          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            Add Purchase
          </button>
          
          <button className="export-btn" onClick={exportToExcel}>
            Export to Excel
          </button>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Supplier</th>
                  <th>Invoice No</th>
                  <th>Invoice Date</th>
                  <th>Medicine</th>
                  <th>Batch No</th>
                  <th>Expiry Date</th>
                  <th>Quantity</th>
                  <th>Free Qty</th>
                  <th>MRP</th>
                  <th>Purchase Rate</th>
                  <th>GST</th>
                  <th>Total Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPurchases.map(purchase => (
                  <tr key={purchase.id}>
                    <td>{purchase.supplier_name}</td>
                    <td>{purchase.invoice_no}</td>
                    <td>{purchase.invoice_date}</td>
                    <td>{purchase.medicine_name}</td>
                    <td>{purchase.batch_no}</td>
                    <td>{purchase.expiry_date}</td>
                    <td>{purchase.quantity}</td>
                    <td>{purchase.free_quantity}</td>
                    <td>{purchase.mrp}</td>
                    <td>{purchase.purchase_rate}</td>
                    <td>{purchase.gst}%</td>
                    <td>{purchase.total_amount}</td>
                    <td>
                      <button className="btn btn-primary" onClick={() => handleEdit(purchase)}>
                        Edit
                      </button>
                      <button className="btn btn-success" onClick={() => handleReturn(purchase)}>
                        Return
                      </button>
                      <button className="btn btn-danger" onClick={() => handleDelete(purchase.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {activeTab === 'ibt' && (
        <>
          <button className="export-btn" onClick={exportToExcel}>
            Export IBT to Excel
          </button>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>From Branch</th>
                  <th>To Branch</th>
                  <th>Medicine</th>
                  <th>Batch No</th>
                  <th>Quantity</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {ibtData.map(ibt => (
                  <tr key={ibt.id}>
                    <td>{ibt.date}</td>
                    <td>{ibt.from_branch}</td>
                    <td>{ibt.to_branch}</td>
                    <td>{ibt.medicine_name}</td>
                    <td>{ibt.batch_no}</td>
                    <td>{ibt.quantity}</td>
                    <td>{ibt.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Add Purchase Modal */}
      {showAddModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Add Purchase</h2>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Supplier Name</label>
                <input type="text" name="supplier_name" value={formData.supplier_name} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Invoice No</label>
                <input type="text" name="invoice_no" value={formData.invoice_no} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Invoice Date</label>
                <input type="date" name="invoice_date" value={formData.invoice_date} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Medicine Name</label>
                <input type="text" name="medicine_name" value={formData.medicine_name} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Batch No</label>
                <input type="text" name="batch_no" value={formData.batch_no} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Expiry Date</label>
                <input type="date" name="expiry_date" value={formData.expiry_date} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Quantity</label>
                <input type="number" name="quantity" value={formData.quantity} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Free Quantity</label>
                <input type="number" name="free_quantity" value={formData.free_quantity} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>MRP</label>
                <input type="number" step="0.01" name="mrp" value={formData.mrp} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Purchase Rate</label>
                <input type="number" step="0.01" name="purchase_rate" value={formData.purchase_rate} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>GST (%)</label>
                <input type="number" step="0.01" name="gst" value={formData.gst} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Total Amount</label>
                <input type="number" step="0.01" name="total_amount" value={formData.total_amount} onChange={handleInputChange} required />
              </div>
              <button type="submit" className="btn btn-primary">Add Purchase</button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Purchase Modal */}
      {showEditModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Edit Purchase</h2>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <form onSubmit={handleUpdate}>
              <div className="form-group">
                <label>Supplier Name</label>
                <input type="text" name="supplier_name" value={formData.supplier_name} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Invoice No</label>
                <input type="text" name="invoice_no" value={formData.invoice_no} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Invoice Date</label>
                <input type="date" name="invoice_date" value={formData.invoice_date} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Medicine Name</label>
                <input type="text" name="medicine_name" value={formData.medicine_name} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Batch No</label>
                <input type="text" name="batch_no" value={formData.batch_no} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Expiry Date</label>
                <input type="date" name="expiry_date" value={formData.expiry_date} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Quantity</label>
                <input type="number" name="quantity" value={formData.quantity} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Free Quantity</label>
                <input type="number" name="free_quantity" value={formData.free_quantity} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>MRP</label>
                <input type="number" step="0.01" name="mrp" value={formData.mrp} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Purchase Rate</label>
                <input type="number" step="0.01" name="purchase_rate" value={formData.purchase_rate} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>GST (%)</label>
                <input type="number" step="0.01" name="gst" value={formData.gst} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Total Amount</label>
                <input type="number" step="0.01" name="total_amount" value={formData.total_amount} onChange={handleInputChange} required />
              </div>
              <button type="submit" className="btn btn-primary">Update Purchase</button>
            </form>
          </div>
        </div>
      )}

      {/* Return Modal */}
      {showReturnModal && returningPurchase && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Process Return</h2>
              <button className="close-btn" onClick={() => setShowReturnModal(false)}>×</button>
            </div>
            <p>Medicine: {returningPurchase.medicine_name}</p>
            <p>Available Quantity: {returningPurchase.quantity}</p>
            <form onSubmit={(e) => {
              e.preventDefault();
              const returnData = {
                return_quantity: e.target.return_quantity.value,
                return_reason: e.target.return_reason.value,
                return_date: e.target.return_date.value
              };
              processReturn(returnData);
            }}>
              <div className="form-group">
                <label>Return Quantity</label>
                <input type="number" name="return_quantity" max={returningPurchase.quantity} required />
              </div>
              <div className="form-group">
                <label>Return Reason</label>
                <select name="return_reason" required>
                  <option value="">Select Reason</option>
                  <option value="expired">Expired</option>
                  <option value="damaged">Damaged</option>
                  <option value="wrong_supply">Wrong Supply</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Return Date</label>
                <input type="date" name="return_date" required />
              </div>
              <button type="submit" className="btn btn-success">Process Return</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
