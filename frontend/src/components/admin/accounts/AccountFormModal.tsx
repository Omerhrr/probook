"use client";

import React from 'react';
import { Dialog, DialogContent, DialogTitle, Alert } from '@mui/material';
import AccountForm from './AccountForm';
import { Account, AccountCreateData, AccountUpdateData } from '@/types/account';

interface AccountFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: AccountCreateData | AccountUpdateData) => Promise<void>;
  account?: Account | null;
  isLoading?: boolean;
  error?: string | null;
}

const AccountFormModal: React.FC<AccountFormModalProps> = ({
  open,
  onClose,
  onSubmit,
  account,
  isLoading,
  error,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth> {/* md is wider */}
      <DialogTitle>{account ? 'Edit Account' : 'Create New Account'}</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <AccountForm
          account={account}
          onSubmit={onSubmit} // Pass the submit handler directly
          onCancel={onClose}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AccountFormModal;
