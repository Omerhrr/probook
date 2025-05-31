"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { TextField, Button, Grid, Box, Typography, Autocomplete, CircularProgress } from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { formatISO } from 'date-fns';

import { CustomerPaymentCreateData } from '@/types/customerPayment';
import { Customer } from '@/types/customer';
import { Branch } from '@/types/branch';
import { Account, AccountLookup } from '@/types/account'; // AccountLookup for dropdowns
import { AccountType } from '@/types/accountType';

import customerService from '@/services/customerService';
import branchService from '@/services/branchService';
import accountService from '@/services/accountService';
import accountTypeService from '@/services/accountTypeService';
import { useAuth } from '@/contexts/AuthContext';

const customerPaymentFormSchema = z.object({
  payment_date: z.date({ required_error: "Payment date is required" }),
  customer_id: z.number().int().min(1, "Customer is required"),
  branch_id: z.number().int().min(1, "Branch is required"),
  amount_paid: z.preprocess(
    (val) => parseFloat(String(val)),
    z.number().positive("Amount paid must be positive")
  ),
  payment_method_account_id: z.number().int().min(1, "Payment method account is required"),
  reference_number: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type CustomerPaymentFormData = z.infer<typeof customerPaymentFormSchema>;

interface CustomerPaymentFormProps {
  onSubmit: (data: CustomerPaymentCreateData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean; // For submission loading state
  enforcedBranchId?: number | null; // If creating for a specific branch (e.g. admin selected, or BM's branch)
}

const CustomerPaymentForm: React.FC<CustomerPaymentFormProps> = ({ onSubmit, onCancel, isLoading: formSubmitting, enforcedBranchId }) => {
  const { token, user } = useAuth();
  const isAdmin = user?.role?.name.toLowerCase() === 'admin';

  const [branches, setBranches] = useState<Branch[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [paymentAccounts, setPaymentAccounts] = useState<AccountLookup[]>([]); // Asset accounts
  const [accountTypes, setAccountTypes] = useState<AccountType[]>([]);


  const [dataLoading, setDataLoading] = useState(true); // For fetching initial dropdown data

  const { control, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<CustomerPaymentFormData>({
    resolver: zodResolver(customerPaymentFormSchema),
    defaultValues: {
      payment_date: new Date(),
      branch_id: enforcedBranchId || (isAdmin ? undefined : user?.branch?.id) || undefined,
      customer_id: undefined,
      amount_paid: undefined,
      payment_method_account_id: undefined,
      reference_number: '',
      notes: '',
    },
  });

  const selectedBranchId = watch("branch_id");

  // Fetch static data: branches (for admin), account types
  useEffect(() => {
    if (!token) return;
    setDataLoading(true);
    const promises = [accountTypeService.getAccountTypes(token)];
    if (isAdmin && !enforcedBranchId) {
      promises.push(branchService.getBranches(token));
    }
    Promise.all(promises).then(([accTypesData, branchesDataIfAdmin]) => {
      setAccountTypes(accTypesData || []);
      if (branchesDataIfAdmin) setBranches(branchesDataIfAdmin);
    }).catch(error => {
      console.error("Failed to fetch initial data:", error);
      // Handle error appropriately
    }).finally(() => setDataLoading(false));

    // Set initial branch for BM or if enforced
    const initialBranchId = enforcedBranchId || (isBranchManager && user?.branch?.id ? user.branch.id : undefined);
    if (initialBranchId) {
      setValue('branch_id', initialBranchId);
    }

  }, [token, isAdmin, enforcedBranchId, user?.branch?.id, setValue]);

  const isBranchManager = user?.role?.name.toLowerCase() === 'branch_manager';


  // Fetch customers and payment accounts when selectedBranchId changes
  useEffect(() => {
    if (token && selectedBranchId) {
      setDataLoading(true);
      const assetAccountType = accountTypes.find(at => at.name.toLowerCase() === 'asset');
      const assetAccountTypeId = assetAccountType?.id;

      const customerPromise = customerService.getCustomers(token, 0, 1000, selectedBranchId);
      const accountsPromise = assetAccountTypeId
        ? accountService.getAccounts(token, { branchId: selectedBranchId, accountTypeId: assetAccountTypeId, isActive: true, limit: 1000 })
        : Promise.resolve([]);

      Promise.all([customerPromise, accountsPromise]).then(([customersData, accountsData]) => {
        setCustomers(customersData);
        setPaymentAccounts(accountsData.map(a => ({id: a.id, name: a.name, account_code: a.account_code, branch_id: a.branch_id})));
      }).catch(error => {
        console.error("Failed to fetch customers/accounts for branch:", error);
        setCustomers([]);
        setPaymentAccounts([]);
      }).finally(() => setDataLoading(false));

      // Reset dependent fields if branch changes
      setValue('customer_id', undefined);
      setValue('payment_method_account_id', undefined);
    } else {
      setCustomers([]);
      setPaymentAccounts([]);
    }
  }, [token, selectedBranchId, accountTypes, setValue]);


  const handleFormSubmitInternal: SubmitHandler<CustomerPaymentFormData> = (data) => {
    const apiData: CustomerPaymentCreateData = {
      ...data,
      payment_date: formatISO(data.payment_date, { representation: 'date' }),
      reference_number: data.reference_number || null,
      notes: data.notes || null,
      branch_id: Number(data.branch_id),
      amount_paid: Number(data.amount_paid)
    };
    onSubmit(apiData);
  };

  if (dataLoading && (!selectedBranchId || (isAdmin && !enforcedBranchId && branches.length === 0))) {
    return <Box display="flex" justifyContent="center" my={3}><CircularProgress /></Box>;
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <form onSubmit={handleSubmit(handleFormSubmitInternal)}>
        <Grid container spacing={2}>
          {isAdmin && !enforcedBranchId && (
            <Grid item xs={12} md={6}>
              <Controller name="branch_id" control={control} render={({ field }) => (
                <Autocomplete options={branches} getOptionLabel={(b) => b.name}
                  value={branches.find(b => b.id === field.value) || null}
                  onChange={(_, newValue) => field.onChange(newValue ? newValue.id : null)}
                  loading={dataLoading && branches.length === 0}
                  renderInput={(params) => <TextField {...params} label="Branch" fullWidth required error={!!errors.branch_id} helperText={errors.branch_id?.message} />}
                /> )} />
            </Grid>
          )}
          <Grid item xs={12} md={isAdmin && !enforcedBranchId ? 6 : 12}>
            <Controller name="customer_id" control={control} render={({ field }) => (
              <Autocomplete options={customers} getOptionLabel={(c) => `${c.name} (ID: ${c.id})`}
                value={customers.find(c => c.id === field.value) || null}
                onChange={(_, newValue) => field.onChange(newValue ? newValue.id : null)}
                disabled={!selectedBranchId || customers.length === 0}
                loading={dataLoading && selectedBranchId !== undefined && customers.length === 0}
                renderInput={(params) => <TextField {...params} label="Customer" fullWidth required error={!!errors.customer_id} helperText={errors.customer_id?.message || (!selectedBranchId ? "Select branch first" : "")} />}
              /> )} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Controller name="payment_date" control={control} render={({ field }) => (
              <DatePicker label="Payment Date" value={field.value} onChange={(date) => field.onChange(date)}
                          slotProps={{ textField: { fullWidth: true, required: true, error: !!errors.payment_date, helperText: errors.payment_date?.message }}} />
            )} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Controller name="amount_paid" control={control} render={({ field }) => <TextField {...field} label="Amount Paid" type="number" fullWidth required error={!!errors.amount_paid} helperText={errors.amount_paid?.message} inputProps={{ step: "0.01" }} />} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Controller name="payment_method_account_id" control={control} render={({ field }) => (
              <Autocomplete options={paymentAccounts} getOptionLabel={(acc) => `${acc.name} (${acc.account_code || 'N/A'})`}
                value={paymentAccounts.find(acc => acc.id === field.value) || null}
                onChange={(_, newValue) => field.onChange(newValue ? newValue.id : null)}
                disabled={!selectedBranchId || paymentAccounts.length === 0}
                loading={dataLoading && selectedBranchId !== undefined && paymentAccounts.length === 0}
                renderInput={(params) => <TextField {...params} label="Payment To Account (Asset)" fullWidth required error={!!errors.payment_method_account_id} helperText={errors.payment_method_account_id?.message || (!selectedBranchId ? "Select branch first" : "")} />}
              /> )} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Controller name="reference_number" control={control} render={({ field }) => <TextField {...field} value={field.value ?? ''} label="Reference Number (Optional)" fullWidth error={!!errors.reference_number} helperText={errors.reference_number?.message} />} />
          </Grid>
          <Grid item xs={12}>
            <Controller name="notes" control={control} render={({ field }) => <TextField {...field} value={field.value ?? ''} label="Notes (Optional)" fullWidth multiline rows={3} error={!!errors.notes} helperText={errors.notes?.message} />} />
          </Grid>
        </Grid>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          <Button onClick={onCancel} sx={{ mr: 1 }} disabled={formSubmitting}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={formSubmitting || !selectedBranchId}>
            {formSubmitting ? 'Recording Payment...' : 'Record Payment'}
          </Button>
        </Box>
      </form>
    </LocalizationProvider>
  );
};

export default CustomerPaymentForm;
