"use client";

import React, { useEffect } from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { TextField, Button, Grid, Box, Typography } from '@mui/material';
import { Customer, CustomerCreateData, CustomerUpdateData } from '@/types/customer';

// Zod schema for validation
const customerFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address').optional().nullable().or(z.literal('')), // Allow empty string
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
});

export type CustomerFormData = z.infer<typeof customerFormSchema>;

interface CustomerFormProps {
  customer?: Customer | null; // Existing customer for editing, null for creation
  onSubmit: (data: CustomerCreateData | CustomerUpdateData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const CustomerForm: React.FC<CustomerFormProps> = ({ customer, onSubmit, onCancel, isLoading }) => {
  const { control, handleSubmit, reset, formState: { errors } } = useForm<CustomerFormData>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      name: customer?.name || '',
      email: customer?.email || '',
      phone: customer?.phone || '',
      address: customer?.address || '',
    },
  });

  useEffect(() => {
    reset({
      name: customer?.name || '',
      email: customer?.email || '',
      phone: customer?.phone || '',
      address: customer?.address || '',
    });
  }, [customer, reset]);

  const handleFormSubmit: SubmitHandler<CustomerFormData> = (data) => {
    const apiData = {
      ...data,
      email: data.email === '' ? null : data.email, // Convert empty string to null for API
      phone: data.phone || null,
      address: data.address || null,
    };
    onSubmit(apiData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <Typography variant="h6" gutterBottom>
        {customer ? 'Edit Customer' : 'Add New Customer'}
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="Customer Name" fullWidth required error={!!errors.name} helperText={errors.name?.message} disabled={isLoading} />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <TextField {...field} value={field.value ?? ''} label="Email" type="email" fullWidth error={!!errors.email} helperText={errors.email?.message} disabled={isLoading} />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Controller
            name="phone"
            control={control}
            render={({ field }) => (
              <TextField {...field} value={field.value ?? ''} label="Phone" fullWidth error={!!errors.phone} helperText={errors.phone?.message} disabled={isLoading} />
            )}
          />
        </Grid>
        <Grid item xs={12}>
          <Controller
            name="address"
            control={control}
            render={({ field }) => (
              <TextField {...field} value={field.value ?? ''} label="Address" fullWidth multiline rows={3} error={!!errors.address} helperText={errors.address?.message} disabled={isLoading} />
            )}
          />
        </Grid>
      </Grid>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        <Button onClick={onCancel} sx={{ mr: 1 }} disabled={isLoading}>Cancel</Button>
        <Button type="submit" variant="contained" disabled={isLoading}>
          {isLoading ? (customer ? 'Saving...' : 'Creating...') : (customer ? 'Save Changes' : 'Create Customer')}
        </Button>
      </Box>
    </form>
  );
};

export default CustomerForm;
