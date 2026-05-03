const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({
  origin: ['https://pharmacy-tracker-inky.vercel.app', 'https://*.vercel.app', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Initialize database tables
async function initializeDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS purchases (
        id SERIAL PRIMARY KEY,
        purchase_date DATE NOT NULL,
        supplier_name VARCHAR(255) NOT NULL,
        invoice_number VARCHAR(255) NOT NULL,
        grn_number VARCHAR(255) NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        payment_terms VARCHAR(20) NOT NULL DEFAULT 'cash',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS ibt_transactions (
        id SERIAL PRIMARY KEY,
        date DATE NOT NULL,
        from_branch VARCHAR(255) NOT NULL,
        to_branch VARCHAR(255) NOT NULL,
        description TEXT,
        quantity INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// API Routes

// Get all purchases
app.get('/api/purchases', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM purchases ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching purchases:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add new purchase
app.post('/api/purchases', async (req, res) => {
  try {
    const {
      purchase_date,
      supplier_name,
      invoice_number,
      grn_number,
      total_amount,
      payment_terms
    } = req.body;

    const result = await pool.query(
      `INSERT INTO purchases 
       (purchase_date, supplier_name, invoice_number, grn_number, total_amount, payment_terms)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [purchase_date, supplier_name, invoice_number, grn_number, total_amount, payment_terms]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding purchase:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update purchase
app.put('/api/purchases/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      purchase_date,
      supplier_name,
      invoice_number,
      grn_number,
      total_amount,
      payment_terms
    } = req.body;

    const result = await pool.query(
      `UPDATE purchases 
       SET purchase_date = $1, supplier_name = $2, invoice_number = $3, grn_number = $4, total_amount = $5, payment_terms = $6
       WHERE id = $7
       RETURNING *`,
      [purchase_date, supplier_name, invoice_number, grn_number, total_amount, payment_terms, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Purchase not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating purchase:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete purchase
app.delete('/api/purchases/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM purchases WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Purchase not found' });
    }

    res.json({ message: 'Purchase deleted successfully' });
  } catch (error) {
    console.error('Error deleting purchase:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get IBT transactions
app.get('/api/ibt', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM ibt_transactions ORDER BY date DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching IBT transactions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add IBT transaction
app.post('/api/ibt', async (req, res) => {
  try {
    const { date, from_branch, to_branch, medicine_name, batch_no, quantity, reason } = req.body;

    const result = await pool.query(
      `INSERT INTO ibt_transactions (date, from_branch, to_branch, medicine_name, batch_no, quantity, reason)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [date, from_branch, to_branch, medicine_name, batch_no, quantity, reason]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding IBT transaction:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



// Get unique suppliers for filtering
app.get('/api/suppliers', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT supplier_name 
      FROM purchases 
      ORDER BY supplier_name
    `);
    res.json(result.rows.map(row => row.supplier_name));
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await initializeDatabase();
});

module.exports = app;
