import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';
import axiosInstance from '../contexts/axiosInstance';

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

const Dashboard = () => {
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHoldings();
  }, []);

  const fetchHoldings = async () => {
    try {
      const [stockResponse, mfResponse] = await Promise.all([
        axiosInstance.get('http://localhost:8000/api/stock_holdings/'),
        axiosInstance.get('http://localhost:8000/api/mutual_fund_holdings/')
      ]);
      
      const stockHoldings = stockResponse.data.map(holding => ({
        ...holding,
        holding_type: 'stock'
      }));
      
      const mfHoldings = mfResponse.data.map(holding => ({
        ...holding,
        holding_type: 'mutual_fund'
      }));
      
      setHoldings([...stockHoldings, ...mfHoldings]);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch holdings');
      setLoading(false);
    }
  };

  const calculateTotalValue = () => {
    return holdings.reduce((sum, holding) => {
      if (holding.holding_type === 'stock') {
        return sum + holding.closing_value;
      } else {
        return sum + holding.current_value;
      }
    }, 0);
  };

  const calculateTotalPnL = () => {
    return holdings.reduce((sum, holding) => {
      if (holding.holding_type === 'stock') {
        return sum + holding.unrealized_pnl;
      } else {
        return sum + holding.returns;
      }
    }, 0);
  };

  const preparePieChartData = () => {
    const stockHoldings = holdings.filter(h => h.holding_type === 'stock');
    const mfHoldings = holdings.filter(h => h.holding_type === 'mutual_fund');

    const stockValue = stockHoldings.reduce((sum, h) => sum + h.closing_value, 0);
    const mfValue = mfHoldings.reduce((sum, h) => sum + h.current_value, 0);

    return {
      labels: ['Stocks', 'Mutual Funds'],
      datasets: [
        {
          data: [stockValue, mfValue],
          backgroundColor: ['#1976d2', '#dc004e'],
          borderColor: ['#1565c0', '#c51162'],
          borderWidth: 1,
        },
      ],
    };
  };

  const prepareSectorPieChartData = () => {
    const stockHoldings = holdings.filter(h => h.holding_type === 'stock' && h.sector);
    
    const sectorData = stockHoldings.reduce((acc, holding) => {
      const sector = holding.sector || 'Others';
      acc[sector] = (acc[sector] || 0) + holding.closing_value;
      return acc;
    }, {});

    const labels = Object.keys(sectorData);
    const data = Object.values(sectorData);

    // Custom color mapping for sectors
    const sectorColors = {
      'Consumer Cyclical': '#FF5500',
      'Financial Services': '#003366',
      'Basic Materials': '#6D462D',
      'Industrials': '#C00C0C',
      'Consumer Defensive': '#228B22',
      'Utilities': '#FFD700',
      'Technology': '#6500B8',
      'Others': '#B0B0B0',
    };
    const defaultColor = '#B0B0B0';

    const backgroundColors = labels.map(label => sectorColors[label] || defaultColor);
    const borderColors = backgroundColors.map(color => color);

    return {
      labels: labels,
      datasets: [
        {
          data: data,
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 1,
        },
      ],
    };
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography color="error" align="center">
          {error}
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Total Portfolio Value
            </Typography>
            <Typography component="p" variant="h4">
              ₹{calculateTotalValue().toLocaleString()}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Total P&L
            </Typography>
            <Typography
              component="p"
              variant="h4"
              color={calculateTotalPnL() >= 0 ? 'success.main' : 'error.main'}
            >
              ₹{calculateTotalPnL().toLocaleString()}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Number of Holdings
            </Typography>
            <Typography component="p" variant="h4">
              {holdings.length}
            </Typography>
          </Paper>
        </Grid>

        {/* Portfolio Allocation Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 400 }}>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Portfolio Allocation
            </Typography>
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Pie data={preparePieChartData()} options={{ maintainAspectRatio: false }} />
            </Box>
          </Paper>
        </Grid>

        {/* Sector Distribution Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 400 }}>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Sector Distribution (Stocks)
            </Typography>
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {holdings.filter(h => h.holding_type === 'stock' && h.sector).length > 0 ? (
                <Pie data={prepareSectorPieChartData()} options={{ maintainAspectRatio: false }} />
              ) : (
                <Typography variant="body1" color="text.secondary">
                  No stock sector data available to display.
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Top Holdings */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 400 }}>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Top Holdings by Value
            </Typography>
            <Box sx={{ flex: 1, overflow: 'auto' }}>
              {holdings
                .sort((a, b) => {
                  const aValue = a.holding_type === 'stock' ? a.closing_value : a.current_value;
                  const bValue = b.holding_type === 'stock' ? b.closing_value : b.current_value;
                  return bValue - aValue;
                })
                .slice(0, 5)
                .map((holding) => (
                  <Box key={holding.id} sx={{ mb: 2 }}>
                    <Typography variant="subtitle1">
                      {holding.holding_type === 'stock' ? holding.name : holding.scheme_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Value: ₹{(holding.holding_type === 'stock' ? holding.closing_value : holding.current_value).toLocaleString()} | 
                      P&L: ₹{(holding.holding_type === 'stock' ? holding.unrealized_pnl : holding.returns).toLocaleString()}
                    </Typography>
                  </Box>
                ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard; 