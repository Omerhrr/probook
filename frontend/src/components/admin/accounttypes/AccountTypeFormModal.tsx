"use client";

import React from 'react';
import { Dialog, DialogContent, DialogTitle, Alert } from '@mui/material';
import AccountTypeForm from './AccountTypeForm';
import { AccountType, AccountTypeCreateData, AccountTypeUpdateData } from '@/types/accountType';

interface AccountTypeFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: AccountTypeCreateData | AccountTypeUpdateData) => Promise<void>;
  accountType?: AccountType | null;
  isLoading?: boolean;
  error?: string | null; // For displaying submission errors from parent
}

const AccountTypeFormModal: React.FC<AccountTypeFormModalProps> = ({
  open,
  onClose,
  onSubmit,
  accountType,
  isLoading,
  error,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{accountType ? 'Edit Account Type' : 'Add New Account Type'}</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <AccountTypeForm
          accountType={accountType}
          onSubmit={async (data) => {
            // The onSubmit prop itself is a promise, so just call it.
            // The parent page component will handle success/error and closing the modal.
            await onSubmit(data);
          }}
          onCancel={onClose}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AccountTypeFormModal;
