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

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/purchases', purchasesRouter);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
