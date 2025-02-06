import { useState } from 'react';
import {
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Checkbox,
  FormControlLabel,
  Grid,
  Alert,
} from '@mui/material';
import { updateLoanPayment } from '../services/loanService';

const PaymentForm = ({ loanId, totalAmount, onPaymentSubmit }) => {
  const [amount, setAmount] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!confirmed || !amount) return;

    try {
      const payment = {
        amount: parseFloat(amount),
        date: new Date().toISOString(),
      };

      await updateLoanPayment(loanId, payment);
      onPaymentSubmit(payment);
      setAmount('');
      setConfirmed(false);
      setSuccess(true);
      setError(null);
    } catch (err) {
      setError('Failed to submit payment. Please try again.');
      console.error('Error submitting payment:', err);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Submit Payment
      </Typography>

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Payment submitted successfully!
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Payment Amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              InputProps={{
                inputProps: { min: 0, max: totalAmount }
              }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                />
              }
              label="I confirm this payment"
            />
          </Grid>
          
          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={!confirmed || !amount}
            >
              Submit Payment
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default PaymentForm;
