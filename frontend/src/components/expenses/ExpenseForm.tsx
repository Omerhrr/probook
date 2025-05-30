"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { TextField, Button, Grid, Box, Typography, Autocomplete, CircularProgress } from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { formatISO } from 'date-fns';

import { Expense, ExpenseCreateData, ExpenseUpdateData } from '@/types/expense';
import { Supplier } from '@/types/supplier';
import supplierService from '@/services/supplierService';
import { useAuth } from '@/contexts/AuthContext';
import { Branch } from '@/types/branch'; // For branch selection
import branchService from '@/services/branchService'; // To fetch branches for admin

// Zod schema for validation
const expenseFormSchema = z.object({
  expense_date: z.date({ required_error: "Expense date is required" }),
  category: z.string().min(1, 'Category is required'),
  description: z.string().optional().nullable(),
  amount: z.preprocess(
    (val) => parseFloat(String(val)),
    z.number().min(0.01, 'Amount must be greater than 0')
  ),
  supplier_id: z.number().int().optional().nullable(),
  branch_id: z.number().int().min(1, "Branch is required"),
});

export type ExpenseFormData = z.infer<typeof expenseFormSchema>;

interface ExpenseFormProps {
  expense?: Expense | null;
  onSubmit: (data: ExpenseCreateData | ExpenseUpdateData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  enforcedBranchId?: number | null;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ expense, onSubmit, onCancel, isLoading, enforcedBranchId }) => {
  const { token, user } = useAuth();
  const isAdmin = user?.role?.name.toLowerCase() === 'admin';

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [supplierSearchLoading, setSupplierSearchLoading] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchesLoading, setBranchesLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);


  const { control, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      expense_date: expense?.expense_date ? new Date(expense.expense_date) : new Date(),
      category: expense?.category || '',
      description: expense?.description || '',
      amount: expense?.amount || 0,
      supplier_id: expense?.supplier_id || null,
      branch_id: enforcedBranchId || expense?.branch?.id || undefined,
    },
  });

  const selectedBranchId = watch("branch_id");

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

  const fetchSuppliersByBranch = useCallback(async () => {
    if (token && selectedBranchId) {
      setSupplierSearchLoading(true);
      try {
        const data = await supplierService.getSuppliers(token, 0, 100, selectedBranchId);
        setSuppliers(data);
      } catch (error) {
        console.error("Failed to fetch suppliers for branch:", error);
        setSuppliers([]);
      } finally {
        setSupplierSearchLoading(false);
      }
      setValue('supplier_id', null); // Reset supplier when branch changes
    } else {
      setSuppliers([]);
    }
  }, [token, selectedBranchId, setValue]);

  useEffect(() => {
    setDataLoading(true);
    Promise.all([
        fetchBranchesForAdmin(), // Fetches branches if admin and no enforcedBranchId
        // Initial supplier fetch might depend on initial selectedBranchId state
    ]).finally(() => setDataLoading(false));
  }, [fetchBranchesForAdmin]);

  useEffect(() => {
    // This effect runs when selectedBranchId changes (e.g., admin selects a branch)
    // or when the component initially loads with a selectedBranchId (from enforced or existing expense)
    if (selectedBranchId) {
        fetchSuppliersByBranch();
    } else {
        setSuppliers([]); // Clear suppliers if no branch is selected
    }
  }, [selectedBranchId, fetchSuppliersByBranch]);


  useEffect(() => {
    const defaultBranchId = enforcedBranchId || expense?.branch?.id || undefined;
    reset({
      expense_date: expense?.expense_date ? new Date(expense.expense_date) : new Date(),
      category: expense?.category || '',
      description: expense?.description || '',
      amount: expense?.amount || 0,
      supplier_id: expense?.supplier_id || null,
      branch_id: defaultBranchId,
    });
    if (defaultBranchId) {
        setValue('branch_id', defaultBranchId);
    }
  }, [expense, reset, enforcedBranchId, setValue]);

  const handleFormSubmit: SubmitHandler<ExpenseFormData> = (data) => {
    const apiData = {
      ...data,
      expense_date: formatISO(data.expense_date, { representation: 'date' }),
      description: data.description || null,
      supplier_id: data.supplier_id || null,
      branch_id: Number(data.branch_id),
    };
    onSubmit(apiData);
  };

  if (dataLoading && isAdmin && !enforcedBranchId) {
    return <Box display="flex" justifyContent="center" my={3}><CircularProgress /></Box>;
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <Typography variant="h6" gutterBottom>{expense ? 'Edit Expense' : 'Add New Expense'}</Typography>
        <Grid container spacing={2}>
          {isAdmin && !enforcedBranchId && (
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
                    renderInput={(params) => <TextField {...params} label="Branch" fullWidth required error={!!errors.branch_id} helperText={errors.branch_id?.message} />}
                    disabled={isLoading || branchesLoading}
                  />
                )}
              />
            </Grid>
          )}
          <Grid item xs={12} sm={isAdmin && !enforcedBranchId ? 6 : 12}> {/* Adjust width if branch selector is shown */}
            <Controller
              name="expense_date"
              control={control}
              render={({ field }) => (
                <DatePicker
                  label="Expense Date"
                  value={field.value}
                  onChange={(date) => field.onChange(date)}
                  slotProps={{ textField: { fullWidth: true, error: !!errors.expense_date, helperText: errors.expense_date?.message, disabled: isLoading } }}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Category" fullWidth required error={!!errors.category} helperText={errors.category?.message} disabled={isLoading} />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField {...field} value={field.value ?? ''} label="Description" fullWidth multiline rows={3} error={!!errors.description} helperText={errors.description?.message} disabled={isLoading} />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Controller
              name="amount"
              control={control}
              render={({ field }) => (
                <TextField {...field} type="number" label="Amount" fullWidth required error={!!errors.amount} helperText={errors.amount?.message} disabled={isLoading} inputProps={{ step: "0.01" }} />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6}> {/* Supplier Autocomplete */}
            <Controller
              name="supplier_id"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  options={suppliers}
                  getOptionLabel={(option) => option.name} // Simpler label
                  onChange={(_, newValue) => field.onChange(newValue ? newValue.id : null)}
                  value={suppliers.find(s => s.id === field.value) || null}
                  loading={supplierSearchLoading}
                  disabled={isLoading || !selectedBranchId || (suppliers.length === 0 && !supplierSearchLoading)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Supplier (Optional)"
                      variant="outlined"
                      error={!!errors.supplier_id}
                      helperText={errors.supplier_id?.message || (!selectedBranchId ? "Select a branch first" : (suppliers.length === 0 && !supplierSearchLoading ? "No suppliers in selected branch" : ""))}
                      InputProps={{ ...params.InputProps, endAdornment: (<>{supplierSearchLoading ? <CircularProgress color="inherit" size={20} /> : null}{params.InputProps.endAdornment}</>),}}
                    />
                  )}
                />
              )}
            />
          </Grid>
        </Grid>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          <Button onClick={onCancel} sx={{ mr: 1 }} disabled={isLoading}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={isLoading}>
            {isLoading ? (expense ? 'Saving...' : 'Creating...') : (expense ? 'Save Changes' : 'Create Expense')}
          </Button>
        </Box>
      </form>
    </LocalizationProvider>
  );
};

export default ExpenseForm;
