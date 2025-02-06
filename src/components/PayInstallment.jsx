import React, { useState, useEffect } from 'react';
import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    TextField,
    Checkbox,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    CircularProgress
} from '@mui/material';
import { db } from '../config/firebase';
import { collection, query, onSnapshot, doc, updateDoc, addDoc, getDocs, where } from 'firebase/firestore';

export default function PayInstallment() {
    const [members, setMembers] = useState([]);
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [historyDialog, setHistoryDialog] = useState({ open: false, memberId: null, history: [] });

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

                // Sort by member number
                const sortedMembers = uniqueMembers.sort((a, b) => 
                    Number(a.memberNumber) - Number(b.memberNumber)
                );
                
                setMembers(sortedMembers);
                setError(null);
            } catch (err) {
                setError('Failed to load members');
                console.error('Error loading members:', err);
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    const handleSelectMember = (memberId) => {
        setSelectedMembers(prev => {
            if (prev.includes(memberId)) {
                return prev.filter(id => id !== memberId);
            } else {
                return [...prev, memberId];
            }
        });
    };

    const handleSubmitPayment = async () => {
        if (!amount || selectedMembers.length === 0) {
            setError('Please select members and enter an amount');
            return;
        }

        setLoading(true);
        try {
            for (const memberId of selectedMembers) {
                const member = members.find(m => m.id === memberId);
                if (!member) continue;

                // Update member balance
                const memberRef = doc(db, 'members', memberId);
                const newBalance = Number(member.balance || 0) - Number(amount);
                await updateDoc(memberRef, {
                    balance: newBalance
                });

                // Record transaction
                await addDoc(collection(db, 'transactions'), {
                    memberId,
                    memberNumber: member.memberNumber,
                    amount: Number(amount),
                    type: 'payment',
                    date: new Date().toISOString()
                });
            }

            setSuccess('Payment recorded successfully');
            setSelectedMembers([]);
            setAmount('');
        } catch (err) {
            setError('Failed to record payment');
            console.error('Error recording payment:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const handleViewHistory = async (memberId) => {
        try {
            const q = query(
                collection(db, 'transactions'),
                where('memberId', '==', memberId)
            );
            
            const querySnapshot = await getDocs(q);
            const history = [];
            querySnapshot.forEach((doc) => {
                history.push({ id: doc.id, ...doc.data() });
            });
            
            setHistoryDialog({
                open: true,
                memberId,
                history: history.sort((a, b) => new Date(b.date) - new Date(a.date))
            });
        } catch (err) {
            console.error('Error fetching history:', err);
            setError('Failed to fetch transaction history');
        }
    };

    if (loading && members.length === 0) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
                Pay Installment
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                    {success}
                </Alert>
            )}

            <Box sx={{ mb: 3 }}>
                <TextField
                    label="Amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    InputProps={{
                        startAdornment: <span>₹</span>
                    }}
                    sx={{ mr: 2 }}
                />
                <Button
                    variant="contained"
                    onClick={handleSubmitPayment}
                    disabled={loading || selectedMembers.length === 0 || !amount}
                >
                    {loading ? <CircularProgress size={24} /> : 'Submit Payment'}
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell padding="checkbox">
                                <Checkbox
                                    checked={selectedMembers.length === members.length}
                                    indeterminate={selectedMembers.length > 0 && selectedMembers.length < members.length}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedMembers(members.map(m => m.id));
                                        } else {
                                            setSelectedMembers([]);
                                        }
                                    }}
                                />
                            </TableCell>
                            <TableCell>Member No.</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell align="right">Loan Amount</TableCell>
                            <TableCell align="right">Interest</TableCell>
                            <TableCell align="right">Installment</TableCell>
                            <TableCell align="right">Balance</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {members.map((member) => (
                            <TableRow key={member.id}>
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        checked={selectedMembers.includes(member.id)}
                                        onChange={() => handleSelectMember(member.id)}
                                    />
                                </TableCell>
                                <TableCell>{member.memberNumber}</TableCell>
                                <TableCell>{member.name}</TableCell>
                                <TableCell align="right">{formatCurrency(member.loanAmount || 0)}</TableCell>
                                <TableCell align="right">{formatCurrency(member.interest || 0)}</TableCell>
                                <TableCell align="right">{formatCurrency(member.installment || 0)}</TableCell>
                                <TableCell align="right">{formatCurrency(member.balance || 0)}</TableCell>
                                <TableCell>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={() => handleViewHistory(member.id)}
                                    >
                                        View History
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog
                open={historyDialog.open}
                onClose={() => setHistoryDialog({ open: false, memberId: null, history: [] })}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Transaction History</DialogTitle>
                <DialogContent>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Date</TableCell>
                                    <TableCell>Type</TableCell>
                                    <TableCell align="right">Amount</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {historyDialog.history.map((transaction) => (
                                    <TableRow key={transaction.id}>
                                        <TableCell>
                                            {new Date(transaction.date).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>{transaction.type}</TableCell>
                                        <TableCell align="right">
                                            {formatCurrency(transaction.amount)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setHistoryDialog({ open: false, memberId: null, history: [] })}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
