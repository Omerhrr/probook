"use client";

import React from 'react';
import { Dialog, DialogContent, DialogTitle, Alert } from '@mui/material';
import BranchForm from './BranchForm';
import { Branch, BranchCreateData, BranchUpdateData } from '@/types/branch';

interface BranchFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: BranchCreateData | BranchUpdateData) => Promise<void>;
  branch?: Branch | null;
  isLoading?: boolean;
  error?: string | null;
}

const BranchFormModal: React.FC<BranchFormModalProps> = ({
  open,
  onClose,
  onSubmit,
  branch,
  isLoading,
  error,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{branch ? 'Edit Branch' : 'Add New Branch'}</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <BranchForm
          branch={branch}
          onSubmit={async (data) => {
            await onSubmit(data);
          }}
          onCancel={onClose}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
};

export default BranchFormModal;
