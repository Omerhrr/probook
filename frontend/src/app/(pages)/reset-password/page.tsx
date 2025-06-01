"use client";

import React, { useState, useEffect } from 'react';
import { Container, TextField, Button, Typography, Box, Alert } from '@mui/material';
import { useSearchParams, useRouter } from 'next/navigation';
import authService from '@/services/authService';
// We might need Link and NextLink later for a link back to login on success/error
// import { Link as MuiLink } from '@mui/material';
// import { Link as NextLink } from 'next/link';


const ResetPasswordPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
      setError(''); // Clear any "missing token" error
    } else {
      setError("Invalid or missing reset token. Please try requesting a password reset again.");
      setToken(null);
    }
  }, [searchParams]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    // Client-side validation
    if (!token) { // Should be disabled by button state, but as a safeguard
      setError("No reset token found. Please use the link from your email.");
      setSuccessMessage('');
      return;
    }
    if (!newPassword || !confirmPassword) {
      setError("Please fill in both password fields.");
      setSuccessMessage('');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      setSuccessMessage('');
      return;
    }
    setError(''); // Clear previous errors
    setSuccessMessage(''); // Clear previous success messages
    setLoading(true);

    if (!token) { // Final safety check for TypeScript, though UI should prevent this state
      setError("No reset token available. Cannot proceed.");
      setLoading(false); // Ensure loading is reset
      return;
    }

    const payload = {
      token: token, // Token from URL state
      new_password: newPassword
    };

    try {
      const response = await authService.resetPassword(payload.token, payload.new_password);
      console.log('Password reset successful:', response); // response here will be like { message: "..." }

      setSuccessMessage("Your password has been reset successfully! Redirecting to login...");
      setError('');
      // Redirect to login after a short delay to allow user to read success message
      setTimeout(() => {
        router.push('/(pages)/login');
      }, 3000); // 3 second delay

    } catch (apiError: any) {
      setSuccessMessage('');
      setError(apiError.response?.data?.detail || apiError.message || 'Password reset failed. Please try again.');
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
          Reset Your Password
        </Typography>
        <Typography variant="body1" sx={{ mt: 2, textAlign: 'center' }}>
          Please enter your new password below.
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 3, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            name="newPassword"
            label="New Password"
            type="password"
            id="newPassword"
            autoComplete="new-password"
            autoFocus
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={loading || !token}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="Confirm New Password"
            type="password"
            id="confirmPassword"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading || !token}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading || !token}
          >
            Reset Password
          </Button>
          {error && (
            <Alert severity="error" sx={{ width: '100%', mt: 2 }}>{error}</Alert>
          )}
          {successMessage && ( // Ensure this Alert is uncommented if successMessage state is used
            <Alert severity="success" sx={{ width: '100%', mt: 2 }}>{successMessage}</Alert>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default ResetPasswordPage;
