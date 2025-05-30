"use client";

import React from 'react';
import { Dialog, DialogContent, DialogTitle, Alert } from '@mui/material';
import CustomerForm from './CustomerForm';
import { Customer, CustomerCreateData, CustomerUpdateData } from '@/types/customer';

interface CustomerFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CustomerCreateData | CustomerUpdateData) => Promise<void>;
  customer?: Customer | null; // Existing customer for editing
  isLoading?: boolean;
  error?: string | null;
}

const CustomerFormModal: React.FC<CustomerFormModalProps> = ({
  open,
  onClose,
  onSubmit,
  customer,
  isLoading,
  error,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{customer ? 'Edit Customer' : 'Add New Customer'}</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <CustomerForm
          customer={customer}
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

export default CustomerFormModal;
