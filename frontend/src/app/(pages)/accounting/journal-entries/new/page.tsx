"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import journalEntryService from '@/services/journalEntryService';
import { JournalEntryCreateData } from '@/types/journalEntry';
import JournalEntryForm from '@/components/accounting/journalentries/JournalEntryForm';
import { Container, Typography, Paper, CircularProgress, Box, Alert } from '@mui/material';

const NewJournalEntryPage = () => {
  const { token, isAuthenticated, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [enforcedBranchId, setEnforcedBranchId] = useState<number | null>(null);

  // Role check and determine enforcedBranchId from query param for admin
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || !user?.role?.name || !['admin', 'branch_manager'].includes(user.role.name.toLowerCase())) {
        // Redirect if not authenticated or not an authorized role
        router.push(isAuthenticated ? '/' : '/(pages)/login');
      } else {
        if (user.role.name.toLowerCase() === 'admin') {
          const queryBranchId = searchParams.get('branchId');
          if (queryBranchId && !isNaN(parseInt(queryBranchId))) {
            setEnforcedBranchId(parseInt(queryBranchId));
          }
          // If admin and no branchId in query, the form will show branch selector
        } else if (user.role.name.toLowerCase() === 'branch_manager' && user.branch?.id) {
          setEnforcedBranchId(user.branch.id);
        }
      }
    }
  }, [isAuthenticated, user, authLoading, router, searchParams]);


  const handleCreateJournalEntry = async (data: JournalEntryCreateData) => {
    if (!token) {
      setSubmitError("Authentication token not found. Please login again.");
      return;
    }
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await journalEntryService.createJournalEntry(token, data);
      router.push('/(pages)/accounting/journal-entries?success=true');
    } catch (error: any) {
      setSubmitError(error.message || 'Failed to create journal entry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/(pages)/accounting/journal-entries');
  };

  if (authLoading) {
    return <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh"><CircularProgress /></Box>;
  }
  if (!isAuthenticated || !user?.role?.name || !['admin', 'branch_manager'].includes(user.role.name.toLowerCase())) {
    return <Typography sx={{p:3}}>Access Denied. Redirecting...</Typography>;
  }
  // If admin and no branch ID is enforced via query (meaning they didn't come from a "create for this branch" button)
  // the form itself will handle the branch selection.
  // If branch manager and no branch.id, form will also handle this (though ideally they always have one).

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Create New Journal Entry
      </Typography>
      <Paper elevation={3} sx={{ p: { xs: 2, md: 3 } }}>
        {submitError && <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>}
        <JournalEntryForm
          onSubmit={handleCreateJournalEntry}
          onCancel={handleCancel}
          isLoading={isSubmitting}
          initialError={submitError}
          enforcedBranchId={enforcedBranchId}
        />
      </Paper>
    </Container>
  );
};

export default NewJournalEntryPage;
