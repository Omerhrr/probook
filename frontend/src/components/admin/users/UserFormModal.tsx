"use client";

import React from 'react';
import { Dialog, DialogContent, DialogTitle, Alert } from '@mui/material';
import UserForm from './UserForm';
import { User, UserCreateDataAdmin, UserUpdateDataAdmin } from '@/types/user';

interface UserFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: UserCreateDataAdmin | UserUpdateDataAdmin) => Promise<void>;
  user?: User | null;
  isLoading?: boolean;
  error?: string | null;
}

const UserFormModal: React.FC<UserFormModalProps> = ({
  open,
  onClose,
  onSubmit,
  user,
  isLoading,
  error,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{user ? 'Edit User' : 'Add New User'}</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <UserForm
          user={user}
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

export default UserFormModal;
