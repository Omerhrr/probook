"use client";

import React from 'react';
import { Dialog, DialogContent, DialogTitle, Alert } from '@mui/material';
import SupplierForm from './SupplierForm'; // Corrected path
import { Supplier, SupplierCreateData, SupplierUpdateData } from '@/types/supplier';

interface SupplierFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: SupplierCreateData | SupplierUpdateData) => Promise<void>;
  supplier?: Supplier | null; // Existing supplier for editing
  isLoading?: boolean;
  error?: string | null;
}

const SupplierFormModal: React.FC<SupplierFormModalProps> = ({
  open,
  onClose,
  onSubmit,
  supplier,
  isLoading,
  error,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{supplier ? 'Edit Supplier' : 'Add New Supplier'}</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <SupplierForm
          supplier={supplier}
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

export default SupplierFormModal;
