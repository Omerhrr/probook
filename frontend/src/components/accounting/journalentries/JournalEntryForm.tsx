"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useForm, Controller, useFieldArray, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { TextField, Button, Grid, Box, Typography, Autocomplete, Paper, Alert, CircularProgress } from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { formatISO, parseISO } from 'date-fns';

import { JournalEntryCreateData, JournalEntryItemCreateData } from '@/types/journalEntry';
import { Branch } from '@/types/branch';
import { AccountLookup } from '@/types/account';
import branchService from '@/services/branchService';
import accountService from '@/services/accountService';
import { useAuth } from '@/contexts/AuthContext';
import JournalEntryItemForm from './JournalEntryItemForm'; // The row component

// Zod schema for an individual sale item (to be used in the field array)
export const journalEntryItemFormSchema = z.object({
  account_id: z.number({required_error: "Account is required."}).min(1, "Account is required."),
  // account_name: z.string().optional(), // Not actually needed for submission, but good for internal state if any
  debit_amount: z.preprocess(val => parseFloat(String(val)) || 0, z.number().min(0)),
  credit_amount: z.preprocess(val => parseFloat(String(val)) || 0, z.number().min(0)),
  description: z.string().optional().nullable(),
}).refine(data => data.debit_amount > 0 || data.credit_amount > 0, {
  message: "Either debit or credit amount must be greater than 0.",
  path: ["debit_amount"], // Path to show error, can be any of the two or form level
}).refine(data => !(data.debit_amount > 0 && data.credit_amount > 0), {
  message: "Cannot have both debit and credit amounts in a single line.",
  path: ["credit_amount"],
});


// Zod schema for the overall journal entry form
export const journalEntryFormSchema = z.object({
  entry_date: z.date({ required_error: "Entry date is required."}),
  description: z.string().min(1, "Overall description is required."),
  branch_id: z.number().int().min(1, "Branch is required."),
  items: z.array(journalEntryItemFormSchema).min(2, "At least two journal items are required."),
}).refine(data => {
    const totalDebits = data.items.reduce((sum, item) => sum + (item.debit_amount || 0), 0);
    const totalCredits = data.items.reduce((sum, item) => sum + (item.credit_amount || 0), 0);
    return Math.abs(totalDebits - totalCredits) < 0.001; // Check for floating point equality
}, {
    message: "Total debits must equal total credits.",
    path: ["items"], // Show error at the items level or a general form error
});

export type JournalEntryFormData = z.infer<typeof journalEntryFormSchema>;
export type JournalEntryItemFormData = z.infer<typeof journalEntryItemFormSchema>;


