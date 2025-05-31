"use client";

import React, { useEffect } from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { TextField, Button, Grid, Box, Typography } from '@mui/material';
import { AccountType, AccountTypeCreateData, AccountTypeUpdateData } from '@/types/accountType';

const accountTypeFormSchema = z.object({
  name: z.string().min(1, 'Account type name is required').max(100, 'Name must be 100 characters or less'),
  description: z.string().optional().nullable(),
});

export type AccountTypeFormData = z.infer<typeof accountTypeFormSchema>;

interface AccountTypeFormProps {
  accountType?: AccountType | null;
  onSubmit: (data: AccountTypeCreateData | AccountTypeUpdateData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const AccountTypeForm: React.FC<AccountTypeFormProps> = ({ accountType, onSubmit, onCancel, isLoading }) => {
  const { control, handleSubmit, reset, formState: { errors } } = useForm<AccountTypeFormData>({
    resolver: zodResolver(accountTypeFormSchema),
    defaultValues: {
      name: accountType?.name || '',
      description: accountType?.description || '',
    },
  });

  useEffect(() => {
    reset({
      name: accountType?.name || '',
      description: accountType?.description || '',
    });
  }, [accountType, reset]);

  const handleFormSubmit: SubmitHandler<AccountTypeFormData> = (data) => {
    onSubmit({
        ...data,
        description: data.description || null
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <Typography variant="h6" gutterBottom>
        {accountType ? 'Edit Account Type' : 'Add New Account Type'}
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="Account Type Name" fullWidth required error={!!errors.name} helperText={errors.name?.message} disabled={isLoading} />
            )}
          />
        </Grid>
        <Grid item xs={12}>
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <TextField {...field} value={field.value ?? ''} label="Description (Optional)" fullWidth multiline rows={3} error={!!errors.description} helperText={errors.description?.message} disabled={isLoading} />
            )}
          />
        </Grid>
      </Grid>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        <Button onClick={onCancel} sx={{ mr: 1 }} disabled={isLoading}>Cancel</Button>
        <Button type="submit" variant="contained" disabled={isLoading}>
          {isLoading ? (accountType ? 'Saving...' : 'Creating...') : (accountType ? 'Save Changes' : 'Create Account Type')}
        </Button>
      </Box>
    </form>
  );
};

export default AccountTypeForm;
