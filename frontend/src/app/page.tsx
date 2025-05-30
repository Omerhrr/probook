"use client"; // Required for client-side hooks

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Typography, Box, CircularProgress, Button } from '@mui/material';

export default function HomePage() {
  const { isAuthenticated, user, logout, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/(pages)/login'); // Adjusted path to match the login page route
    }
  }, [isAuthenticated, authLoading, router]);

  if (authLoading || !isAuthenticated) {
    // Show a loading spinner or a blank page while checking auth / redirecting
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  // If authenticated, show the dashboard content
  return (
    <Box sx={{ p: 3, textAlign: 'center' }}>
      <Typography variant="h4" gutterBottom>
        Welcome to ProBook Dashboard, {user?.username || 'User'}!
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        This is your main dashboard. More features will be added here soon.
      </Typography>
      <Button variant="contained" onClick={() => {
        logout();
        router.push('/(pages)/login'); // Redirect to login after logout
      }}>
        Logout
      </Button>
      {/* Add more dashboard components here */}
    </Box>
  );
}
