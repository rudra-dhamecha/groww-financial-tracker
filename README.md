# Finance Portfolio Tracker

A full-stack web application for tracking and analyzing investment portfolios, including stocks and mutual funds.

## Features

- User authentication and secure data storage
- Excel file upload for stock and mutual fund holdings
- Portfolio analysis with charts and tables
- Real-time P&L tracking

## Tech Stack

### Backend
- FastAPI
- PostgreSQL
- Python 3.9+
- pandas/openpyxl for Excel processing

### Frontend
- React.js
- Chart.js/Recharts
- Material-UI

## Project Structure

```
finance-tracker/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── db/
│   │   ├── models/
│   │   └── services/
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── utils/
│   ├── package.json
│   └── .env
└── README.md
```

## Setup Instructions

### Backend Setup
1. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. Set up environment variables in `.env`:
   ```
   DATABASE_URL=postgresql://user:password@localhost:5432/finance_tracker
   SECRET_KEY=your-secret-key
   ```

4. Run the backend:
   ```bash
   uvicorn app.main:app --reload
   ```

### Frontend Setup
1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Set up environment variables in `.env`:
   ```
   REACT_APP_API_URL=http://localhost:8000
   ```

3. Run the frontend:
   ```bash
   npm start
   ```

## API Documentation

Once the backend is running, visit `http://localhost:8000/docs` for the complete API documentation.

## License

MIT 