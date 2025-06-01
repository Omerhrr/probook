"use client";

import React, { useState } from 'react';
import { Container, TextField, Button, Typography, Box, Alert, Grid } from '@mui/material';
import { Link as MuiLink } from '@mui/material';
import Link as NextLink from 'next/link';
// We will need useRouter for navigation later
// import { useRouter } from 'next/navigation';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  // const router = useRouter();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email) {
      setSuccessMessage(''); // Clear previous success message
      setError("Please enter your email address.");
      return;
    }
    setError(''); // Clear previous errors
    setSuccessMessage(''); // Clear previous success message
    setLoading(true);

    try {
      // TODO: Call authService.sendPasswordResetEmail(email) when implemented
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

      console.log("Simulated: Password reset email sent for:", email);
      setSuccessMessage("If an account with that email exists, a password reset link has been sent.");
      setEmail(''); // Clear email field on success
    } catch (simulatedError: any) {
      console.error("Simulated error:", simulatedError);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Forgot Your Password?
        </Typography>
        <Typography variant="body1" sx={{ mt: 2, textAlign: 'center' }}>
          No problem! Enter your email address below and if it matches an account, we'll send you a link to reset your password.
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 3, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            type="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </Button>
          {error && (
            <Alert severity="error" sx={{ width: '100%', mt: 2 }}>{error}</Alert>
          )}
          {successMessage && (
            <Alert severity="success" sx={{ width: '100%', mt: 2 }}>{successMessage}</Alert>
          )}
          <Grid container justifyContent="center" sx={{mt: 2}}>
            <Grid item>
              <MuiLink component={NextLink} href="/(pages)/login" variant="body2">
                Back to Sign In
              </MuiLink>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  );
};

export default ForgotPasswordPage;
