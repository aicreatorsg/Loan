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
    CardContent,
    CircularProgress
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import { 
    doc, 
    updateDoc, 
    serverTimestamp, 
    query, 
    collection, 
    onSnapshot,
    getDocs,
    where 
} from 'firebase/firestore';
import { db } from '../config/firebase';

const AdminPanel = () => {
    const [members, setMembers] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);
    const [editedData, setEditedData] = useState(null);
    const [saving, setSaving] = useState(false);

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
                        updatedAt: data.updatedAt ? new Date(data.updatedAt.toDate()).toISOString() : null
                    });
                });

                // Create a map to store the latest entry for each member number
                const memberMap = new Map();
                membersData.forEach(member => {
                    const existingMember = memberMap.get(member.memberNumber);
                    if (!existingMember || (member.updatedAt && (!existingMember.updatedAt || new Date(member.updatedAt) > new Date(existingMember.updatedAt)))) {
                        memberMap.set(member.memberNumber, member);
                    }
                });

                // Convert map back to array and sort by member number
                const uniqueMembers = Array.from(memberMap.values());
                const sortedData = uniqueMembers.sort((a, b) => {
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

    const handleEditClick = (member) => {
        setSelectedMember(member);
        setEditedData({
            ...member,
            memberNumber: String(member.memberNumber || '').trim(),
            name: String(member.name || '').trim(),
            loanAmount: Number(member.loanAmount) || 0,
            interest: Number(member.interest) || 0,
            installment: Number(member.installment) || 0,
            balance: Number(member.balance) || 0
        });
        setEditDialogOpen(true);
    };

    const handleInputChange = (field, value) => {
        setEditedData(prev => ({
            ...prev,
            [field]: ['loanAmount', 'interest', 'installment', 'balance'].includes(field)
                ? Number(value) || 0
                : String(value)
        }));
    };

    const handleSave = async () => {
        try {
            setError(null);
            setSaving(true);

            // Validate required fields
            if (!String(editedData.name || '').trim()) {
                setError('Name is required');
                setSaving(false);
                return;
            }

            if (!String(editedData.memberNumber || '').trim()) {
                setError('Member Number is required');
                setSaving(false);
                return;
            }

            // Validate numeric fields
            const financialFields = ['loanAmount', 'interest', 'installment', 'balance'];
            for (const field of financialFields) {
                const value = Number(editedData[field]);
                if (isNaN(value) || value < 0) {
                    setError(`Invalid value for ${field}. Must be a non-negative number.`);
                    setSaving(false);
                    return;
                }
            }

            // Check if member number is being changed
            if (editedData.memberNumber !== selectedMember.memberNumber) {
                // Check for existing member with the new number
                const membersRef = collection(db, 'members');
                const q = query(membersRef, 
                    where("memberNumber", "==", String(editedData.memberNumber).trim()),
                    where("id", "!=", selectedMember.id)
                );
                const snapshot = await getDocs(q);
                
                if (!snapshot.empty) {
                    setError('This member number is already assigned to another member');
                    setSaving(false);
                    return;
                }
            }

            // Update the existing document
            const memberRef = doc(db, 'members', selectedMember.id);
            const updatedData = {
                name: String(editedData.name).trim(),
                memberNumber: String(editedData.memberNumber).trim(),
                loanAmount: Number(editedData.loanAmount),
                interest: Number(editedData.interest),
                installment: Number(editedData.installment),
                balance: Number(editedData.balance),
                updatedAt: serverTimestamp()
            };

            await updateDoc(memberRef, updatedData);
            setEditDialogOpen(false);
            setError(null);
        } catch (err) {
            console.error('Error updating member:', err);
            setError('Failed to update member. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Paper elevation={3} sx={{ p: 4, m: 4, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
            </Paper>
        );
    }

    return (
        <Box sx={{ width: '100%', mb: 2 }}>
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}
            
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="member table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Sr. No.</TableCell>
                            <TableCell>Member No.</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell align="right">Loan Amount</TableCell>
                            <TableCell align="right">Interest</TableCell>
                            <TableCell align="right">Installment</TableCell>
                            <TableCell align="right">Balance</TableCell>
                            <TableCell align="center">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {members.map((member, index) => (
                            <TableRow key={member.id}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{parseInt(member.memberNumber)}</TableCell>
                                <TableCell>{member.name}</TableCell>
                                <TableCell align="right">₹{member.loanAmount.toLocaleString('en-IN')}</TableCell>
                                <TableCell align="right">₹{member.interest.toLocaleString('en-IN')}</TableCell>
                                <TableCell align="right">₹{member.installment.toLocaleString('en-IN')}</TableCell>
                                <TableCell align="right">₹{member.balance.toLocaleString('en-IN')}</TableCell>
                                <TableCell align="center">
                                    <IconButton 
                                        onClick={() => handleEditClick(member)}
                                        color="primary"
                                        size="small"
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
                onClose={() => !saving && setEditDialogOpen(false)}
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
                    {!saving && (
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
                    )}
                </DialogTitle>
                <DialogContent sx={{ p: 3 }}>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}
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
                                                    disabled={saving}
                                                />
                                            </Grid>
                                            <Grid item xs={6}>
                                                <TextField
                                                    label="Name"
                                                    value={editedData.name}
                                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                                    fullWidth
                                                    margin="normal"
                                                    disabled={saving}
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
                                                    disabled={saving}
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
                                                    disabled={saving}
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
                                                    disabled={saving}
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
                                                    disabled={saving}
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
                        disabled={saving}
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleSave}
                        variant="contained"
                        startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                        disabled={saving}
                        sx={{ 
                            boxShadow: 2,
                            '&:hover': { boxShadow: 3 }
                        }}
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AdminPanel;
