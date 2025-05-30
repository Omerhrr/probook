"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { TextField, Button, Grid, Box, Typography, Autocomplete, CircularProgress, Switch, FormControlLabel } from '@mui/material';
import { User, UserCreateDataAdmin, UserUpdateDataAdmin } from '@/types/user';
import { Role } from '@/types/role';
import { Branch } from '@/types/branch';
import roleService from '@/services/roleService';
import branchService from '@/services/branchService';
import { useAuth } from '@/contexts/AuthContext';

// Zod schema for validation
const userFormSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  full_name: z.string().optional().nullable(),
  password: z.string().optional(), // Optional on update, required on create is handled by context
  role_id: z.number().int().min(1, "Role is required"),
  branch_id: z.number().int().optional().nullable(),
  disabled: z.boolean().optional(),
});

// Conditional validation for password on create
const createUserSchema = userFormSchema.extend({
    password: z.string().min(6, 'Password must be at least 6 characters'),
});
const updateUserSchema = userFormSchema.extend({
    password: z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal('')), // Allow empty for no change
});


export type UserFormData = z.infer<typeof userFormSchema>;

interface UserFormProps {
  user?: User | null;
  onSubmit: (data: UserCreateDataAdmin | UserUpdateDataAdmin) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const UserForm: React.FC<UserFormProps> = ({ user, onSubmit, onCancel, isLoading }) => {
  const { token } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  const schema = user ? updateUserSchema : createUserSchema;

  const { control, handleSubmit, reset, watch, formState: { errors } } = useForm<UserFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      username: user?.username || '',
      email: user?.email || '',
      full_name: user?.full_name || '',
      password: '',
      role_id: user?.role?.id || undefined,
      branch_id: user?.branch?.id || null,
      disabled: user?.disabled || false,
    },
  });

  const fetchRolesAndBranches = useCallback(async () => {
    if (!token) return;
    setDataLoading(true);
    try {
      const [rolesData, branchesData] = await Promise.all([
        roleService.getRoles(token),
        branchService.getBranches(token),
      ]);
      setRoles(rolesData);
      setBranches(branchesData);
    } catch (error) {
      console.error("Failed to fetch roles or branches:", error);
      // Handle error (e.g., show a notification)
    } finally {
      setDataLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchRolesAndBranches();
  }, [fetchRolesAndBranches]);

  useEffect(() => {
    reset({
      username: user?.username || '',
      email: user?.email || '',
      full_name: user?.full_name || '',
      password: '', // Always clear password field on form load/user change
      role_id: user?.role?.id || undefined,
      branch_id: user?.branch?.id || null,
      disabled: user?.disabled || false,
    });
  }, [user, reset]);

  const handleFormSubmit: SubmitHandler<UserFormData> = (data) => {
    const apiData: UserCreateDataAdmin | UserUpdateDataAdmin = {
      ...data,
      full_name: data.full_name || null,
      branch_id: data.branch_id || null,
      disabled: data.disabled || false,
    };
    // Only include password if it's provided (especially for updates)
    if (!data.password && user) { // if editing and password is empty
      delete (apiData as UserUpdateDataAdmin).password;
    }
    onSubmit(apiData);
  };

  if (dataLoading) {
    return <Box display="flex" justifyContent="center" my={3}><CircularProgress /></Box>;
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <Typography variant="h6" gutterBottom>
        {user ? 'Edit User' : 'Add New User'}
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}><Controller name="username" control={control} render={({ field }) => <TextField {...field} label="Username" fullWidth required error={!!errors.username} helperText={errors.username?.message} disabled={isLoading} />} /></Grid>
        <Grid item xs={12} sm={6}><Controller name="email" control={control} render={({ field }) => <TextField {...field} label="Email" type="email" fullWidth required error={!!errors.email} helperText={errors.email?.message} disabled={isLoading} />} /></Grid>
        <Grid item xs={12} sm={6}><Controller name="full_name" control={control} render={({ field }) => <TextField {...field} value={field.value ?? ''} label="Full Name" fullWidth error={!!errors.full_name} helperText={errors.full_name?.message} disabled={isLoading} />} /></Grid>
        <Grid item xs={12} sm={6}><Controller name="password" control={control} render={({ field }) => <TextField {...field} label={user ? "New Password (optional)" : "Password"} type="password" fullWidth required={!user} error={!!errors.password} helperText={errors.password?.message} disabled={isLoading} />} /></Grid>
        <Grid item xs={12} sm={6}>
          <Controller
            name="role_id"
            control={control}
            render={({ field }) => (
              <Autocomplete
                options={roles}
                getOptionLabel={(option) => option.name}
                onChange={(_, newValue) => field.onChange(newValue ? newValue.id : null)}
                value={roles.find(r => r.id === field.value) || null}
                renderInput={(params) => <TextField {...params} label="Role" fullWidth required error={!!errors.role_id} helperText={errors.role_id?.message} />}
                disabled={isLoading}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Controller
            name="branch_id"
            control={control}
            render={({ field }) => (
              <Autocomplete
                options={branches}
                getOptionLabel={(option) => option.name}
                onChange={(_, newValue) => field.onChange(newValue ? newValue.id : null)}
                value={branches.find(b => b.id === field.value) || null}
                renderInput={(params) => <TextField {...params} label="Branch (Optional)" fullWidth error={!!errors.branch_id} helperText={errors.branch_id?.message} />}
                disabled={isLoading}
              />
            )}
          />
        </Grid>
        <Grid item xs={12}>
            <Controller name="disabled" control={control} render={({ field }) => ( <FormControlLabel control={<Switch checked={field.value || false} onChange={field.onChange} disabled={isLoading} />} label="Disabled" /> )}/>
        </Grid>
      </Grid>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        <Button onClick={onCancel} sx={{ mr: 1 }} disabled={isLoading}>Cancel</Button>
        <Button type="submit" variant="contained" disabled={isLoading}>
          {isLoading ? (user ? 'Saving...' : 'Creating...') : (user ? 'Save Changes' : 'Create User')}
        </Button>
      </Box>
    </form>
  );
};

export default UserForm;
