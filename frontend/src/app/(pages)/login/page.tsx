"use client"; // Required for event handlers and hooks in App Router

import React, { useState } from 'react';
import { Container, TextField, Button, Typography, Box, Alert, Grid, Link as MuiLink } from '@mui/material';
import { useRouter } from 'next/navigation'; // For redirecting after login
import { useAuth } from '@/contexts/AuthContext';
import Link as NextLink from 'next/link';

const LoginPage = () => {
  const router = useRouter();
  const { login, loading: authLoading, authError } = useAuth(); // Get login function and loading state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  // Use authError from context, but can have local error for form-specific things if needed
  // const [formError, setFormError] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    // setFormError(''); // Clear local form error

    try {
      await login(username, password);
      router.push('/'); // Redirect to dashboard on successful login
    } catch (err: any) {
      // Error is already set in AuthContext's authError by the login function
      // If additional form-specific error handling is needed, use setFormError
      console.error("Login failed:", err.message);
    }
  };

  // Determine loading state from auth context
  const isLoading = authLoading;
  // Determine error message from auth context
  const displayError = authError;

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
          Sign In
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Username"
            name="username"
            autoComplete="username"
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading} // Corrected from loading to isLoading
          />
          {displayError && ( // Corrected from error to displayError
            <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
              {displayError}
            </Alert>
          )}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={isLoading}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>
          <Grid container justifyContent="flex-end" sx={{ mt: 1 }}>
            <Grid item>
              <MuiLink component={NextLink} href="/(pages)/register" variant="body2">
                Don't have an account? Sign Up
              </MuiLink>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  );
};

export default LoginPage;
