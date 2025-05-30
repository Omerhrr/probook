"use client";

import React, { useEffect } from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { TextField, Button, Grid, Box, Typography, Autocomplete, CircularProgress } from '@mui/material';
import { Customer, CustomerCreateData, CustomerUpdateData } from '@/types/customer';
import { Branch } from '@/types/branch';
import branchService from '@/services/branchService';
import { useAuth } from '@/contexts/AuthContext';

// Zod schema for validation
const customerFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address').optional().nullable().or(z.literal('')),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  branch_id: z.number().int().min(1, "Branch is required"),
});

export type CustomerFormData = z.infer<typeof customerFormSchema>;

interface CustomerFormProps {
  customer?: Customer | null;
  onSubmit: (data: CustomerCreateData | CustomerUpdateData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  enforcedBranchId?: number | null;
}

const CustomerForm: React.FC<CustomerFormProps> = ({ customer, onSubmit, onCancel, isLoading, enforcedBranchId }) => {
  const { token, user } = useAuth();
  const isAdmin = user?.role?.name.toLowerCase() === 'admin';
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchesLoading, setBranchesLoading] = useState(false);

  const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm<CustomerFormData>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      name: customer?.name || '',
      email: customer?.email || '',
      phone: customer?.phone || '',
      address: customer?.address || '',
      branch_id: enforcedBranchId || customer?.branch?.id || undefined,
    },
  });

  const fetchBranchesForAdmin = useCallback(async () => {
    if (isAdmin && !enforcedBranchId && token) {
      setBranchesLoading(true);
      try {
        const branchesData = await branchService.getBranches(token);
        setBranches(branchesData);
      } catch (error) { console.error("Failed to fetch branches:", error); }
      finally { setBranchesLoading(false); }
    }
  }, [isAdmin, enforcedBranchId, token]);

  useEffect(() => {
    fetchBranchesForAdmin();
  }, [fetchBranchesForAdmin]);

  useEffect(() => {
    const defaultBranchId = enforcedBranchId || customer?.branch?.id || undefined;
    reset({
      name: customer?.name || '',
      email: customer?.email || '',
      phone: customer?.phone || '',
      address: customer?.address || '',
      branch_id: defaultBranchId,
    });
     if (defaultBranchId) { // Ensure field is set if there's a default/enforced value
        setValue('branch_id', defaultBranchId);
    }
  }, [customer, reset, enforcedBranchId, setValue]);

  const handleFormSubmit: SubmitHandler<CustomerFormData> = (data) => {
    const apiData = {
      ...data,
      email: data.email === '' ? null : data.email,
      phone: data.phone || null,
      address: data.address || null,
      branch_id: Number(data.branch_id),
    };
    onSubmit(apiData);
  };

  if (branchesLoading && isAdmin && !enforcedBranchId) {
    return <Box display="flex" justifyContent="center" my={3}><CircularProgress /></Box>;
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <Typography variant="h6" gutterBottom>{customer ? 'Edit Customer' : 'Add New Customer'}</Typography>
      <Grid container spacing={2}>
        {isAdmin && !enforcedBranchId && (
          <Grid item xs={12}>
            <Controller
              name="branch_id"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  options={branches}
                  getOptionLabel={(option) => option.name}
                  onChange={(_, newValue) => field.onChange(newValue ? newValue.id : null)}
                  value={branches.find(b => b.id === field.value) || null}
                  renderInput={(params) => <TextField {...params} label="Branch" fullWidth required error={!!errors.branch_id} helperText={errors.branch_id?.message} />}
                  disabled={isLoading || branchesLoading}
                />
              )}
            />
          </Grid>
        )}
        <Grid item xs={12} sm={isAdmin && !enforcedBranchId ? 6 : 12}>
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
