"use client";

import React, { useEffect } from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { TextField, Button, Grid, Box, Typography } from '@mui/material';
import { Supplier, SupplierCreateData, SupplierUpdateData } from '@/types/supplier';

// Zod schema for validation
const supplierFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  contact_person: z.string().optional().nullable(),
  email: z.string().email('Invalid email address').optional().nullable().or(z.literal('')), // Allow empty string for optional email
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
});

export type SupplierFormData = z.infer<typeof supplierFormSchema>;

interface SupplierFormProps {
  supplier?: Supplier | null; // Existing supplier for editing, null for creation
  onSubmit: (data: SupplierCreateData | SupplierUpdateData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const SupplierForm: React.FC<SupplierFormProps> = ({ supplier, onSubmit, onCancel, isLoading }) => {
  const { control, handleSubmit, reset, formState: { errors } } = useForm<SupplierFormData>({
    resolver: zodResolver(supplierFormSchema),
    defaultValues: {
      name: supplier?.name || '',
      contact_person: supplier?.contact_person || '',
      email: supplier?.email || '',
      phone: supplier?.phone || '',
      address: supplier?.address || '',
    },
  });

  useEffect(() => {
    reset({
      name: supplier?.name || '',
      contact_person: supplier?.contact_person || '',
      email: supplier?.email || '',
      phone: supplier?.phone || '',
      address: supplier?.address || '',
    });
  }, [supplier, reset]);

  const handleFormSubmit: SubmitHandler<SupplierFormData> = (data) => {
    const apiData = {
      ...data,
      email: data.email === '' ? null : data.email, // Convert empty string to null for API
      contact_person: data.contact_person || null,
      phone: data.phone || null,
      address: data.address || null,
    };
    onSubmit(apiData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <Typography variant="h6" gutterBottom>
        {supplier ? 'Edit Supplier' : 'Add New Supplier'}
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="Supplier Name" fullWidth required error={!!errors.name} helperText={errors.name?.message} disabled={isLoading} />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Controller
            name="contact_person"
            control={control}
            render={({ field }) => (
              <TextField {...field} value={field.value ?? ''} label="Contact Person" fullWidth error={!!errors.contact_person} helperText={errors.contact_person?.message} disabled={isLoading} />
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
        <Grid item xs={12} sm={6}>
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
          {isLoading ? (supplier ? 'Saving...' : 'Creating...') : (supplier ? 'Save Changes' : 'Create Supplier')}
        </Button>
      </Box>
    </form>
  );
};

export default SupplierForm;
