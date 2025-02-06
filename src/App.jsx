import React, { useState } from 'react';
import { Container, AppBar, Toolbar, Typography, Button, Box, CssBaseline } from '@mui/material';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import LoanForm from './components/LoanForm';
import AdminPanel from './components/AdminPanel';
import PaymentForm from './components/PaymentForm';
import Members from './pages/Members';
import PayInstallment from './components/PayInstallment';
import Reports from './components/Reports';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Navbar from './components/Navbar';
import Login from './components/Login';

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
    const [currentPage, setCurrentPage] = useState('members');
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const handleLogin = () => {
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
    };

    const renderPage = () => {
        switch (currentPage) {
            case 'members':
                return <Members />;
            case 'reports':
                return <Reports />;
            case 'pay':
                return <PayInstallment />;
            default:
                return <Members />;
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Router>
                <AppBar position="static" sx={{ mb: 4 }}>
                    <Toolbar>
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
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
                                to="/admin"
                                sx={{ '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' } }}
                            >
                                Admin
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
                                to="/reports"
                                sx={{ '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' } }}
                            >
                                Reports
                            </Button>
                        </Box>
                    </Toolbar>
                </AppBar>

                <Container sx={{ mt: 4 }}>
                    {!isAuthenticated ? (
                        <Login onLogin={handleLogin} />
                    ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                            <Navbar 
                                currentPage={currentPage} 
                                onPageChange={setCurrentPage}
                                onLogout={handleLogout}
                            />
                            <Box component="main" sx={{ flexGrow: 1 }}>
                                <Routes>
                                    <Route path="/" element={<LoanForm />} />
                                    <Route path="/members" element={renderPage()} />
                                    <Route path="/admin" element={<AdminPanel />} />
                                    <Route path="/pay-installment" element={<PayInstallment />} />
                                    <Route path="/reports" element={<Reports />} />
                                    <Route
                                        path="/payment/:loanId"
                                        element={<PaymentForm />}
                                    />
                                </Routes>
                            </Box>
                        </Box>
                    )}
                </Container>
            </Router>
        </ThemeProvider>
    );
}

export default App;
