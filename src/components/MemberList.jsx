import React, { useState, useEffect } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    Box,
    CircularProgress,
    Grid,
    Card,
    CardContent,
    Divider,
    IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { db } from '../config/firebase';
import { query, onSnapshot, collection } from 'firebase/firestore';

export default function MemberList() {
    const [members, setMembers] = useState([]);
    const [selectedMember, setSelectedMember] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);

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
                setLoading(false);
            } catch (error) {
                console.error('Error processing members:', error);
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    const handleMemberClick = async (memberId) => {
        try {
            const member = members.find(member => member.id === memberId);
            setSelectedMember(member);
            setDialogOpen(true);
        } catch (error) {
            console.error("Error loading member details:", error);
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
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <>
            <TableContainer 
                component={Paper} 
                sx={{ 
                    boxShadow: 3,
                    borderRadius: 2,
                    overflow: 'hidden'
                }}
            >
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                            <TableCell sx={{ fontWeight: 'bold' }}>सदस्य क्र.</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>नाव</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>प्रारंभिक ठेव</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>मासिक बचत</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>कर्ज रक्कम</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>व्याज</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>हप्ता</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>बाकी रक्कम</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>कृती</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {members.map((member, index) => (
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
                                <TableCell>{formatCurrency(member.initialDeposit || 0)}</TableCell>
                                <TableCell>{formatCurrency(member.monthlySaving || 0)}</TableCell>
                                <TableCell align="right">{formatCurrency(member.loanAmount)}</TableCell>
                                <TableCell align="right">{member.interest}%</TableCell>
                                <TableCell align="right">{formatCurrency(member.installment)}</TableCell>
                                <TableCell align="right">{formatCurrency(member.balance)}</TableCell>
                                <TableCell>
                                    <IconButton
                                        color="primary"
                                        onClick={() => handleMemberClick(member.id)}
                                        size="small"
                                        sx={{ 
                                            boxShadow: 1,
                                            '&:hover': { boxShadow: 2 }
                                        }}
                                    >
                                        <VisibilityIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog 
                open={dialogOpen} 
                onClose={() => setDialogOpen(false)}
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
                        Member Details
                    </Typography>
                    <IconButton
                        onClick={() => setDialogOpen(false)}
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
                    {selectedMember && (
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <Card sx={{ boxShadow: 2, mb: 2 }}>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom color="primary">
                                            Personal Information
                                        </Typography>
                                        <Grid container spacing={2}>
                                            <Grid item xs={6}>
                                                <Typography variant="subtitle2" color="textSecondary">
                                                    Member Number
                                                </Typography>
                                                <Typography variant="body1" gutterBottom>
                                                    {selectedMember.memberNumber}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="subtitle2" color="textSecondary">
                                                    Name
                                                </Typography>
                                                <Typography variant="body1" gutterBottom>
                                                    {selectedMember.name}
                                                </Typography>
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
                                                <Typography variant="subtitle2" color="textSecondary">
                                                    Loan Amount
                                                </Typography>
                                                <Typography variant="body1" gutterBottom>
                                                    {formatCurrency(selectedMember.loanAmount)}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={6} md={3}>
                                                <Typography variant="subtitle2" color="textSecondary">
                                                    Interest
                                                </Typography>
                                                <Typography variant="body1" gutterBottom>
                                                    {selectedMember.interest}%
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={6} md={3}>
                                                <Typography variant="subtitle2" color="textSecondary">
                                                    Installment
                                                </Typography>
                                                <Typography variant="body1" gutterBottom>
                                                    {formatCurrency(selectedMember.installment)}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={6} md={3}>
                                                <Typography variant="subtitle2" color="textSecondary">
                                                    Balance
                                                </Typography>
                                                <Typography variant="body1" gutterBottom>
                                                    {formatCurrency(selectedMember.balance)}
                                                </Typography>
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
                        onClick={() => setDialogOpen(false)}
                        variant="contained"
                        sx={{ 
                            boxShadow: 2,
                            '&:hover': { boxShadow: 3 }
                        }}
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
