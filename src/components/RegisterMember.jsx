import React, { useState, useEffect } from 'react';
import {
    Box,
    TextField,
    Button,
    Typography,
    Paper,
    Alert,
    CircularProgress,
    Grid,
    InputAdornment
} from '@mui/material';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { db } from '../config/firebase';
import { collection, query, getDocs, addDoc, where } from 'firebase/firestore';

export default function RegisterMember() {
    const [formData, setFormData] = useState({
        memberNumber: '',
        name: '',
        address: '',
        phoneNumber: '',
        loanAmount: '',
        interest: '',
        installment: '',
        balance: '',
        aadharNumber: '',
        panNumber: '',
        nomineeDetails: '',
        joiningDate: new Date(),
        initialDeposit: '',
        monthlySaving: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateForm = async () => {
        // Basic validation
        if (!formData.memberNumber || !formData.name || !formData.loanAmount) {
            throw new Error('Member Number, Name, and Loan Amount are required');
        }

        // Validate member number uniqueness
        const memberQuery = query(
            collection(db, 'members'),
            where('memberNumber', '==', formData.memberNumber)
        );
        const memberSnapshot = await getDocs(memberQuery);
        if (!memberSnapshot.empty) {
            throw new Error('Member Number already exists');
        }

        // Validate phone number format
        const phoneRegex = /^[0-9]{10}$/;
        if (formData.phoneNumber && !phoneRegex.test(formData.phoneNumber)) {
            throw new Error('Invalid phone number format');
        }

        // Validate Aadhar number format
        const aadharRegex = /^[0-9]{12}$/;
        if (formData.aadharNumber && !aadharRegex.test(formData.aadharNumber)) {
            throw new Error('Invalid Aadhar number format');
        }

        // Validate PAN number format
        const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
        if (formData.panNumber && !panRegex.test(formData.panNumber)) {
            throw new Error('Invalid PAN number format');
        }

        // Validate numeric fields
        if (isNaN(Number(formData.loanAmount)) || Number(formData.loanAmount) <= 0) {
            throw new Error('Invalid loan amount');
        }
        if (isNaN(Number(formData.interest)) || Number(formData.interest) < 0) {
            throw new Error('Invalid interest amount');
        }
        if (isNaN(Number(formData.installment)) || Number(formData.installment) < 0) {
            throw new Error('Invalid installment amount');
        }
        if (isNaN(Number(formData.initialDeposit)) || Number(formData.initialDeposit) < 0) {
            throw new Error('Invalid initial deposit');
        }
        if (isNaN(Number(formData.monthlySaving)) || Number(formData.monthlySaving) < 0) {
            throw new Error('Invalid monthly saving');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            await validateForm();

            // Calculate initial balance
            const balance = Number(formData.loanAmount);

            // Prepare member data
            const memberData = {
                ...formData,
                memberNumber: formData.memberNumber.trim(),
                name: formData.name.trim(),
                loanAmount: Number(formData.loanAmount),
                interest: Number(formData.interest || 0),
                installment: Number(formData.installment || 0),
                balance: balance,
                initialDeposit: Number(formData.initialDeposit || 0),
                monthlySaving: Number(formData.monthlySaving || 0),
                createdAt: new Date(),
                updatedAt: new Date(),
                joiningDate: formData.joiningDate
            };

            // Add to Firestore
            await addDoc(collection(db, 'members'), memberData);

            setSuccess('Member registered successfully');
            // Reset form
            setFormData({
                memberNumber: '',
                name: '',
                address: '',
                phoneNumber: '',
                loanAmount: '',
                interest: '',
                installment: '',
                balance: '',
                aadharNumber: '',
                panNumber: '',
                nomineeDetails: '',
                joiningDate: new Date(),
                initialDeposit: '',
                monthlySaving: ''
            });
        } catch (err) {
            setError(err.message);
            console.error('Error registering member:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
                Register New Member
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

            <Paper sx={{ p: 3 }}>
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Member Number"
                                name="memberNumber"
                                value={formData.memberNumber}
                                onChange={handleChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Address"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                multiline
                                rows={2}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Phone Number"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                placeholder="10 digits"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <div style={{ width: '100%' }}>
                                <DatePicker
                                    selected={formData.joiningDate}
                                    onChange={(date) => setFormData(prev => ({ ...prev, joiningDate: date }))}
                                    dateFormat="dd/MM/yyyy"
                                    className="form-control"
                                    placeholderText="Select joining date"
                                    customInput={
                                        <TextField 
                                            fullWidth
                                            label="Joining Date"
                                        />
                                    }
                                />
                            </div>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Loan Amount"
                                name="loanAmount"
                                value={formData.loanAmount}
                                onChange={handleChange}
                                type="number"
                                required
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Interest"
                                name="interest"
                                value={formData.interest}
                                onChange={handleChange}
                                type="number"
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Installment"
                                name="installment"
                                value={formData.installment}
                                onChange={handleChange}
                                type="number"
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Initial Deposit"
                                name="initialDeposit"
                                value={formData.initialDeposit}
                                onChange={handleChange}
                                type="number"
                                required
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Monthly Saving"
                                name="monthlySaving"
                                value={formData.monthlySaving}
                                onChange={handleChange}
                                type="number"
                                required
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Aadhar Number"
                                name="aadharNumber"
                                value={formData.aadharNumber}
                                onChange={handleChange}
                                placeholder="12 digits"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="PAN Number"
                                name="panNumber"
                                value={formData.panNumber}
                                onChange={handleChange}
                                placeholder="e.g., ABCDE1234F"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Nominee Details"
                                name="nomineeDetails"
                                value={formData.nomineeDetails}
                                onChange={handleChange}
                                multiline
                                rows={2}
                                placeholder="Name, Relation, Contact"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                disabled={loading}
                                sx={{ mt: 2 }}
                            >
                                {loading ? <CircularProgress size={24} /> : 'Register Member'}
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </Box>
    );
}
