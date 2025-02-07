import React, { useState, useEffect } from 'react';
import {
    Paper,
    Typography,
    Box,
    Grid,
    Card,
    CardContent,
    Button,
    Alert,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    tableCellClasses
} from '@mui/material';
import { styled } from '@mui/material/styles';
import DescriptionIcon from '@mui/icons-material/Description';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../config/firebase';

// Styled components for table
const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.common.white,
        fontWeight: 'bold',
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
    },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover,
    },
    '&:hover': {
        backgroundColor: theme.palette.action.selected,
    },
}));

export default function Reports() {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
                setError('Failed to process members data');
                console.error('Error processing members:', err);
            } finally {
                setLoading(false);
            }
        }, (error) => {
            setError('Failed to fetch members data');
            console.error('Error fetching members:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const calculateNextMonthInterest = (balance) => {
        // 24% annual interest = 2% monthly
        return (balance * 0.02);
    };

    const calculateTotals = (data) => {
        return data.reduce((acc, member) => ({
            totalLoanAmount: acc.totalLoanAmount + (Number(member.loanAmount) || 0),
            totalInterest: acc.totalInterest + (Number(member.interest) || 0),
            totalInstallment: acc.totalInstallment + (Number(member.installment) || 0),
            totalBalance: acc.totalBalance + (Number(member.balance) || 0),
            totalInitialDeposit: acc.totalInitialDeposit + (Number(member.initialDeposit) || 0),
            totalMonthlySaving: acc.totalMonthlySaving + (Number(member.monthlySaving) || 0)
        }), {
            totalLoanAmount: 0,
            totalInterest: 0,
            totalInstallment: 0,
            totalBalance: 0,
            totalInitialDeposit: 0,
            totalMonthlySaving: 0
        });
    };

    const totals = calculateTotals(members);

    const generateDetailedMemberReport = async () => {
        try {
            setLoading(true);
            const doc = new jsPDF();
            
            // Set font
            doc.setFont('helvetica');
            
            // Title
            doc.setFontSize(18);
            doc.text('Member Report', doc.internal.pageSize.width/2, 15, { align: 'center' });
            
            // Date
            doc.setFontSize(10);
            doc.text(`Report Generated: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, doc.internal.pageSize.width/2, 25, { align: 'center' });

            // Summary Statistics
            const uniqueMembers = [...new Set(members.map(m => m.memberNumber))].length;
            const totalLoanAmount = members.reduce((sum, member) => sum + (member.loanAmount || 0), 0);
            const totalBalance = members.reduce((sum, member) => sum + (member.balance || 0), 0);
            const totalInterest = members.reduce((sum, member) => sum + (member.interest || 0), 0);

            // Summary Box
            doc.setFillColor(240, 240, 240);
            doc.rect(14, 35, 182, 35, 'F');
            doc.setFontSize(12);
            doc.setTextColor(0, 0, 0);
            doc.text('Summary', 20, 45);
            doc.setFontSize(10);
            const summaryData = [
                [`Total Members: ${uniqueMembers}`, `Total Loan Amount: ${formatCurrency(totalLoanAmount)}`],
                [`Total Interest: ${formatCurrency(totalInterest)}`, `Outstanding Balance: ${formatCurrency(totalBalance)}`]
            ];
            
            let yPos = 55;
            summaryData.forEach(row => {
                doc.text(row[0], 20, yPos);
                doc.text(row[1], 120, yPos);
                yPos += 10;
            });

            // Remove duplicate entries and sort by member number
            const uniqueMembersList = Array.from(
                new Map(members.map(item => [item.memberNumber, item])).values()
            ).sort((a, b) => Number(a.memberNumber) - Number(b.memberNumber));

            // Member Details Table
            const tableData = uniqueMembersList.map(member => [
                member.memberNumber.toString().padStart(3, '0'),
                member.name || '-',
                formatCurrency(member.loanAmount || 0),
                formatCurrency(member.interest || 0),
                formatCurrency(member.installment || 0),
                formatCurrency(member.balance || 0)
            ]);

            doc.autoTable({
                startY: 80,
                head: [['Member No.', 'Name', 'Loan Amount', 'Interest', 'Installment', 'Balance']],
                body: tableData,
                theme: 'grid',
                styles: {
                    fontSize: 9,
                    cellPadding: 3,
                    font: 'helvetica',
                    textColor: [0, 0, 0]
                },
                headStyles: {
                    fillColor: [51, 51, 51],
                    textColor: [255, 255, 255],
                    fontSize: 10,
                    fontStyle: 'bold',
                    halign: 'center'
                },
                columnStyles: {
                    0: { halign: 'center', cellWidth: 25 },
                    1: { halign: 'left', cellWidth: 45 },
                    2: { halign: 'right', cellWidth: 30 },
                    3: { halign: 'right', cellWidth: 30 },
                    4: { halign: 'right', cellWidth: 30 },
                    5: { halign: 'right', cellWidth: 30 }
                },
                alternateRowStyles: {
                    fillColor: [245, 245, 245]
                },
                margin: { left: 10, right: 10 },
                didDrawPage: function (data) {
                    // Header
                    doc.setFontSize(18);
                    doc.text('Member Report', doc.internal.pageSize.width/2, 15, { align: 'center' });
                    
                    // Page number
                    doc.setFontSize(10);
                    doc.text(
                        `Page ${doc.internal.getCurrentPageInfo().pageNumber} of ${doc.internal.getNumberOfPages()}`,
                        doc.internal.pageSize.width - 20,
                        doc.internal.pageSize.height - 10
                    );
                }
            });

            // Footer
            const pageCount = doc.internal.getNumberOfPages();
            for(let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.text(
                    `Generated by Loan Management System - ${format(new Date(), 'dd/MM/yyyy HH:mm')}`,
                    14,
                    doc.internal.pageSize.height - 10
                );
            }

            doc.save(`member-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
            setLoading(false);
        } catch (err) {
            setError('Failed to generate report');
            console.error('Error generating report:', err);
            setLoading(false);
        }
    };

    const generateTransactionReport = async () => {
        try {
            setLoading(true);
            const doc = new jsPDF();
            
            // Title
            doc.setFontSize(20);
            doc.text('Transaction History Report', 14, 15);
            
            // Date
            doc.setFontSize(10);
            doc.text(`Generated on: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 25);

            let yPosition = 40;

            // Get transactions for each member
            for (const member of members) {
                const transactions = await getTransactionsByMemberId(member.id);
                
                if (transactions.length > 0) {
                    // Member header
                    if (yPosition > 250) {
                        doc.addPage();
                        yPosition = 20;
                    }

                    doc.setFontSize(12);
                    doc.text(`Member: ${member.name} (${member.memberNumber})`, 14, yPosition);
                    
                    // Transaction table
                    const tableData = transactions.map(trans => [
                        format(new Date(trans.date.seconds * 1000), 'dd/MM/yyyy HH:mm'),
                        trans.type,
                        formatCurrency(trans.amount),
                        formatCurrency(trans.previousBalance),
                        formatCurrency(trans.newBalance)
                    ]);

                    doc.autoTable({
                        head: [['Date', 'Type', 'Amount', 'Previous Balance', 'New Balance']],
                        body: tableData,
                        startY: yPosition + 5,
                        styles: { fontSize: 8 },
                        headStyles: { fillColor: [66, 66, 66] },
                        alternateRowStyles: { fillColor: [245, 245, 245] }
                    });

                    yPosition = doc.lastAutoTable.finalY + 20;
                }
            }

            doc.save(`transaction-history-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
            setLoading(false);
        } catch (err) {
            setError('Failed to generate transaction report');
            console.error('Error generating transaction report:', err);
            setLoading(false);
        }
    };

    const downloadExcel = () => {
        try {
            setLoading(true);
            
            // Create CSV content starting with summary
            let csvContent = "Summary\n";
            csvContent += `Total Members,${members.length}\n`;
            csvContent += `Total Loan Amount,${totals.totalLoanAmount}\n`;
            csvContent += `Total Interest,${totals.totalInterest}\n`;
            csvContent += `Outstanding Balance,${totals.totalBalance}\n`;
            csvContent += `Next Month Total Interest,${totals.nextMonthInterest}\n\n`;

            // Add table headers
            csvContent += "Member No.,Name,Loan Amount,Interest,Installment,Balance,Next Month Interest\n";
            
            // Add member data
            members.forEach(member => {
                const nextMonthInterest = calculateNextMonthInterest(member.balance || 0);
                csvContent += [
                    member.memberNumber.toString().padStart(3, '0'),
                    member.name || '-',
                    member.loanAmount || 0,
                    member.interest || 0,
                    member.installment || 0,
                    member.balance || 0,
                    nextMonthInterest
                ].join(',') + '\n';
            });

            // Add totals row
            csvContent += `Totals,,${totals.totalLoanAmount},${totals.totalInterest},${totals.totalInstallment},${totals.totalBalance},${totals.nextMonthInterest}\n`;

            // Create blob and download
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", `member-report-${format(new Date(), 'yyyy-MM-dd')}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setLoading(false);
        } catch (err) {
            setError('Failed to generate Excel report');
            console.error('Error generating Excel report:', err);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Paper elevation={3} sx={{ p: 4, m: 4 }}>
            <Typography variant="h5" gutterBottom>
                Member Report
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {/* Summary Cards */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid item xs={12} md={4}>
                    <Card sx={{ bgcolor: 'primary.light', color: 'white' }}>
                        <CardContent>
                            <Typography variant="h6">Total Members</Typography>
                            <Typography variant="h4">{members.length}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card sx={{ bgcolor: 'success.light', color: 'white' }}>
                        <CardContent>
                            <Typography variant="h6">Total Balance</Typography>
                            <Typography variant="h4">{formatCurrency(totals.totalBalance)}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card sx={{ bgcolor: 'warning.light', color: 'white' }}>
                        <CardContent>
                            <Typography variant="h6">Next Month Interest (24% p.a.)</Typography>
                            <Typography variant="h4">{formatCurrency(calculateNextMonthInterest(totals.totalBalance))}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card sx={{ bgcolor: 'info.light', color: 'white' }}>
                        <CardContent>
                            <Typography variant="h6">Total Initial Deposit</Typography>
                            <Typography variant="h4">{formatCurrency(totals.totalInitialDeposit)}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card sx={{ bgcolor: 'error.light', color: 'white' }}>
                        <CardContent>
                            <Typography variant="h6">Total Monthly Saving</Typography>
                            <Typography variant="h4">{formatCurrency(totals.totalMonthlySaving)}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Member Data Table */}
            <TableContainer component={Paper} sx={{ mb: 4, boxShadow: 3 }}>
                <Table sx={{ minWidth: 700 }} aria-label="customized table">
                    <TableHead>
                        <TableRow>
                            <StyledTableCell>Member No.</StyledTableCell>
                            <StyledTableCell>Name</StyledTableCell>
                            <StyledTableCell align="right">Initial Deposit</StyledTableCell>
                            <StyledTableCell align="right">Monthly Saving</StyledTableCell>
                            <StyledTableCell align="right">Loan Amount</StyledTableCell>
                            <StyledTableCell align="right">Interest</StyledTableCell>
                            <StyledTableCell align="right">Installment</StyledTableCell>
                            <StyledTableCell align="right">Balance</StyledTableCell>
                            <StyledTableCell align="right">Next Month Interest</StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {members.map((member) => (
                            <StyledTableRow key={member.memberNumber}>
                                <StyledTableCell>
                                    {member.memberNumber.toString().padStart(3, '0')}
                                </StyledTableCell>
                                <StyledTableCell>{member.name}</StyledTableCell>
                                <StyledTableCell align="right">
                                    {formatCurrency(member.initialDeposit || 0)}
                                </StyledTableCell>
                                <StyledTableCell align="right">
                                    {formatCurrency(member.monthlySaving || 0)}
                                </StyledTableCell>
                                <StyledTableCell align="right">
                                    {formatCurrency(member.loanAmount || 0)}
                                </StyledTableCell>
                                <StyledTableCell align="right">
                                    {formatCurrency(member.interest || 0)}
                                </StyledTableCell>
                                <StyledTableCell align="right">
                                    {formatCurrency(member.installment || 0)}
                                </StyledTableCell>
                                <StyledTableCell align="right">
                                    {formatCurrency(member.balance || 0)}
                                </StyledTableCell>
                                <StyledTableCell align="right">
                                    {formatCurrency(calculateNextMonthInterest(member.balance || 0))}
                                </StyledTableCell>
                            </StyledTableRow>
                        ))}
                        {/* Totals Row */}
                        <StyledTableRow>
                            <StyledTableCell colSpan={2} sx={{ fontWeight: 'bold' }}>
                                Totals
                            </StyledTableCell>
                            <StyledTableCell align="right" sx={{ fontWeight: 'bold' }}>
                                {formatCurrency(totals.totalInitialDeposit)}
                            </StyledTableCell>
                            <StyledTableCell align="right" sx={{ fontWeight: 'bold' }}>
                                {formatCurrency(totals.totalMonthlySaving)}
                            </StyledTableCell>
                            <StyledTableCell align="right" sx={{ fontWeight: 'bold' }}>
                                {formatCurrency(totals.totalLoanAmount)}
                            </StyledTableCell>
                            <StyledTableCell align="right" sx={{ fontWeight: 'bold' }}>
                                {formatCurrency(totals.totalInterest)}
                            </StyledTableCell>
                            <StyledTableCell align="right" sx={{ fontWeight: 'bold' }}>
                                {formatCurrency(totals.totalInstallment)}
                            </StyledTableCell>
                            <StyledTableCell align="right" sx={{ fontWeight: 'bold' }}>
                                {formatCurrency(totals.totalBalance)}
                            </StyledTableCell>
                            <StyledTableCell align="right" sx={{ fontWeight: 'bold' }}>
                                {formatCurrency(calculateNextMonthInterest(totals.totalBalance))}
                            </StyledTableCell>
                        </StyledTableRow>
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Export Buttons */}
            <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button
                    variant="contained"
                    startIcon={<DescriptionIcon />}
                    onClick={generateDetailedMemberReport}
                    disabled={loading}
                    sx={{ 
                        minWidth: '200px',
                        bgcolor: 'primary.main',
                        '&:hover': { bgcolor: 'primary.dark' }
                    }}
                >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Download PDF Report'}
                </Button>

                <Button
                    variant="contained"
                    startIcon={<DescriptionIcon />}
                    onClick={downloadExcel}
                    disabled={loading}
                    sx={{ 
                        minWidth: '200px',
                        bgcolor: 'success.main',
                        '&:hover': { bgcolor: 'success.dark' }
                    }}
                >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Download Excel Report'}
                </Button>

                <Button
                    variant="contained"
                    startIcon={<DescriptionIcon />}
                    onClick={generateTransactionReport}
                    disabled={loading}
                    sx={{ 
                        minWidth: '200px',
                        bgcolor: 'warning.main',
                        '&:hover': { bgcolor: 'warning.dark' }
                    }}
                >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Download Transaction History'}
                </Button>
            </Box>
        </Paper>
    );
}
