import React from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Box,
    IconButton
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PaymentIcon from '@mui/icons-material/Payment';
import LogoutIcon from '@mui/icons-material/Logout';

export default function Navbar({ currentPage, onPageChange, onLogout }) {
    return (
        <AppBar position="sticky">
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 0, mr: 4 }}>
                    Member Management
                </Typography>

                <Box sx={{ flexGrow: 1 }}>
                    <Button
                        color="inherit"
                        startIcon={<PeopleIcon />}
                        onClick={() => onPageChange('members')}
                        sx={{ 
                            mr: 2,
                            bgcolor: currentPage === 'members' ? 'rgba(255, 255, 255, 0.1)' : 'transparent'
                        }}
                    >
                        Members
                    </Button>
                    <Button
                        color="inherit"
                        startIcon={<AssessmentIcon />}
                        onClick={() => onPageChange('reports')}
                        sx={{ 
                            mr: 2,
                            bgcolor: currentPage === 'reports' ? 'rgba(255, 255, 255, 0.1)' : 'transparent'
                        }}
                    >
                        Reports
                    </Button>
                    <Button
                        color="inherit"
                        startIcon={<PaymentIcon />}
                        onClick={() => onPageChange('pay')}
                        sx={{ 
                            bgcolor: currentPage === 'pay' ? 'rgba(255, 255, 255, 0.1)' : 'transparent'
                        }}
                    >
                        Pay Installment
                    </Button>
                </Box>

                <IconButton 
                    color="inherit" 
                    onClick={onLogout}
                    title="Logout"
                >
                    <LogoutIcon />
                </IconButton>
            </Toolbar>
        </AppBar>
    );
}
