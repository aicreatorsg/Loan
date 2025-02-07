import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    IconButton,
    TextField,
    Typography,
    Paper,
    Snackbar,
    Alert,
    Grid,
    CircularProgress,
    Tooltip
} from '@mui/material';
import {
    DataGrid,
    GridToolbar
} from '@mui/x-data-grid';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
    DeleteSweep as DeleteSweepIcon
} from '@mui/icons-material';
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export default function MemberManagement() {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [selectedRows, setSelectedRows] = useState([]);
    const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        memberNumber: '',
        name: '',
        phoneNumber: '',
        aadharNumber: '',
        panNumber: '',
        loanAmount: '',
        balance: '',
        interestRate: '',
        address: '',
        nomineeName: '',
        nomineeRelation: '',
        nomineePhone: '',
        initialDeposit: '',
        monthlySaving: ''
    });

    useEffect(() => {
        const unsubscribe = onSnapshot(
            query(collection(db, 'members')),
            (snapshot) => {
                const membersData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setMembers(membersData);
                setLoading(false);
            },
            (error) => {
                console.error('Error fetching members:', error);
                setSnackbar({
                    open: true,
                    message: 'Error fetching members data',
                    severity: 'error'
                });
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    const handleEditClick = (member) => {
        setSelectedMember(member);
        setFormData({
            memberNumber: member.memberNumber || '',
            name: member.name || '',
            phoneNumber: member.phoneNumber || '',
            aadharNumber: member.aadharNumber || '',
            panNumber: member.panNumber || '',
            loanAmount: member.loanAmount || '',
            balance: member.balance || '',
            interestRate: member.interestRate || '',
            address: member.address || '',
            nomineeName: member.nomineeName || '',
            nomineeRelation: member.nomineeRelation || '',
            nomineePhone: member.nomineePhone || '',
            initialDeposit: member.initialDeposit || '',
            monthlySaving: member.monthlySaving || ''
        });
        setEditDialogOpen(true);
    };

    const handleDeleteClick = (member) => {
        setSelectedMember(member);
        setDeleteDialogOpen(true);
    };

    const handleAddNew = () => {
        setSelectedMember(null);
        setFormData({
            memberNumber: '',
            name: '',
            phoneNumber: '',
            aadharNumber: '',
            panNumber: '',
            loanAmount: '',
            balance: '',
            interestRate: '2',
            address: '',
            nomineeName: '',
            nomineeRelation: '',
            nomineePhone: '',
            initialDeposit: '',
            monthlySaving: ''
        });
        setEditDialogOpen(true);
    };

    const handleSave = async () => {
        try {
            if (selectedMember) {
                // Update existing member
                await updateDoc(doc(db, 'members', selectedMember.id), formData);
                setSnackbar({
                    open: true,
                    message: 'Member updated successfully',
                    severity: 'success'
                });
            } else {
                // Add new member
                await addDoc(collection(db, 'members'), {
                    ...formData,
                    createdAt: new Date().toISOString()
                });
                setSnackbar({
                    open: true,
                    message: 'Member added successfully',
                    severity: 'success'
                });
            }
            setEditDialogOpen(false);
        } catch (error) {
            console.error('Error saving member:', error);
            setSnackbar({
                open: true,
                message: 'Error saving member data',
                severity: 'error'
            });
        }
    };

    const handleDeleteSingleMember = async (member) => {
        try {
            setLoading(true);
            const memberRef = doc(db, 'members', member.id);
            await deleteDoc(memberRef);
            
            setSnackbar({
                open: true,
                message: 'सदस्य यशस्वीरित्या हटवला',
                severity: 'success'
            });
        } catch (error) {
            console.error('Error deleting member:', error);
            setSnackbar({
                open: true,
                message: 'सदस्य हटवताना त्रुटी आली',
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            await deleteDoc(doc(db, 'members', selectedMember.id));
            setSnackbar({
                open: true,
                message: 'Member deleted successfully',
                severity: 'success'
            });
            setDeleteDialogOpen(false);
        } catch (error) {
            console.error('Error deleting member:', error);
            setSnackbar({
                open: true,
                message: 'Error deleting member',
                severity: 'error'
            });
        }
    };

    const handleBulkDelete = async () => {
        try {
            setLoading(true);
            const batch = [];
            
            // Create delete promises for each selected member
            selectedRows.forEach((memberId) => {
                const memberRef = doc(db, 'members', memberId);
                batch.push(deleteDoc(memberRef));
            });

            // Execute all deletes in parallel
            await Promise.all(batch);

            setSnackbar({
                open: true,
                message: `${selectedRows.length} सदस्य यशस्वीरित्या हटवले`,
                severity: 'success'
            });
            setBulkDeleteDialogOpen(false);
            setSelectedRows([]);
        } catch (error) {
            console.error('Error deleting members:', error);
            setSnackbar({
                open: true,
                message: 'सदस्य हटवताना त्रुटी आली',
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSelectionChange = (newSelectionModel) => {
        setSelectedRows(newSelectionModel);
    };

    const columns = [
        { field: 'memberNumber', headerName: 'सदस्य क्रमांक', width: 130 },
        { field: 'name', headerName: 'नाव', width: 200 },
        {
            field: 'initialDeposit',
            headerName: 'प्रारंभिक ठेव',
            width: 130,
            type: 'number',
            valueFormatter: (params) => {
                const value = params?.value;
                if (value == null || isNaN(value)) return '';
                return `₹${Number(value).toLocaleString('en-IN')}`;
            }
        },
        {
            field: 'monthlySaving',
            headerName: 'मासिक बचत',
            width: 130,
            type: 'number',
            valueFormatter: (params) => {
                const value = params?.value;
                if (value == null || isNaN(value)) return '';
                return `₹${Number(value).toLocaleString('en-IN')}`;
            }
        },
        {
            field: 'loanAmount',
            headerName: 'कर्ज रक्कम',
            width: 130,
            type: 'number',
            valueFormatter: (params) => {
                const value = params?.value;
                if (value == null || isNaN(value)) return '';
                return `₹${Number(value).toLocaleString('en-IN')}`;
            }
        },
        {
            field: 'balance',
            headerName: 'बाकी रक्कम',
            width: 130,
            type: 'number',
            valueFormatter: (params) => {
                const value = params?.value;
                if (value == null || isNaN(value)) return '';
                return `₹${Number(value).toLocaleString('en-IN')}`;
            }
        },
        {
            field: 'interestRate',
            headerName: 'व्याज दर',
            width: 100,
            valueFormatter: (params) => {
                const value = params?.value;
                if (value == null || isNaN(value)) return '';
                return `${value}%`;
            }
        },
        {
            field: 'actions',
            headerName: 'कृती',
            width: 150,
            sortable: false,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="सदस्य माहिती बदला">
                        <IconButton
                            color="primary"
                            onClick={() => handleEditClick(params.row)}
                            size="small"
                            sx={{
                                '&:hover': {
                                    backgroundColor: 'primary.lighter'
                                }
                            }}
                        >
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="सदस्य हटवा">
                        <IconButton
                            color="error"
                            onClick={() => {
                                setSelectedMember(params.row);
                                setDeleteDialogOpen(true);
                            }}
                            size="small"
                            sx={{
                                '&:hover': {
                                    backgroundColor: 'error.lighter'
                                }
                            }}
                        >
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
            )
        }
    ];

    return (
        <Box sx={{ height: '100%', width: '100%', p: 3 }}>
            <Paper sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Box>
                        <Typography variant="h5" gutterBottom>सदस्य व्यवस्थापन</Typography>
                        {selectedRows.length > 0 && (
                            <Typography variant="subtitle1" color="text.secondary">
                                {selectedRows.length} सदस्य निवडले
                            </Typography>
                        )}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                            variant="contained"
                            color="error"
                            startIcon={<DeleteSweepIcon />}
                            onClick={() => setBulkDeleteDialogOpen(true)}
                            disabled={selectedRows.length === 0}
                            sx={{
                                bgcolor: selectedRows.length > 0 ? 'error.main' : 'grey.400',
                                '&:hover': {
                                    bgcolor: selectedRows.length > 0 ? 'error.dark' : 'grey.500'
                                }
                            }}
                        >
                            निवडलेले हटवा {selectedRows.length > 0 ? `(${selectedRows.length})` : ''}
                        </Button>
                        <Button
                            variant="outlined"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={() => {
                                if (members.length > 0) {
                                    const allIds = members.map(member => member.id);
                                    setSelectedRows(allIds);
                                    setBulkDeleteDialogOpen(true);
                                }
                            }}
                            sx={{
                                borderColor: 'error.main',
                                color: 'error.main',
                                '&:hover': {
                                    bgcolor: 'error.lighter',
                                    borderColor: 'error.dark'
                                },
                                '&:disabled': {
                                    borderColor: 'grey.300',
                                    color: 'grey.500'
                                }
                            }}
                            disabled={members.length === 0}
                        >
                            सर्व सदस्य हटवा
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={handleAddNew}
                            sx={{
                                bgcolor: 'primary.main',
                                '&:hover': {
                                    bgcolor: 'primary.dark'
                                }
                            }}
                        >
                            नवीन सदस्य जोडा
                        </Button>
                    </Box>
                </Box>

                <div style={{ height: 600, width: '100%' }}>
                    <DataGrid
                        rows={members}
                        columns={columns}
                        loading={loading}
                        checkboxSelection
                        disableSelectionOnClick
                        getRowId={(row) => row.id}
                        onSelectionModelChange={handleSelectionChange}
                        selectionModel={selectedRows}
                        components={{
                            Toolbar: GridToolbar
                        }}
                        componentsProps={{
                            toolbar: {
                                showQuickFilter: true,
                                quickFilterProps: { debounceMs: 500 }
                            }
                        }}
                        sx={{
                            '& .MuiDataGrid-cell': {
                                fontSize: '1rem'
                            },
                            '& .MuiDataGrid-columnHeader': {
                                backgroundColor: 'primary.main',
                                color: 'white',
                                fontWeight: 'bold'
                            },
                            '& .MuiDataGrid-row.Mui-selected': {
                                backgroundColor: 'action.selected',
                                '&:hover': {
                                    backgroundColor: 'action.hover'
                                }
                            },
                            '& .MuiDataGrid-checkboxInput': {
                                color: 'primary.main'
                            }
                        }}
                    />
                </div>
            </Paper>

            {/* Edit/Add Dialog */}
            <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    {selectedMember ? 'सदस्य माहिती संपादित करा' : 'नवीन सदस्य जोडा'}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="सदस्य क्रमांक"
                                value={formData.memberNumber}
                                onChange={(e) => setFormData({ ...formData, memberNumber: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="नाव"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="फोन नंबर"
                                value={formData.phoneNumber}
                                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="आधार क्रमांक"
                                value={formData.aadharNumber}
                                onChange={(e) => setFormData({ ...formData, aadharNumber: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="पॅन क्रमांक"
                                value={formData.panNumber}
                                onChange={(e) => setFormData({ ...formData, panNumber: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="कर्ज रक्कम"
                                type="number"
                                value={formData.loanAmount}
                                onChange={(e) => setFormData({ ...formData, loanAmount: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="बाकी रक्कम"
                                type="number"
                                value={formData.balance}
                                onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="व्याज दर (%)"
                                type="number"
                                value={formData.interestRate}
                                onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="पत्ता"
                                multiline
                                rows={2}
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="नॉमिनी नाव"
                                value={formData.nomineeName}
                                onChange={(e) => setFormData({ ...formData, nomineeName: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="नॉमिनी नाते"
                                value={formData.nomineeRelation}
                                onChange={(e) => setFormData({ ...formData, nomineeRelation: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="नॉमिनी फोन"
                                value={formData.nomineePhone}
                                onChange={(e) => setFormData({ ...formData, nomineePhone: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="प्रारंभिक ठेव"
                                type="number"
                                value={formData.initialDeposit}
                                onChange={(e) => setFormData({ ...formData, initialDeposit: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="मासिक बचत"
                                type="number"
                                value={formData.monthlySaving}
                                onChange={(e) => setFormData({ ...formData, monthlySaving: e.target.value })}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditDialogOpen(false)}>रद्द करा</Button>
                    <Button onClick={handleSave} variant="contained">
                        {selectedMember ? 'अपडेट करा' : 'जोडा'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => !loading && setDeleteDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    bgcolor: 'error.main',
                    color: 'white'
                }}>
                    <DeleteIcon />
                    सदस्य हटवा
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    <DialogContentText>
                        <Box sx={{ mb: 2 }}>
                            तुम्हाला खात्री आहे की तुम्ही <strong>{selectedMember?.name}</strong> या सदस्याला हटवू इच्छिता?
                        </Box>
                        <Typography color="error" variant="body2" sx={{ 
                            p: 2, 
                            bgcolor: 'error.lighter',
                            borderRadius: 1,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                        }}>
                            <DeleteIcon fontSize="small" />
                            सावधान: ही क्रिया पूर्ववत केली जाऊ शकत नाही.
                        </Typography>
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Button
                        onClick={() => setDeleteDialogOpen(false)}
                        disabled={loading}
                        sx={{ mr: 1 }}
                    >
                        रद्द करा
                    </Button>
                    <Button
                        onClick={() => {
                            handleDeleteSingleMember(selectedMember);
                            setDeleteDialogOpen(false);
                        }}
                        color="error"
                        variant="contained"
                        disabled={loading}
                        startIcon={loading ? (
                            <CircularProgress size={20} color="inherit" />
                        ) : (
                            <DeleteIcon />
                        )}
                    >
                        {loading ? 'हटवत आहे...' : 'हटवा'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Bulk Delete Confirmation Dialog */}
            <Dialog
                open={bulkDeleteDialogOpen}
                onClose={() => !loading && setBulkDeleteDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    bgcolor: 'error.main',
                    color: 'white'
                }}>
                    <DeleteSweepIcon />
                    एकाधिक सदस्य हटवा
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    <DialogContentText>
                        <Box sx={{ mb: 2 }}>
                            तुम्हाला खात्री आहे की तुम्ही निवडलेले <strong>{selectedRows.length}</strong> सदस्य हटवू इच्छिता?
                        </Box>
                        <Typography color="error" variant="body2" sx={{ 
                            p: 2, 
                            bgcolor: 'error.lighter',
                            borderRadius: 1,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                        }}>
                            <DeleteIcon fontSize="small" />
                            सावधान: ही क्रिया पूर्ववत केली जाऊ शकत नाही.
                        </Typography>
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Button
                        onClick={() => setBulkDeleteDialogOpen(false)}
                        disabled={loading}
                        sx={{ mr: 1 }}
                    >
                        रद्द करा
                    </Button>
                    <Button
                        onClick={handleBulkDelete}
                        color="error"
                        variant="contained"
                        disabled={loading}
                        startIcon={loading ? (
                            <CircularProgress size={20} color="inherit" />
                        ) : (
                            <DeleteSweepIcon />
                        )}
                    >
                        {loading ? 'हटवत आहे...' : `${selectedRows.length} सदस्य हटवा`}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
