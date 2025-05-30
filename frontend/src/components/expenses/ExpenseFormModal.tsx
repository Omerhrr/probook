"use client";

import React from 'react';
import { Dialog, DialogContent, DialogTitle, Alert } from '@mui/material';
import ExpenseForm from './ExpenseForm';
import { Expense, ExpenseCreateData, ExpenseUpdateData } from '@/types/expense';

interface ExpenseFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ExpenseCreateData | ExpenseUpdateData) => Promise<void>;
  expense?: Expense | null; // Existing expense for editing
  isLoading?: boolean;
  error?: string | null;
}

const ExpenseFormModal: React.FC<ExpenseFormModalProps> = ({
  open,
  onClose,
  onSubmit,
  expense,
  isLoading,
  error,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{expense ? 'Edit Expense' : 'Add New Expense'}</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <ExpenseForm
          expense={expense}
          onSubmit={async (data) => {
            await onSubmit(data);
            // Parent component will handle closing the modal on success
          }}
          onCancel={onClose}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ExpenseFormModal;
