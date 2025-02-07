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
    CircularProgress,
    Stack,
    Grid,
    MenuItem,
    InputAdornment,
    IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { db } from '../config/firebase';
import { collection, query, onSnapshot, doc, updateDoc, addDoc, getDocs, where, orderBy } from 'firebase/firestore';

export default function PayInstallment() {
    const [members, setMembers] = useState([]);
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [selectedPaymentType, setSelectedPaymentType] = useState('');
    const [amount, setAmount] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [historyDialog, setHistoryDialog] = useState({ open: false, memberId: null, history: [] });

    const paymentTypes = [
        { value: 'initialDeposit', label: 'प्रारंभिक ठेव' },
        { value: 'monthlySaving', label: 'मासिक बचत' },
        { value: 'loanAmount', label: 'कर्ज रक्कम' },
        { value: 'interest', label: 'व्याज' },
        { value: 'installment', label: 'हप्ता' }
    ];

    useEffect(() => {
        const q = query(collection(db, 'members'));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            try {
                const membersData = [];
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    membersData.push({
                        id: doc.id,
                        memberNumber: String(data.memberNumber || '').trim(),
                        name: String(data.name || '').trim(),
                        loanAmount: Number(data.loanAmount) || 0,
                        interest: Number(data.interest) || 0,
                        installment: Number(data.installment) || 0,
                        balance: Number(data.balance) || 0,
                        initialDeposit: Number(data.initialDeposit) || 0,
                        monthlySaving: Number(data.monthlySaving) || 0,
                        updatedAt: data.updatedAt ? new Date(data.updatedAt.toDate()).toISOString() : null
                    });
                });

                // Sort by member number numerically
                const sortedData = membersData.sort((a, b) => {
                    const numA = parseInt(a.memberNumber);
                    const numB = parseInt(b.memberNumber);
                    return numA - numB;
                });
                
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

    const handleSubmitPayment = async () => {
        if (!amount || selectedMembers.length === 0 || !selectedPaymentType) {
            setError('कृपया सदस्य, रक्कम आणि पेमेंट प्रकार निवडा');
            return;
        }

        setLoading(true);
        try {
            for (const memberId of selectedMembers) {
                const member = members.find(m => m.id === memberId);
                if (!member) continue;

                // Update member data based on payment type
                const memberRef = doc(db, 'members', memberId);
                const updateData = {
                    updatedAt: selectedDate
                };

                // Update specific field based on payment type
                switch (selectedPaymentType) {
                    case 'initialDeposit':
                        updateData.initialDeposit = (Number(member.initialDeposit) || 0) + Number(amount);
                        break;
                    case 'monthlySaving':
                        updateData.monthlySaving = (Number(member.monthlySaving) || 0) + Number(amount);
                        break;
                    case 'loanAmount':
                        updateData.loanAmount = (Number(member.loanAmount) || 0) - Number(amount);
                        updateData.balance = (Number(member.balance) || 0) - Number(amount);
                        break;
                    case 'interest':
                        updateData.interest = (Number(member.interest) || 0) - Number(amount);
                        break;
                    case 'installment':
                        updateData.balance = (Number(member.balance) || 0) - Number(amount);
                        break;
                }

                await updateDoc(memberRef, updateData);

                // Record transaction
                await addDoc(collection(db, 'transactions'), {
                    memberId,
                    memberNumber: member.memberNumber,
                    memberName: member.name,
                    amount: Number(amount),
                    paymentType: selectedPaymentType,
                    paymentDate: selectedDate,
                    createdAt: new Date()
                });
            }

            setSuccess('पेमेंट यशस्वीरित्या जतन केले');
            setAmount('');
            setSelectedMembers([]);
            setSelectedPaymentType('');
        } catch (err) {
            setError('पेमेंट जतन करताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.');
            console.error('Error submitting payment:', err);
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

    const formatDate = (date) => {
        if (!date) return 'Invalid Date';
        try {
            return new Date(date).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch (error) {
            return 'Invalid Date';
        }
    };

    const handleViewHistory = async (memberId) => {
        try {
            const member = members.find(m => m.id === memberId);
            // First get all transactions for this member
            const q = query(
                collection(db, 'transactions'),
                where('memberId', '==', memberId)
            );
            
            const querySnapshot = await getDocs(q);
            const history = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                paymentDate: doc.data().paymentDate instanceof Date 
                    ? doc.data().paymentDate 
                    : doc.data().paymentDate?.toDate()
            }));

            // Sort the transactions in memory instead of using orderBy
            const sortedHistory = history.sort((a, b) => {
                const dateA = a.paymentDate ? new Date(a.paymentDate) : new Date(0);
                const dateB = b.paymentDate ? new Date(b.paymentDate) : new Date(0);
                return dateB - dateA; // Sort in descending order (newest first)
            });

            setHistoryDialog({
                open: true,
                memberId,
                memberName: member.name,
                memberNumber: member.memberNumber,
                history: sortedHistory
            });
        } catch (error) {
            console.error('Error fetching history:', error);
            setError('इतिहास लोड करताना त्रुटी आली');
        }
    };

    const getPaymentTypeLabel = (type) => {
        const paymentType = paymentTypes.find(pt => pt.value === type);
        return paymentType ? paymentType.label : type;
    };

    const handleSelectMember = (memberId) => {
        setSelectedMembers(prev => {
            if (prev.includes(memberId)) {
                return prev.filter(id => id !== memberId);
            } else {
                return [...prev, memberId];
            }
        });
    };

    const datePickerCustomStyles = {
        '& .react-datepicker-wrapper': {
            width: '100%'
        },
        '& .react-datepicker__input-container': {
            width: '100%'
        },
        '& input': {
            width: '100%',
            height: '56px',
            padding: '16.5px 14px',
            border: '1px solid rgba(0, 0, 0, 0.23)',
            borderRadius: '4px',
            fontSize: '1rem',
            fontFamily: 'inherit',
            '&:hover': {
                borderColor: '#000'
            },
            '&:focus': {
                borderColor: '#1976d2',
                borderWidth: '2px',
                outline: 'none'
            }
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
            <Typography variant="h5" gutterBottom>हप्ता भरणे</Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {success && (
                <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
                    {success}
                </Alert>
            )}

            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={4}>
                    <TextField
                        select
                        fullWidth
                        label="पेमेंट प्रकार"
                        value={selectedPaymentType}
                        onChange={(e) => setSelectedPaymentType(e.target.value)}
                        error={!selectedPaymentType && error}
                    >
                        {paymentTypes.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </TextField>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <TextField
                        fullWidth
                        label="रक्कम"
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        error={!amount && error}
                        InputProps={{
                            startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                        }}
                    />
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Box sx={datePickerCustomStyles}>
                        <DatePicker
                            selected={selectedDate}
                            onChange={date => setSelectedDate(date)}
                            dateFormat="dd/MM/yyyy"
                            placeholderText="पेमेंट तारीख"
                            customInput={
                                <input
                                    style={{
                                        width: '100%',
                                        height: '56px',
                                        padding: '16.5px 14px',
                                        border: '1px solid rgba(0, 0, 0, 0.23)',
                                        borderRadius: '4px',
                                        fontSize: '1rem',
                                        fontFamily: 'inherit'
                                    }}
                                />
                            }
                        />
                    </Box>
                </Grid>
            </Grid>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell padding="checkbox">
                                <Checkbox
                                    indeterminate={selectedMembers.length > 0 && selectedMembers.length < members.length}
                                    checked={members.length > 0 && selectedMembers.length === members.length}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedMembers(members.map(m => m.id));
                                        } else {
                                            setSelectedMembers([]);
                                        }
                                    }}
                                />
                            </TableCell>
                            <TableCell>सदस्य क्र.</TableCell>
                            <TableCell>नाव</TableCell>
                            <TableCell>प्रारंभिक ठेव</TableCell>
                            <TableCell>मासिक बचत</TableCell>
                            <TableCell>कर्ज रक्कम</TableCell>
                            <TableCell>व्याज</TableCell>
                            <TableCell>हप्ता</TableCell>
                            <TableCell>बाकी रक्कम</TableCell>
                            <TableCell>कृती</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {members.map((member) => (
                            <TableRow key={member.id}>
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        checked={selectedMembers.includes(member.id)}
                                        onChange={(event) => handleSelectMember(event, member.id)}
                                    />
                                </TableCell>
                                <TableCell>{member.memberNumber}</TableCell>
                                <TableCell>{member.name}</TableCell>
                                <TableCell>{formatCurrency(member.initialDeposit || 0)}</TableCell>
                                <TableCell>{formatCurrency(member.monthlySaving || 0)}</TableCell>
                                <TableCell>{formatCurrency(member.loanAmount)}</TableCell>
                                <TableCell>{member.interest}%</TableCell>
                                <TableCell>{formatCurrency(member.installment)}</TableCell>
                                <TableCell>{formatCurrency(member.balance)}</TableCell>
                                <TableCell>
                                    <Button
                                        size="small"
                                        onClick={() => handleViewHistory(member.id)}
                                        variant="outlined"
                                    >
                                        इतिहास पहा
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Button
                variant="contained"
                onClick={handleSubmitPayment}
                disabled={loading || selectedMembers.length === 0 || !amount || !selectedPaymentType}
                sx={{ mt: 2 }}
            >
                {loading ? <CircularProgress size={24} /> : 'Submit Payment'}
            </Button>

            <Dialog
                open={historyDialog.open}
                onClose={() => setHistoryDialog({ open: false, memberId: null, history: [] })}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6">
                            व्यवहार इतिहास - {historyDialog.memberName} ({historyDialog.memberNumber})
                        </Typography>
                        <IconButton
                            onClick={() => setHistoryDialog({ open: false, memberId: null, history: [] })}
                            size="small"
                        >
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    {historyDialog.history.length === 0 ? (
                        <Typography align="center" sx={{ py: 3 }}>
                            कोणताही व्यवहार इतिहास उपलब्ध नाही
                        </Typography>
                    ) : (
                        <TableContainer component={Paper} variant="outlined">
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>तारीख</TableCell>
                                        <TableCell>प्रकार</TableCell>
                                        <TableCell align="right">रक्कम</TableCell>
                                        <TableCell align="right">मागील शिल्लक</TableCell>
                                        <TableCell align="right">नवीन शिल्लक</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {historyDialog.history.map((transaction) => (
                                        <TableRow key={transaction.id}>
                                            <TableCell>
                                                {formatDate(transaction.paymentDate)}
                                            </TableCell>
                                            <TableCell>
                                                {getPaymentTypeLabel(transaction.paymentType)}
                                            </TableCell>
                                            <TableCell align="right">
                                                {formatCurrency(transaction.amount)}
                                            </TableCell>
                                            <TableCell align="right">
                                                {formatCurrency(transaction.previousBalance)}
                                            </TableCell>
                                            <TableCell align="right">
                                                {formatCurrency(transaction.newBalance)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button 
                        onClick={() => setHistoryDialog({ open: false, memberId: null, history: [] })}
                        variant="contained"
                    >
                        बंद करा
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
