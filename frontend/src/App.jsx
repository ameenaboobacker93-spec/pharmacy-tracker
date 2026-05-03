import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import './index.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

function App() {
  const [activeTab, setActiveTab] = useState('purchases');
  const [purchases, setPurchases] = useState([]);
  const [ibtData, setIbtData] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    purchase_date: '',
    supplier_name: '',
    invoice_number: '',
    grn_number: '',
    total_amount: '',
    payment_terms: 'cash'
  });
  
  // Filter states
  const [filters, setFilters] = useState({
    supplier: '',
    payment_terms: '',
    date_from: '',
    date_to: ''
  });

  useEffect(() => {
    fetchPurchases();
    fetchIBTData();
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
        purchase_date: '',
        supplier_name: '',
        invoice_number: '',
        grn_number: '',
        total_amount: '',
        payment_terms: 'cash'
      });
      fetchPurchases();
    } catch (error) {
      console.error('Error adding purchase:', error);
    }
  };

  const handleEdit = (purchase) => {
    setEditingPurchase(purchase);
    setFormData({
      purchase_date: purchase.purchase_date,
      supplier_name: purchase.supplier_name,
      invoice_number: purchase.invoice_number,
      grn_number: purchase.grn_number,
      total_amount: purchase.total_amount,
      payment_terms: purchase.payment_terms
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
        purchase_date: '',
        supplier_name: '',
        invoice_number: '',
        grn_number: '',
        total_amount: '',
        payment_terms: 'cash'
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

  
  const exportToExcel = () => {
    const data = activeTab === 'purchases' ? purchases : ibtData;
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, activeTab === 'purchases' ? 'Purchases' : 'IBT');
    XLSX.writeFile(workbook, `${activeTab === 'purchases' ? 'Purchase Ledger' : 'IBT Register'}.xlsx`);
  };

  const filteredPurchases = purchases.filter(purchase => {
    return (
      (!filters.supplier || purchase.supplier_name.toLowerCase().includes(filters.supplier.toLowerCase())) &&
      (!filters.payment_terms || purchase.payment_terms === filters.payment_terms) &&
      (!filters.date_from || purchase.purchase_date >= filters.date_from) &&
      (!filters.date_to || purchase.purchase_date <= filters.date_to)
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
              <label>Supplier</label>
              <select name="supplier" value={filters.supplier} onChange={handleFilterChange}>
                <option value="">All Suppliers</option>
                {suppliers.map(supplier => (
                  <option key={supplier} value={supplier}>{supplier}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Payment Terms</label>
              <select name="payment_terms" value={filters.payment_terms} onChange={handleFilterChange}>
                <option value="">All Terms</option>
                <option value="cash">Cash</option>
                <option value="30">30 Days</option>
                <option value="60">60 Days</option>
                <option value="90">90 Days</option>
              </select>
            </div>
            <div className="form-group">
              <label>Date From</label>
              <input 
                type="date" 
                name="date_from" 
                value={filters.date_from} 
                onChange={handleFilterChange}
              />
            </div>
            <div className="form-group">
              <label>Date To</label>
              <input 
                type="date" 
                name="date_to" 
                value={filters.date_to} 
                onChange={handleFilterChange}
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
                  <th>Date</th>
                  <th>Supplier</th>
                  <th>Invoice Number</th>
                  <th>GRN Number</th>
                  <th>Total Amount</th>
                  <th>Payment Terms</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPurchases.map(purchase => (
                  <tr key={purchase.id}>
                    <td>{purchase.purchase_date}</td>
                    <td>{purchase.supplier_name}</td>
                    <td>{purchase.invoice_number}</td>
                    <td>{purchase.grn_number}</td>
                    <td>{purchase.total_amount}</td>
                    <td>{purchase.payment_terms === 'cash' ? 'Cash' : `${purchase.payment_terms} Days`}</td>
                    <td>
                      <button className="btn btn-primary" onClick={() => handleEdit(purchase)}>
                        Edit
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
                <label>Purchase Date</label>
                <input type="date" name="purchase_date" value={formData.purchase_date} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Supplier Name</label>
                <input type="text" name="supplier_name" value={formData.supplier_name} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Invoice Number</label>
                <input type="text" name="invoice_number" value={formData.invoice_number} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>GRN Number</label>
                <input type="text" name="grn_number" value={formData.grn_number} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Total Amount</label>
                <input type="number" step="0.01" name="total_amount" value={formData.total_amount} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Payment Terms</label>
                <select name="payment_terms" value={formData.payment_terms} onChange={handleInputChange} required>
                  <option value="cash">Cash</option>
                  <option value="30">30 Days</option>
                  <option value="60">60 Days</option>
                  <option value="90">90 Days</option>
                </select>
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
                <label>Purchase Date</label>
                <input type="date" name="purchase_date" value={formData.purchase_date} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Supplier Name</label>
                <input type="text" name="supplier_name" value={formData.supplier_name} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Invoice Number</label>
                <input type="text" name="invoice_number" value={formData.invoice_number} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>GRN Number</label>
                <input type="text" name="grn_number" value={formData.grn_number} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Total Amount</label>
                <input type="number" step="0.01" name="total_amount" value={formData.total_amount} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Payment Terms</label>
                <select name="payment_terms" value={formData.payment_terms} onChange={handleInputChange} required>
                  <option value="cash">Cash</option>
                  <option value="30">30 Days</option>
                  <option value="60">60 Days</option>
                  <option value="90">90 Days</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary">Update Purchase</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
