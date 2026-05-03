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
        supplier_name VARCHAR(255) NOT NULL,
        invoice_no VARCHAR(255) NOT NULL,
        invoice_date DATE NOT NULL,
        medicine_name VARCHAR(255) NOT NULL,
        batch_no VARCHAR(255) NOT NULL,
        expiry_date DATE NOT NULL,
        quantity INTEGER NOT NULL,
        free_quantity INTEGER DEFAULT 0,
        mrp DECIMAL(10,2) NOT NULL,
        purchase_rate DECIMAL(10,2) NOT NULL,
        gst DECIMAL(5,2) DEFAULT 0,
        total_amount DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS ibt_transactions (
        id SERIAL PRIMARY KEY,
        date DATE NOT NULL,
        from_branch VARCHAR(255) NOT NULL,
        to_branch VARCHAR(255) NOT NULL,
        medicine_name VARCHAR(255) NOT NULL,
        batch_no VARCHAR(255) NOT NULL,
        quantity INTEGER NOT NULL,
        reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS returns (
        id SERIAL PRIMARY KEY,
        purchase_id INTEGER REFERENCES purchases(id),
        return_quantity INTEGER NOT NULL,
        return_reason VARCHAR(255) NOT NULL,
        return_date DATE NOT NULL,
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
      supplier_name,
      invoice_no,
      invoice_date,
      medicine_name,
      batch_no,
      expiry_date,
      quantity,
      free_quantity,
      mrp,
      purchase_rate,
      gst,
      total_amount
    } = req.body;

    const result = await pool.query(
      `INSERT INTO purchases 
       (supplier_name, invoice_no, invoice_date, medicine_name, batch_no, expiry_date, quantity, free_quantity, mrp, purchase_rate, gst, total_amount)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [supplier_name, invoice_no, invoice_date, medicine_name, batch_no, expiry_date, quantity, free_quantity, mrp, purchase_rate, gst, total_amount]
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
      supplier_name,
      invoice_no,
      invoice_date,
      medicine_name,
      batch_no,
      expiry_date,
      quantity,
      free_quantity,
      mrp,
      purchase_rate,
      gst,
      total_amount
    } = req.body;

    const result = await pool.query(
      `UPDATE purchases 
       SET supplier_name = $1, invoice_no = $2, invoice_date = $3, medicine_name = $4, batch_no = $5, expiry_date = $6,
           quantity = $7, free_quantity = $8, mrp = $9, purchase_rate = $10, gst = $11, total_amount = $12
       WHERE id = $13
       RETURNING *`,
      [supplier_name, invoice_no, invoice_date, medicine_name, batch_no, expiry_date, quantity, free_quantity, mrp, purchase_rate, gst, total_amount, id]
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

// Process return
app.post('/api/returns', async (req, res) => {
  try {
    const { purchase_id, return_quantity, return_reason, return_date } = req.body;

    // Start transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Add return record
      const returnResult = await client.query(
        `INSERT INTO returns (purchase_id, return_quantity, return_reason, return_date)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [purchase_id, return_quantity, return_reason, return_date]
      );

      // Update purchase quantity
      await client.query(
        `UPDATE purchases 
         SET quantity = quantity - $1
         WHERE id = $2`,
        [return_quantity, purchase_id]
      );

      // Add IBT transaction for the return
      const purchase = await client.query('SELECT medicine_name, batch_no FROM purchases WHERE id = $1', [purchase_id]);
      if (purchase.rows.length > 0) {
        await client.query(
          `INSERT INTO ibt_transactions (date, from_branch, to_branch, medicine_name, batch_no, quantity, reason)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [return_date, 'Main Store', 'Returns', purchase.rows[0].medicine_name, purchase.rows[0].batch_no, return_quantity, return_reason]
        );
      }

      await client.query('COMMIT');
      res.status(201).json(returnResult.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error processing return:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get unique months for filtering
app.get('/api/months', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT TO_CHAR(invoice_date, 'YYYY-MM') as month 
      FROM purchases 
      ORDER BY month DESC
    `);
    res.json(result.rows.map(row => row.month));
  } catch (error) {
    console.error('Error fetching months:', error);
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
