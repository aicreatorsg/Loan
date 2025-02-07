import React, { useState } from 'react';
import {
    Box,
    Paper,
    TextField,
    Button,
    Typography,
    Alert,
    Container,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import SettingsIcon from '@mui/icons-material/Settings';

// Initial credentials - will be replaced by your stored credentials
const defaultCredentials = {
    username: 'admin',
    password: 'admin123'
};

export default function Login({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isChangeCredentialsOpen, setIsChangeCredentialsOpen] = useState(false);
    const [newCredentials, setNewCredentials] = useState({
        currentUsername: '',
        currentPassword: '',
        newUsername: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [credentials, setCredentials] = useState(() => {
        const savedCredentials = localStorage.getItem('adminCredentials');
        return savedCredentials ? JSON.parse(savedCredentials) : defaultCredentials;
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (username === credentials.username && password === credentials.password) {
            onLogin();
            setError('');
        } else {
            setError('Invalid username or password');
        }
    };

    const handleChangeCredentials = () => {
        // Validate current credentials
        if (newCredentials.currentUsername !== credentials.username || 
            newCredentials.currentPassword !== credentials.password) {
            setError('Current credentials are incorrect');
            return;
        }

        // Validate new password match
        if (newCredentials.newPassword !== newCredentials.confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        // Validate new credentials are not empty
        if (!newCredentials.newUsername || !newCredentials.newPassword) {
            setError('New username and password cannot be empty');
            return;
        }

        // Update credentials
        const updatedCredentials = {
            username: newCredentials.newUsername,
            password: newCredentials.newPassword
        };

        // Save to localStorage
        localStorage.setItem('adminCredentials', JSON.stringify(updatedCredentials));
        setCredentials(updatedCredentials);

        // Reset form and close dialog
        setNewCredentials({
            currentUsername: '',
            currentPassword: '',
            newUsername: '',
            newPassword: '',
            confirmPassword: ''
        });
        setIsChangeCredentialsOpen(false);
        setError('');
        alert('Credentials updated successfully. Please login with new credentials.');
    };

    return (
        <Container component="main" maxWidth="xs">
            <Box sx={{
                marginTop: 8,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}>
                <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                        <Box sx={{ 
                            bgcolor: 'primary.main', 
                            color: 'white', 
                            p: 2, 
                            borderRadius: '50%',
                            mb: 1
                        }}>
                            <LockOutlinedIcon />
                        </Box>
                        <Typography component="h1" variant="h5">
                            Login
                        </Typography>
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="username"
                            label="Username"
                            name="username"
                            autoComplete="username"
                            autoFocus
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type="password"
                            id="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                        >
                            Sign In
                        </Button>
                        
                        <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<SettingsIcon />}
                            onClick={() => setIsChangeCredentialsOpen(true)}
                            sx={{ mt: 1 }}
                        >
                            Change Credentials
                        </Button>
                    </Box>
                </Paper>
            </Box>

            {/* Change Credentials Dialog */}
            <Dialog 
                open={isChangeCredentialsOpen} 
                onClose={() => {
                    setIsChangeCredentialsOpen(false);
                    setError('');
                }}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    <Box display="flex" alignItems="center" gap={1}>
                        <SettingsIcon />
                        <Typography>Change Admin Credentials</Typography>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2, mt: 1 }}>
                            {error}
                        </Alert>
                    )}
                    <Box sx={{ mt: 1 }}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Current Credentials
                        </Typography>
                        <TextField
                            margin="dense"
                            required
                            fullWidth
                            label="Current Username"
                            value={newCredentials.currentUsername}
                            onChange={(e) => setNewCredentials({
                                ...newCredentials,
                                currentUsername: e.target.value
                            })}
                        />
                        <TextField
                            margin="dense"
                            required
                            fullWidth
                            type="password"
                            label="Current Password"
                            value={newCredentials.currentPassword}
                            onChange={(e) => setNewCredentials({
                                ...newCredentials,
                                currentPassword: e.target.value
                            })}
                        />
                        
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }} gutterBottom>
                            New Credentials
                        </Typography>
                        <TextField
                            margin="dense"
                            required
                            fullWidth
                            label="New Username"
                            value={newCredentials.newUsername}
                            onChange={(e) => setNewCredentials({
                                ...newCredentials,
                                newUsername: e.target.value
                            })}
                        />
                        <TextField
                            margin="dense"
                            required
                            fullWidth
                            type="password"
                            label="New Password"
                            value={newCredentials.newPassword}
                            onChange={(e) => setNewCredentials({
                                ...newCredentials,
                                newPassword: e.target.value
                            })}
                        />
                        <TextField
                            margin="dense"
                            required
                            fullWidth
                            type="password"
                            label="Confirm New Password"
                            value={newCredentials.confirmPassword}
                            onChange={(e) => setNewCredentials({
                                ...newCredentials,
                                confirmPassword: e.target.value
                            })}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button 
                        onClick={() => {
                            setIsChangeCredentialsOpen(false);
                            setError('');
                        }}
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleChangeCredentials} 
                        variant="contained"
                        color="primary"
                    >
                        Update Credentials
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
