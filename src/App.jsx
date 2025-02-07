import React, { useState } from 'react';
import { Container, AppBar, Toolbar, Typography, Button, Box, CssBaseline } from '@mui/material';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './components/Home';
import AdminPanel from './components/AdminPanel';
import Members from './pages/Members';
import PayInstallment from './components/PayInstallment';
import RegisterMember from './components/RegisterMember';
import Reports from './components/Reports';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Login from './components/Login';
import MemberManagement from './components/MemberManagement';

const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#dc004e',
        },
    },
});

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const handleLogin = () => {
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Router>
                <AppBar position="static" sx={{ mb: 4 }}>
                    <Toolbar>
                        <Typography 
                            variant="h6" 
                            component={Link} 
                            to="/"
                            sx={{ 
                                flexGrow: 1, 
                                textDecoration: 'none',
                                color: 'inherit',
                                '&:hover': {
                                    color: 'rgba(255, 255, 255, 0.8)'
                                }
                            }}
                        >
                            Loan Management
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button 
                                color="inherit" 
                                component={Link} 
                                to="/"
                                sx={{ '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' } }}
                            >
                                Home
                            </Button>
                            <Button 
                                color="inherit" 
                                component={Link} 
                                to="/members"
                                sx={{ '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' } }}
                            >
                                Members
                            </Button>
                            <Button 
                                color="inherit" 
                                component={Link} 
                                to="/register-member"
                                sx={{ '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' } }}
                            >
                                Register Member
                            </Button>
                            <Button 
                                color="inherit" 
                                component={Link} 
                                to="/pay-installment"
                                sx={{ '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' } }}
                            >
                                Pay Installment
                            </Button>
                            <Button 
                                color="inherit" 
                                component={Link} 
                                to="/member-management"
                                sx={{ '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' } }}
                            >
                                Member Management
                            </Button>
                            <Button 
                                color="inherit" 
                                component={Link} 
                                to="/reports"
                                sx={{ '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' } }}
                            >
                                Reports
                            </Button>
                            {isAuthenticated && (
                                <Button 
                                    color="inherit"
                                    onClick={handleLogout}
                                    sx={{ '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' } }}
                                >
                                    Logout
                                </Button>
                            )}
                        </Box>
                    </Toolbar>
                </AppBar>

                <Container>
                    {!isAuthenticated ? (
                        <Login onLogin={handleLogin} />
                    ) : (
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/members" element={<Members />} />
                            <Route path="/register-member" element={<RegisterMember />} />
                            <Route path="/admin" element={<AdminPanel />} />
                            <Route path="/pay-installment" element={<PayInstallment />} />
                            <Route path="/member-management" element={<MemberManagement />} />
                            <Route path="/reports" element={<Reports />} />
                        </Routes>
                    )}
                </Container>
            </Router>
        </ThemeProvider>
    );
}

export default App;
