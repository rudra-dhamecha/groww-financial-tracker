import React from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Finance Portfolio Tracker
        </Typography>
        <Box>
          {isAuthenticated ? (
            <>
              <Button
                color="inherit"
                component={RouterLink}
                to="/"
                sx={location.pathname === '/' ? { boxShadow: 3, bgcolor: 'background.paper', color: 'primary.main' } : {}}
                className={location.pathname === '/' ? 'navbar-active' : ''}
                style={{ marginRight: 8 }}
              >
                Dashboard
              </Button>
              <Button
                color="inherit"
                component={RouterLink}
                to="/portfolio"
                sx={location.pathname === '/portfolio' ? { boxShadow: 3, bgcolor: 'background.paper', color: 'primary.main' } : {}}
                className={location.pathname === '/portfolio' ? 'navbar-active' : ''}
                style={{ marginRight: 8 }}
              >
                Portfolio
              </Button>
              <Button color="inherit" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button
                color="inherit"
                component={RouterLink}
                to="/login"
                sx={location.pathname === '/login' ? { boxShadow: 3, bgcolor: 'background.paper', color: 'primary.main' } : {}}
                className={location.pathname === '/login' ? 'navbar-active' : ''}
                style={{ marginRight: 8 }}
              >
                Login
              </Button>
              <Button
                color="inherit"
                component={RouterLink}
                to="/register"
                sx={location.pathname === '/register' ? { boxShadow: 3, bgcolor: 'background.paper', color: 'primary.main' } : {}}
                className={location.pathname === '/register' ? 'navbar-active' : ''}
              >
                Register
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 