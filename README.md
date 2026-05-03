# Pharmacy Tracker

A modern pharmacy management system with Purchase Ledger and IBT Register functionality.

## Features

- **Purchase Ledger**: Track medicine purchases with supplier details, invoice information, and batch management
- **IBT Register**: Manage Inter-Branch Transfers between pharmacy locations
- **Return Processing**: Handle medicine returns with proper tracking
- **Excel Export**: Export data to Excel for reporting and analysis
- **Modern UI**: Beautiful, responsive interface with gradient design
- **Real-time Filtering**: Filter by month, supplier, and medicine name

## Tech Stack

### Frontend
- React 18
- Vite
- Tailwind CSS (custom styles)
- Axios for API calls
- XLSX for Excel export

### Backend
- Node.js
- Express.js
- PostgreSQL
- CORS enabled for cross-origin requests

### Deployment
- Frontend: Vercel
- Backend: Railway
- Database: PostgreSQL (Railway)

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database

### Installation

1. Clone the repository
2. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```

3. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

4. Set up environment variables:
   ```bash
   # In backend/.env
   DATABASE_URL=your_postgresql_connection_string
   PORT=4000
   NODE_ENV=development
   ```

5. Start the development servers:
   ```bash
   # Backend
   cd backend
   npm run dev

   # Frontend (in separate terminal)
   cd frontend
   npm run dev
   ```

## API Endpoints

### Purchases
- `GET /api/purchases` - Get all purchases
- `POST /api/purchases` - Add new purchase
- `PUT /api/purchases/:id` - Update purchase
- `DELETE /api/purchases/:id` - Delete purchase

### IBT Transactions
- `GET /api/ibt` - Get all IBT transactions
- `POST /api/ibt` - Add new IBT transaction

### Returns
- `POST /api/returns` - Process medicine return

### Filters
- `GET /api/months` - Get unique months for filtering
- `GET /api/suppliers` - Get unique suppliers for filtering

### Health
- `GET /health` - Health check endpoint

## Database Schema

### Purchases Table
- `id` (Serial, Primary Key)
- `supplier_name` (VARCHAR)
- `invoice_no` (VARCHAR)
- `invoice_date` (DATE)
- `medicine_name` (VARCHAR)
- `batch_no` (VARCHAR)
- `expiry_date` (DATE)
- `quantity` (INTEGER)
- `free_quantity` (INTEGER)
- `mrp` (DECIMAL)
- `purchase_rate` (DECIMAL)
- `gst` (DECIMAL)
- `total_amount` (DECIMAL)
- `created_at` (TIMESTAMP)

### IBT Transactions Table
- `id` (Serial, Primary Key)
- `date` (DATE)
- `from_branch` (VARCHAR)
- `to_branch` (VARCHAR)
- `medicine_name` (VARCHAR)
- `batch_no` (VARCHAR)
- `quantity` (INTEGER)
- `reason` (TEXT)
- `created_at` (TIMESTAMP)

### Returns Table
- `id` (Serial, Primary Key)
- `purchase_id` (Integer, Foreign Key)
- `return_quantity` (INTEGER)
- `return_reason` (VARCHAR)
- `return_date` (DATE)
- `created_at` (TIMESTAMP)

## Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set root directory to `frontend`
3. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
4. Add environment variable: `VITE_API_URL` (your backend URL)

### Backend (Railway)
1. Connect your GitHub repository to Railway
2. Set root directory to `backend`
3. Add environment variables:
   - `DATABASE_URL` (PostgreSQL connection string)
   - `NODE_ENV=production`
   - `PORT=4000`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
