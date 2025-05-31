"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import customerPaymentService from '@/services/customerPaymentService';
import { CustomerPaymentCreateData } from '@/types/customerPayment';
import CustomerPaymentForm from '@/components/accounting/payments/CustomerPaymentForm';
import { Container, Typography, Paper, CircularProgress, Box, Alert } from '@mui/material';

const NewCustomerPaymentPage = () => {
  const { token, isAuthenticated, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams(); // To potentially get customer_id or branch_id from query

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [enforcedBranchId, setEnforcedBranchId] = useState<number | null>(null);
  // const [initialCustomerId, setInitialCustomerId] = useState<number | null>(null); // If passing customer

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || !user?.role?.name || !['admin', 'branch_manager'].includes(user.role.name.toLowerCase())) {
        router.push(isAuthenticated ? '/' : '/(pages)/login');
      } else {
        // For Admin, if branchId is in query, enforce it.
        // For Branch Manager, their branch is automatically enforced in the form via AuthContext.
        if (user.role.name.toLowerCase() === 'admin') {
          const queryBranchId = searchParams.get('branchId');
          if (queryBranchId && !isNaN(parseInt(queryBranchId))) {
            setEnforcedBranchId(parseInt(queryBranchId));
          }
        }
        // Potentially pre-fill customer if customerId is in query params
        // const queryCustomerId = searchParams.get('customerId');
        // if (queryCustomerId && !isNaN(parseInt(queryCustomerId))) {
        //   setInitialCustomerId(parseInt(queryCustomerId));
        // }
      }
    }
  }, [isAuthenticated, user, authLoading, router, searchParams]);

  const handleRecordPayment = async (data: CustomerPaymentCreateData) => {
    if (!token) {
      setSubmitError("Authentication token not found. Please login again.");
      return;
    }
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await customerPaymentService.createCustomerPayment(token, data);
      router.push('/(pages)/accounting/customer-payments?success=true');
    } catch (error: any) {
      setSubmitError(error.message || 'Failed to record payment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/(pages)/accounting/customer-payments');
  };

  if (authLoading) {
    return <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh"><CircularProgress /></Box>;
  }
   if (!isAuthenticated || !user?.role?.name || !['admin', 'branch_manager'].includes(user.role.name.toLowerCase())) {
    return <Typography sx={{p:3}}>Access Denied. Redirecting...</Typography>;
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Record Customer Payment
      </Typography>
      <Paper elevation={3} sx={{ p: { xs: 2, md: 3 } }}>
        {submitError && <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>}
        <CustomerPaymentForm
          onSubmit={handleRecordPayment}
          onCancel={handleCancel}
          isLoading={isSubmitting}
          enforcedBranchId={enforcedBranchId}
          // Pass initialCustomerId if implementing pre-selection
        />
      </Paper>
    </Container>
  );
};

export default NewCustomerPaymentPage;
