"use client";

import React, { useEffect } from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { TextField, Button, Grid, Box, Typography } from '@mui/material';
import { Branch, BranchCreateData, BranchUpdateData } from '@/types/branch';

const branchFormSchema = z.object({
  name: z.string().min(1, 'Branch name is required'),
  address: z.string().optional().nullable(),
});

export type BranchFormData = z.infer<typeof branchFormSchema>;

interface BranchFormProps {
  branch?: Branch | null;
  onSubmit: (data: BranchCreateData | BranchUpdateData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const BranchForm: React.FC<BranchFormProps> = ({ branch, onSubmit, onCancel, isLoading }) => {
  const { control, handleSubmit, reset, formState: { errors } } = useForm<BranchFormData>({
    resolver: zodResolver(branchFormSchema),
    defaultValues: {
      name: branch?.name || '',
      address: branch?.address || '',
    },
  });

  useEffect(() => {
    reset({
      name: branch?.name || '',
      address: branch?.address || '',
    });
  }, [branch, reset]);

  const handleFormSubmit: SubmitHandler<BranchFormData> = (data) => {
    const apiData = {
      ...data,
      address: data.address || null,
    };
    onSubmit(apiData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <Typography variant="h6" gutterBottom>
        {branch ? 'Edit Branch' : 'Add New Branch'}
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="Branch Name" fullWidth required error={!!errors.name} helperText={errors.name?.message} disabled={isLoading} />
            )}
          />
        </Grid>
        <Grid item xs={12}>
          <Controller
            name="address"
            control={control}
            render={({ field }) => (
              <TextField {...field} value={field.value ?? ''} label="Address (Optional)" fullWidth multiline rows={3} error={!!errors.address} helperText={errors.address?.message} disabled={isLoading} />
            )}
          />
        </Grid>
      </Grid>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        <Button onClick={onCancel} sx={{ mr: 1 }} disabled={isLoading}>Cancel</Button>
        <Button type="submit" variant="contained" disabled={isLoading}>
          {isLoading ? (branch ? 'Saving...' : 'Creating...') : (branch ? 'Save Changes' : 'Create Branch')}
        </Button>
      </Box>
    </form>
  );
};

export default BranchForm;
