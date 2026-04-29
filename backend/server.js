require('dotenv').config();
const express = require('express');
const cors = require('cors');
const purchasesRouter = require('./routes/purchases');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ 
  origin: process.env.FRONTEND_URL || ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true 
}));
app.use(express.json());

app.get('/api/init-db', async (req, res) => {
  const pool = require('./db/pool');
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS purchases (
        id SERIAL PRIMARY KEY,
        purchase_date DATE NOT NULL,
        supplier VARCHAR(255) NOT NULL,
        invoice_number VARCHAR(100) NOT NULL,
        grn_number VARCHAR(100),
        amount NUMERIC(12, 2) NOT NULL,
        payment_terms INTEGER NOT NULL,
        return_amount NUMERIC(12, 2) DEFAULT 0,
        net_due NUMERIC(12, 2) DEFAULT 0,
        due_date DATE,
        cn_status VARCHAR(20) DEFAULT 'not_received',
        cn_number VARCHAR(100),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_purchases_date ON purchases (purchase_date);
      CREATE INDEX IF NOT EXISTS idx_purchases_supplier ON purchases (supplier);
    `);
    res.json({ success: true, message: 'Database table created successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/purchases', purchasesRouter);
app.use('/api/setup', require('./routes/setup'));
app.use('/api/test', require('./routes/test'));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
