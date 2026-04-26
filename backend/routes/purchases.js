const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

// GET all purchases (with optional month and supplier filters)
router.get('/', async (req, res) => {
  try {
    const { month, supplier } = req.query;
    let query = 'SELECT * FROM purchases WHERE 1=1';
    const params = [];

    if (month) {
      params.push(month);
      query += ` AND TO_CHAR(purchase_date, 'YYYY-MM') = $${params.length}`;
    }
    if (supplier) {
      params.push(`%${supplier}%`);
      query += ` AND supplier ILIKE $${params.length}`;
    }

    query += ' ORDER BY purchase_date DESC, created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch purchases' });
  }
});

// GET summary for a specific month
router.get('/summary/:month', async (req, res) => {
  try {
    const { month } = req.params;

    const summary = await pool.query(
      `SELECT
        COUNT(*) AS invoice_count,
        COALESCE(SUM(amount), 0) AS total_invoiced,
        COALESCE(SUM(return_amount), 0) AS total_returned,
        COALESCE(SUM(net_due), 0) AS net_payable
      FROM purchases
      WHERE TO_CHAR(purchase_date, 'YYYY-MM') = $1`,
      [month]
    );

    const bySupplier = await pool.query(
      `SELECT
        supplier,
        COALESCE(SUM(amount), 0) AS total_invoiced,
        COALESCE(SUM(return_amount), 0) AS total_returned,
        COALESCE(SUM(net_due), 0) AS net_payable
      FROM purchases
      WHERE TO_CHAR(purchase_date, 'YYYY-MM') = $1
      GROUP BY supplier
      ORDER BY net_payable DESC`,
      [month]
    );

    res.json({
      summary: summary.rows[0],
      by_supplier: bySupplier.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

// GET distinct months available
router.get('/months', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT DISTINCT TO_CHAR(purchase_date, 'YYYY-MM') AS month
       FROM purchases
       ORDER BY month DESC`
    );
    res.json(result.rows.map((r) => r.month));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch months' });
  }
});

// POST create new purchase
router.post('/', async (req, res) => {
  try {
    const { purchase_date, supplier, invoice_number, grn_number, amount, payment_terms } = req.body;

    if (!purchase_date || !supplier || !invoice_number || !amount || !payment_terms) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await pool.query(
      `INSERT INTO purchases (purchase_date, supplier, invoice_number, grn_number, amount, payment_terms)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [purchase_date, supplier, invoice_number, grn_number || null, amount, payment_terms]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create purchase' });
  }
});

// PUT update a purchase (full edit)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { purchase_date, supplier, invoice_number, grn_number, amount, payment_terms } = req.body;

    const result = await pool.query(
      `UPDATE purchases
       SET purchase_date=$1, supplier=$2, invoice_number=$3, grn_number=$4, amount=$5, payment_terms=$6
       WHERE id=$7
       RETURNING *`,
      [purchase_date, supplier, invoice_number, grn_number || null, amount, payment_terms, id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update purchase' });
  }
});

// PATCH update return amount and credit note only
router.patch('/:id/return', async (req, res) => {
  try {
    const { id } = req.params;
    const { return_amount, cn_status, cn_number } = req.body;

    const result = await pool.query(
      `UPDATE purchases
       SET return_amount=$1, cn_status=$2, cn_number=$3
       WHERE id=$4
       RETURNING *`,
      [return_amount || 0, cn_status || 'not_received', cn_number || null, id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update return info' });
  }
});

// DELETE a purchase
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM purchases WHERE id=$1 RETURNING id', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ deleted: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete purchase' });
  }
});

module.exports = router;
