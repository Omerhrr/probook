"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import saleService from '@/services/saleService';
import { SaleCreateData } from '@/types/sale';
import SaleForm from '@/components/sales/SaleForm';
import { Container, Typography, Paper, CircularProgress, Box, Alert } from '@mui/material';

const NewSalePage = () => {
  const { token, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/(pages)/login');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleCreateSale = async (data: SaleCreateData) => {
    if (!token) {
      setSubmitError("Authentication token not found. Please login again.");
      return;
    }
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await saleService.createSale(token, data);
      // Optionally, show a success message before redirecting
      // For now, redirect directly
      router.push('/(pages)/sales?success=true'); // Add a query param for success message on list page
    } catch (error: any) {
      setSubmitError(error.message || 'Failed to create sale.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/(pages)/sales');
  };

  if (authLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
     // Should be redirected by useEffect, but as a fallback:
    return <Typography>Redirecting to login...</Typography>;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Create New Sale
      </Typography>
      <Paper elevation={3} sx={{ p: 3 }}>
        {submitError && <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>}
        <SaleForm
          onSubmit={handleCreateSale}
          onCancel={handleCancel}
          isLoading={isSubmitting}
          initialError={submitError} // Pass down submission error to potentially clear/display in form
        />
      </Paper>
    </Container>
  );
};

export default NewSalePage;