interface JournalEntryFormProps {
  onSubmit: (data: JournalEntryCreateData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean; // For submission loading state
  initialError?: string | null;
  enforcedBranchId?: number | null; // If creating for a specific branch (e.g. admin selected on list page)
}

const JournalEntryForm: React.FC<JournalEntryFormProps> = ({ onSubmit, onCancel, isLoading: formSubmitting, initialError, enforcedBranchId }) => {
  const { token, user } = useAuth();
  const isAdmin = user?.role?.name.toLowerCase() === 'admin';

  const [branches, setBranches] = useState<Branch[]>([]);
  const [accountsForBranch, setAccountsForBranch] = useState<AccountLookup[]>([]);

  const [dataLoading, setDataLoading] = useState(true); // For fetching initial dropdown data
  const [formError, setFormError] = useState<string | null>(initialError || null);

  const { control, handleSubmit, watch, setValue, formState: { errors, isValid } } = useForm<JournalEntryFormData>({
    resolver: zodResolver(journalEntryFormSchema),
    defaultValues: {
      entry_date: new Date(),
      description: '',
      branch_id: enforcedBranchId || (isAdmin ? undefined : user?.branch?.id) || undefined,
      items: [{ account_id: undefined, debit_amount: 0, credit_amount: 0, description: '' }, { account_id: undefined, debit_amount: 0, credit_amount: 0, description: '' }] // Start with two empty lines
    },
    mode: "onChange", // Validate on change to update total debits/credits display and errors
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const currentItems = watch("items");
  const selectedBranchId = watch("branch_id");

  // Fetch branches for Admin selector
  const fetchBranchesForAdmin = useCallback(async () => {
    if (isAdmin && !enforcedBranchId && token) {
      try {
        const branchesData = await branchService.getBranches(token);
        setBranches(branchesData);
      } catch (error) { console.error("Failed to fetch branches:", error); }
    }
  }, [isAdmin, enforcedBranchId, token]);

  // Fetch accounts based on selected branch
  const fetchAccountsForBranch = useCallback(async () => {
    if (token && selectedBranchId) {
      setDataLoading(true); // Use general data loading for accounts
      try {
        const accountsData = await accountService.getAccountLookups(token, selectedBranchId);
        setAccountsForBranch(accountsData);
      } catch (error) { console.error("Failed to fetch accounts for branch:", error); setAccountsForBranch([]); }
      finally { setDataLoading(false); }
    } else {
      setAccountsForBranch([]);
      setDataLoading(false);
    }
  }, [token, selectedBranchId]);

  useEffect(() => {
    fetchBranchesForAdmin();
  }, [fetchBranchesForAdmin]);

  useEffect(() => {
    if (selectedBranchId) {
      fetchAccountsForBranch();
      // When branch changes, existing items might have accounts from a different branch.
      // It's complex to handle this perfectly without clearing items or re-validating each.
      // For now, we'll rely on the user to correct if branch changes after items added.
      // Or, disable branch change if items exist.
    } else {
      setAccountsForBranch([]);
    }
  }, [selectedBranchId, fetchAccountsForBranch]);

  // Set initial branch for branch manager or if enforced
  useEffect(() => {
    const initialBranchId = enforcedBranchId || (isBranchManager && user?.branch?.id ? user.branch.id : undefined);
    if (initialBranchId) {
      setValue('branch_id', initialBranchId);
    }
  }, [isBranchManager, user?.branch?.id, setValue, enforcedBranchId]);


  const handleFormSubmitInternal: SubmitHandler<JournalEntryFormData> = (data) => {
    setFormError(null);
    const apiData: JournalEntryCreateData = {
      entry_date: formatISO(data.entry_date, { representation: 'date' }),
      description: data.description,
      branch_id: Number(data.branch_id),
      items: data.items.map(item => ({
        account_id: Number(item.account_id),
        debit_amount: Number(item.debit_amount || 0),
        credit_amount: Number(item.credit_amount || 0),
        description: item.description || null,
      })),
    };
    onSubmit(apiData).catch(err => setFormError(err.message || "Submission failed"));
  };

  const totalDebits = currentItems.reduce((sum, item) => sum + (item.debit_amount || 0), 0);
  const totalCredits = currentItems.reduce((sum, item) => sum + (item.credit_amount || 0), 0);

  if (dataLoading && isAdmin && !enforcedBranchId && branches.length === 0) { // Initial load for admin branch dropdown
      return <Box display="flex" justifyContent="center" my={3}><CircularProgress /></Box>;
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <form onSubmit={handleSubmit(handleFormSubmitInternal)}>
        {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
        {errors.items && typeof errors.items.message === 'string' && <Alert severity="error" sx={{ mb: 2 }}>{errors.items.message}</Alert>}

        <Grid container spacing={2} sx={{mb: 2}}>
            {isAdmin && !enforcedBranchId && (
            <Grid item xs={12} md={4}>
                <Controller name="branch_id" control={control} render={({ field }) => (
                <Autocomplete options={branches} getOptionLabel={(option) => option.name}
                    onChange={(_, newValue) => field.onChange(newValue ? newValue.id : null)}
                    value={branches.find(b => b.id === field.value) || null}
                    loading={branchesLoading}
                    renderInput={(params) => <TextField {...params} label="Select Branch" fullWidth required error={!!errors.branch_id} helperText={errors.branch_id?.message} />}
                /> )} />
            </Grid>
            )}
            <Grid item xs={12} md={isAdmin && !enforcedBranchId ? 4 : 6}>
                <Controller name="entry_date" control={control} render={({ field }) => (
                    <DatePicker label="Entry Date" value={field.value} onChange={(date) => field.onChange(date)}
                                slotProps={{ textField: { fullWidth: true, required: true, error: !!errors.entry_date, helperText: errors.entry_date?.message }}} />
                )} />
            </Grid>
            <Grid item xs={12} md={isAdmin && !enforcedBranchId ? 4 : 6}>
                <Controller name="description" control={control} render={({ field }) => <TextField {...field} label="Overall Description" fullWidth required error={!!errors.description} helperText={errors.description?.message} />} />
            </Grid>
        </Grid>

        <Typography variant="h6" gutterBottom>Journal Items</Typography>
        <Paper variant="outlined" sx={{p:2}}>
            {fields.map((item, index) => (
                <JournalEntryItemForm
                    key={item.id}
                    index={index}
                    control={control}
                    remove={remove}
                    accounts={accountsForBranch}
                    accountsLoading={dataLoading && selectedBranchId !== undefined}
                    watch={watch}
                    setValue={setValue}
                />
            ))}
            <Button type="button" onClick={() => append({ account_id: undefined, debit_amount: 0, credit_amount: 0, description: '' })} sx={{ mt: 1 }}>
            Add Item
            </Button>
            {errors.items && !errors.items.message && typeof errors.items !== 'string' && ( // FieldArray specific errors
                (errors.items as any[]).map((itemError, index) =>
                    itemError && <Alert key={index} severity="warning" sx={{mt:1}}>Error in item {index + 1}. Check fields.</Alert>
                )
            )}
        </Paper>

        <Grid container justifyContent="flex-end" sx={{ mt: 2 }}>
            <Typography variant="h6" sx={{mr: 2}}>Total Debits: {totalDebits.toFixed(2)}</Typography>
            <Typography variant="h6">Total Credits: {totalCredits.toFixed(2)}</Typography>
        </Grid>
        {Math.abs(totalDebits - totalCredits) >= 0.001 && fields.length > 0 && (
            <Alert severity="warning" sx={{mt:1}}>Debits and Credits do not match!</Alert>
        )}


        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button onClick={onCancel} sx={{ mr: 1 }} disabled={formSubmitting}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={formSubmitting || !isValid}>
            {formSubmitting ? 'Submitting...' : 'Create Journal Entry'}
            </Button>
        </Box>
      </form>
    </LocalizationProvider>
  );
};

export default JournalEntryForm;
