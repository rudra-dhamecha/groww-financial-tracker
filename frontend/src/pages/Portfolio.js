import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
} from '@mui/material';
import { Upload as UploadIcon } from '@mui/icons-material';
import axios from 'axios';

const Portfolio = () => {
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    fetchHoldings();
  }, []);

  const fetchHoldings = async () => {
    try {
      const [stockResponse, mfResponse] = await Promise.all([
        axios.get('http://localhost:8000/api/stock_holdings/'),
        axios.get('http://localhost:8000/api/mutual_fund_holdings/')
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

  const handleFileUpload = async (event, type) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploadStatus('Uploading...');
      const endpoint = type === 'stock' 
        ? 'http://localhost:8000/api/stock_holdings/upload'
        : 'http://localhost:8000/api/mutual_fund_holdings/upload';
        
      await axios.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setUploadStatus('Upload successful!');
      fetchHoldings();
    } catch (err) {
      setUploadStatus('Upload failed: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const filteredHoldings = holdings.filter(
    (holding) => holding.holding_type === (tabValue === 0 ? 'stock' : 'mutual_fund')
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Upload Holdings
        </Typography>
        <Box sx={{ mb: 2 }}>
          <input
            accept=".xlsx"
            style={{ display: 'none' }}
            id="stock-file"
            type="file"
            onChange={(e) => handleFileUpload(e, 'stock')}
          />
          <label htmlFor="stock-file">
            <Button
              variant="contained"
              component="span"
              startIcon={<UploadIcon />}
              sx={{ mr: 2 }}
            >
              Upload Stock Holdings
            </Button>
          </label>

          <input
            accept=".xlsx"
            style={{ display: 'none' }}
            id="mf-file"
            type="file"
            onChange={(e) => handleFileUpload(e, 'mutual_fund')}
          />
          <label htmlFor="mf-file">
            <Button
              variant="contained"
              component="span"
              startIcon={<UploadIcon />}
            >
              Upload Mutual Fund Holdings
            </Button>
          </label>
        </Box>
        {uploadStatus && (
          <Alert severity={uploadStatus.includes('failed') ? 'error' : 'success'}>
            {uploadStatus}
          </Alert>
        )}
      </Paper>

      <Paper sx={{ width: '100%' }}>
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Stocks" />
          <Tab label="Mutual Funds" />
        </Tabs>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {tabValue === 0 ? (
                  <>
                    <TableCell>Name</TableCell>
                    <TableCell>ISIN</TableCell>
                    <TableCell align="right">Quantity</TableCell>
                    <TableCell align="right">Avg. Buy Price</TableCell>
                    <TableCell align="right">Buy Value</TableCell>
                    <TableCell align="right">Closing Price</TableCell>
                    <TableCell align="right">Closing Value</TableCell>
                    <TableCell align="right">P&L</TableCell>
                  </>
                ) : (
                  <>
                    <TableCell>Scheme Name</TableCell>
                    <TableCell>AMC</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Sub Category</TableCell>
                    <TableCell>Folio No</TableCell>
                    <TableCell>Source</TableCell>
                    <TableCell align="right">Units</TableCell>
                    <TableCell align="right">Invested Value</TableCell>
                    <TableCell align="right">Current Value</TableCell>
                    <TableCell align="right">Returns</TableCell>
                    <TableCell align="right">XIRR</TableCell>
                  </>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredHoldings.map((holding) => (
                <TableRow key={holding.id}>
                  {tabValue === 0 ? (
                    <>
                      <TableCell>{holding.name}</TableCell>
                      <TableCell>{holding.isin}</TableCell>
                      <TableCell align="right">{holding.quantity}</TableCell>
                      <TableCell align="right">₹{holding.avg_buy_price.toLocaleString()}</TableCell>
                      <TableCell align="right">₹{holding.buy_value.toLocaleString()}</TableCell>
                      <TableCell align="right">₹{holding.closing_price.toLocaleString()}</TableCell>
                      <TableCell align="right">₹{holding.closing_value.toLocaleString()}</TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          color: holding.unrealized_pnl >= 0 ? 'success.main' : 'error.main',
                        }}
                      >
                        ₹{holding.unrealized_pnl.toLocaleString()}
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell>{holding.scheme_name}</TableCell>
                      <TableCell>{holding.amc}</TableCell>
                      <TableCell>{holding.category}</TableCell>
                      <TableCell>{holding.sub_category}</TableCell>
                      <TableCell>{holding.folio_no}</TableCell>
                      <TableCell>{holding.source}</TableCell>
                      <TableCell align="right">{holding.units}</TableCell>
                      <TableCell align="right">₹{holding.invested_value.toLocaleString()}</TableCell>
                      <TableCell align="right">₹{holding.current_value.toLocaleString()}</TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          color: holding.returns >= 0 ? 'success.main' : 'error.main',
                        }}
                      >
                        ₹{holding.returns.toLocaleString()}
                      </TableCell>
                      <TableCell align="right">{holding.xirr}</TableCell>
                    </>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
};

export default Portfolio; 