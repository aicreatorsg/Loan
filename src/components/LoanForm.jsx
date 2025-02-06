import { useState } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import {
  TextField,
  Button,
  Paper,
  Typography,
  Box,
  Grid,
  Alert,
} from '@mui/material';
import { createLoan } from '../services/loanService';

const validationSchema = Yup.object({
  fullName: Yup.string().required('Full name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  loanAmount: Yup.number()
    .min(1000, 'Minimum loan amount is 1000')
    .required('Loan amount is required'),
  phone: Yup.string().required('Phone number is required'),
});

const LoanForm = () => {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (values, { resetForm }) => {
    try {
      // Calculate monthly interest (24% per year = 2% per month)
      const monthlyInterestRate = 0.02;
      const monthlyInterest = values.loanAmount * monthlyInterestRate;
      
      const loanData = {
        ...values,
        monthlyInterest,
        totalAmount: values.loanAmount + monthlyInterest,
        status: 'pending',
        dateApplied: new Date().toISOString(),
        payments: []
      };

      await createLoan(loanData);
      setSubmitted(true);
      setError(null);
      resetForm();
    } catch (err) {
      setError('Failed to submit loan application. Please try again.');
      console.error('Error submitting loan:', err);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Loan Application Form
      </Typography>
      
      {submitted && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Loan application submitted successfully!
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Formik
        initialValues={{
          fullName: '',
          email: '',
          phone: '',
          loanAmount: '',
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, handleChange, handleBlur }) => (
          <Form>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="fullName"
                  label="Full Name"
                  value={values.fullName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.fullName && Boolean(errors.fullName)}
                  helperText={touched.fullName && errors.fullName}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="email"
                  label="Email"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.email && Boolean(errors.email)}
                  helperText={touched.email && errors.email}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="phone"
                  label="Phone Number"
                  value={values.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.phone && Boolean(errors.phone)}
                  helperText={touched.phone && errors.phone}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="loanAmount"
                  label="Loan Amount"
                  type="number"
                  value={values.loanAmount}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.loanAmount && Boolean(errors.loanAmount)}
                  helperText={touched.loanAmount && errors.loanAmount}
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                >
                  Submit Application
                </Button>
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>
    </Paper>
  );
};

export default LoanForm;
