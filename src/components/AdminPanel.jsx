import { useState, useEffect } from 'react';
import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Button,
    Box,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    IconButton,
    Grid,
    Card,
    CardContent
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import { query, collection, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { updateMember } from '../services/memberService';

const AdminPanel = () => {
    const [members, setMembers] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);
    const [editedData, setEditedData] = useState(null);

    useEffect(() => {
        const q = query(collection(db, 'members'));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            try {
                const membersData = [];
                querySnapshot.forEach((doc) => {
                    membersData.push({ id: doc.id, ...doc.data() });
                });
                
                // Remove duplicates by memberNumber and keep only the latest entry
                const uniqueMembers = membersData.reduce((acc, current) => {
                    const x = acc.find(item => item.memberNumber === current.memberNumber);
                    if (!x) {
                        return acc.concat([current]);
                    } else {
                        // If this is a newer entry, replace the old one
                        const index = acc.indexOf(x);
                        acc[index] = current;
                        return acc;
                    }
                }, []);

                const sortedData = uniqueMembers.sort((a, b) => Number(a.memberNumber) - Number(b.memberNumber));
                setMembers(sortedData);
                setError(null);
            } catch (err) {
                setError('Failed to fetch members. Please try again later.');
                console.error('Error fetching members:', err);
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    const handleEditClick = (member) => {
        setSelectedMember(member);
        setEditedData({ ...member });
        setEditDialogOpen(true);
    };

    const handleInputChange = (field, value) => {
        setEditedData(prev => ({
            ...prev,
            [field]: field === 'memberNumber' ? value : Number(value) || 0
        }));
    };

    const handleSave = async () => {
        try {
            await updateMember(selectedMember.id, editedData);
            setMembers(prev => 
                prev.map(member => 
                    member.id === selectedMember.id ? { ...member, ...editedData } : member
                )
            );
            setEditDialogOpen(false);
            setError(null);
        } catch (err) {
            setError('Failed to update member. Please try again.');
            console.error('Error updating member:', err);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    };

    if (loading) {
        return (
            <Paper elevation={3} sx={{ p: 4, m: 4 }}>
                <Typography>Loading...</Typography>
            </Paper>
        );
    }

    return (
        <Paper elevation={3} sx={{ p: 4, m: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h5" gutterBottom>
                    Member Management Dashboard
                </Typography>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <TableContainer sx={{ 
                boxShadow: 3,
                borderRadius: 2,
                overflow: 'hidden'
            }}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                            <TableCell sx={{ fontWeight: 'bold' }}>Member No.</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Loan Amount</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Interest</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Installment</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Balance</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {members.map((member) => (
                            <TableRow 
                                key={member.id}
                                sx={{ 
                                    '&:nth-of-type(odd)': { backgroundColor: '#fafafa' },
                                    '&:hover': { backgroundColor: '#f0f7ff' },
                                    transition: 'background-color 0.2s'
                                }}
                            >
                                <TableCell>{member.memberNumber}</TableCell>
                                <TableCell>{member.name}</TableCell>
                                <TableCell align="right">{formatCurrency(member.loanAmount)}</TableCell>
                                <TableCell align="right">{formatCurrency(member.interest)}</TableCell>
                                <TableCell align="right">{formatCurrency(member.installment)}</TableCell>
                                <TableCell align="right">{formatCurrency(member.balance)}</TableCell>
                                <TableCell>
                                    <IconButton
                                        color="primary"
                                        onClick={() => handleEditClick(member)}
                                        size="small"
                                        sx={{ 
                                            boxShadow: 1,
                                            '&:hover': { boxShadow: 2 }
                                        }}
                                    >
                                        <EditIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog 
                open={editDialogOpen} 
                onClose={() => setEditDialogOpen(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 2,
                        boxShadow: 24
                    }
                }}
            >
                <DialogTitle sx={{ 
                    backgroundColor: '#f5f5f5',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <Typography variant="h6" component="div">
                        Edit Member Details
                    </Typography>
                    <IconButton
                        onClick={() => setEditDialogOpen(false)}
                        size="small"
                        sx={{ 
                            '&:hover': { 
                                backgroundColor: '#e0e0e0'
                            }
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ p: 3 }}>
                    {editedData && (
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <Card sx={{ boxShadow: 2, mb: 2 }}>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom color="primary">
                                            Personal Information
                                        </Typography>
                                        <Grid container spacing={2}>
                                            <Grid item xs={6}>
                                                <TextField
                                                    label="Member Number"
                                                    value={editedData.memberNumber}
                                                    onChange={(e) => handleInputChange('memberNumber', e.target.value)}
                                                    fullWidth
                                                    margin="normal"
                                                />
                                            </Grid>
                                            <Grid item xs={6}>
                                                <TextField
                                                    label="Name"
                                                    value={editedData.name}
                                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                                    fullWidth
                                                    margin="normal"
                                                />
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                </Card>

                                <Card sx={{ boxShadow: 2 }}>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom color="primary">
                                            Financial Details
                                        </Typography>
                                        <Grid container spacing={2}>
                                            <Grid item xs={6} md={3}>
                                                <TextField
                                                    label="Loan Amount"
                                                    value={editedData.loanAmount}
                                                    onChange={(e) => handleInputChange('loanAmount', e.target.value)}
                                                    fullWidth
                                                    type="number"
                                                    margin="normal"
                                                />
                                            </Grid>
                                            <Grid item xs={6} md={3}>
                                                <TextField
                                                    label="Interest"
                                                    value={editedData.interest}
                                                    onChange={(e) => handleInputChange('interest', e.target.value)}
                                                    fullWidth
                                                    type="number"
                                                    margin="normal"
                                                />
                                            </Grid>
                                            <Grid item xs={6} md={3}>
                                                <TextField
                                                    label="Installment"
                                                    value={editedData.installment}
                                                    onChange={(e) => handleInputChange('installment', e.target.value)}
                                                    fullWidth
                                                    type="number"
                                                    margin="normal"
                                                />
                                            </Grid>
                                            <Grid item xs={6} md={3}>
                                                <TextField
                                                    label="Balance"
                                                    value={editedData.balance}
                                                    onChange={(e) => handleInputChange('balance', e.target.value)}
                                                    fullWidth
                                                    type="number"
                                                    margin="normal"
                                                />
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                    <Button 
                        onClick={() => setEditDialogOpen(false)}
                        variant="outlined"
                        startIcon={<CloseIcon />}
                        sx={{ mr: 1 }}
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleSave}
                        variant="contained"
                        startIcon={<SaveIcon />}
                        sx={{ 
                            boxShadow: 2,
                            '&:hover': { boxShadow: 3 }
                        }}
                    >
                        Save Changes
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
};

export default AdminPanel;
