-- Pharmacy Purchase Tracker Database Schema
-- Run this file in your PostgreSQL database to set up the tables

CREATE TABLE IF NOT EXISTS purchases (
  id SERIAL PRIMARY KEY,
  purchase_date DATE NOT NULL,
  supplier VARCHAR(255) NOT NULL,
  invoice_number VARCHAR(100) NOT NULL,
  grn_number VARCHAR(100),
  amount NUMERIC(12, 2) NOT NULL,
  payment_terms INTEGER NOT NULL CHECK (payment_terms IN (60, 90, 120)),
  due_date DATE GENERATED ALWAYS AS (purchase_date + payment_terms * INTERVAL '1 day') STORED,
  return_amount NUMERIC(12, 2) DEFAULT 0,
  net_due NUMERIC(12, 2) GENERATED ALWAYS AS (amount - COALESCE(return_amount, 0)) STORED,
  cn_status VARCHAR(20) DEFAULT 'not_received' CHECK (cn_status IN ('not_received', 'received')),
  cn_number VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update updated_at on row changes
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER purchases_updated_at
  BEFORE UPDATE ON purchases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Index for fast month filtering
CREATE INDEX IF NOT EXISTS idx_purchases_date ON purchases (purchase_date);
CREATE INDEX IF NOT EXISTS idx_purchases_supplier ON purchases (supplier);
