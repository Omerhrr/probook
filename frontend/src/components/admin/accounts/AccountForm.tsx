"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useForm, Controller, SubmitHandler }
from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { TextField, Button, Grid, Box, Typography, Autocomplete, CircularProgress, Switch, FormControlLabel } from '@mui/material';
import { Account, AccountCreateData, AccountUpdateData, AccountLookup } from '@/types/account';
import { AccountType } from '@/types/accountType';
import { Branch } from '@/types/branch';
import accountService from '@/services/accountService';
import accountTypeService from '@/services/accountTypeService';
import branchService from '@/services/branchService';
import { useAuth } from '@/contexts/AuthContext';

const accountFormSchema = z.object({
  name: z.string().min(1, 'Account name is required'),
  account_code: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  account_type_id: z.number().int().min(1, "Account type is required"),
  branch_id: z.number().int().min(1, "Branch is required"),
  is_active: z.boolean().optional(),
  parent_account_id: z.number().int().optional().nullable(),
});

export type AccountFormData = z.infer<typeof accountFormSchema>;

interface AccountFormProps {
  account?: Account | null;
  onSubmit: (data: AccountCreateData | AccountUpdateData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  // enforcedBranchId?: number | null; // Not using enforcedBranchId as Admin should always select branch for COA
}

const AccountForm: React.FC<AccountFormProps> = ({ account, onSubmit, onCancel, isLoading }) => {
  const { token } = useAuth(); // Assuming admin role is checked by page

  const [accountTypes, setAccountTypes] = useState<AccountType[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [parentAccounts, setParentAccounts] = useState<AccountLookup[]>([]);

  const [dataLoading, setDataLoading] = useState(true);

  const { control, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<AccountFormData>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      name: account?.name || '',
      account_code: account?.account_code || '',
      description: account?.description || '',
      account_type_id: account?.account_type?.id || undefined,
      branch_id: account?.branch?.id || undefined,
      is_active: account?.is_active !== undefined ? account.is_active : true,
      parent_account_id: account?.parent_account_id || null,
    },
  });

  const selectedBranchId = watch("branch_id");

  const fetchInitialData = useCallback(async () => {
    if (!token) return;
    setDataLoading(true);
    try {
      const [accTypesData, branchesData] = await Promise.all([
        accountTypeService.getAccountTypes(token),
        branchService.getBranches(token),
      ]);
      setAccountTypes(accTypesData);
      setBranches(branchesData);
    } catch (error) { console.error("Failed to fetch initial form data:", error); }
    finally { setDataLoading(false); }
  }, [token]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const fetchParentAccounts = useCallback(async () => {
    if (token && selectedBranchId) {
        try {
            const lookupAccounts = await accountService.getAccountLookups(token, selectedBranchId, account?.id);
            setParentAccounts(lookupAccounts);
        } catch (error) { console.error("Failed to fetch parent accounts:", error); setParentAccounts([]);}
    } else {
        setParentAccounts([]);
    }
  }, [token, selectedBranchId, account?.id]);

  useEffect(() => {
    fetchParentAccounts();
  }, [fetchParentAccounts]); // Re-fetch if selectedBranchId changes


  useEffect(() => {
    reset({
      name: account?.name || '',
      account_code: account?.account_code || '',
      description: account?.description || '',
      account_type_id: account?.account_type?.id || undefined,
      branch_id: account?.branch?.id || undefined,
      is_active: account?.is_active !== undefined ? account.is_active : true,
      parent_account_id: account?.parent_account_id || null,
    });
    if(account?.branch?.id) setValue('branch_id', account.branch.id); // Ensure branch is set for parent account fetch
    if(account?.account_type?.id) setValue('account_type_id', account.account_type.id);


  }, [account, reset, setValue]);

  const handleFormSubmit: SubmitHandler<AccountFormData> = (data) => {
    const apiData = {
      ...data,
      account_code: data.account_code || null,
      description: data.description || null,
      parent_account_id: data.parent_account_id || null,
      is_active: data.is_active === undefined ? true : data.is_active, // Default to true if undefined
    };
    onSubmit(apiData);
  };

  if (dataLoading) {
    return <Box display="flex" justifyContent="center" my={3}><CircularProgress /></Box>;
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <Typography variant="h6" gutterBottom>{account ? 'Edit Account' : 'Create New Account'}</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}><Controller name="name" control={control} render={({ field }) => <TextField {...field} label="Account Name" fullWidth required error={!!errors.name} helperText={errors.name?.message} disabled={isLoading} />} /></Grid>
        <Grid item xs={12} sm={6}><Controller name="account_code" control={control} render={({ field }) => <TextField {...field} value={field.value ?? ''} label="Account Code (Optional)" fullWidth error={!!errors.account_code} helperText={errors.account_code?.message} disabled={isLoading} />} /></Grid>
        <Grid item xs={12}><Controller name="description" control={control} render={({ field }) => <TextField {...field} value={field.value ?? ''} label="Description (Optional)" fullWidth multiline rows={2} error={!!errors.description} helperText={errors.description?.message} disabled={isLoading} />} /></Grid>
        <Grid item xs={12} sm={6}>
          <Controller name="branch_id" control={control} render={({ field }) => (
              <Autocomplete options={branches} getOptionLabel={(option) => option.name}
                onChange={(_, newValue) => { field.onChange(newValue ? newValue.id : null); setValue('parent_account_id', null); /* Reset parent on branch change */ }}
                value={branches.find(b => b.id === field.value) || null}
                renderInput={(params) => <TextField {...params} label="Branch" fullWidth required error={!!errors.branch_id} helperText={errors.branch_id?.message} />}
                disabled={isLoading || dataLoading} /> )} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Controller name="account_type_id" control={control} render={({ field }) => (
              <Autocomplete options={accountTypes} getOptionLabel={(option) => option.name}
                onChange={(_, newValue) => field.onChange(newValue ? newValue.id : null)}
                value={accountTypes.find(at => at.id === field.value) || null}
                renderInput={(params) => <TextField {...params} label="Account Type" fullWidth required error={!!errors.account_type_id} helperText={errors.account_type_id?.message} />}
                disabled={isLoading || dataLoading} /> )} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Controller name="parent_account_id" control={control} render={({ field }) => (
              <Autocomplete options={parentAccounts} getOptionLabel={(option) => `${option.name} (${option.account_code || 'N/A'})`}
                onChange={(_, newValue) => field.onChange(newValue ? newValue.id : null)}
                value={parentAccounts.find(pa => pa.id === field.value) || null}
                disabled={isLoading || !selectedBranchId || dataLoading}
                renderInput={(params) => <TextField {...params} label="Parent Account (Optional)" fullWidth error={!!errors.parent_account_id} helperText={errors.parent_account_id?.message || (!selectedBranchId ? "Select branch first" : "")} />} /> )} />
        </Grid>
        <Grid item xs={12} sm={6}><Controller name="is_active" control={control} render={({ field }) => <FormControlLabel control={<Switch checked={field.value || false} onChange={field.onChange} disabled={isLoading} />} label="Active" />} /></Grid>
      </Grid>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        <Button onClick={onCancel} sx={{ mr: 1 }} disabled={isLoading}>Cancel</Button>
        <Button type="submit" variant="contained" disabled={isLoading}>
          {isLoading ? (account ? 'Saving...' : 'Creating...') : (account ? 'Save Changes' : 'Create Account')}
        </Button>
      </Box>
    </form>
  );
};

export default AccountForm;
