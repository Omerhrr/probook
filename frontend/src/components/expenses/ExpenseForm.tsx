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
});

export type ExpenseFormData = z.infer<typeof expenseFormSchema>;

interface ExpenseFormProps {
  expense?: Expense | null;
  onSubmit: (data: ExpenseCreateData | ExpenseUpdateData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ expense, onSubmit, onCancel, isLoading }) => {
  const { token } = useAuth();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [supplierSearchLoading, setSupplierSearchLoading] = useState(false);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      expense_date: expense?.expense_date ? new Date(expense.expense_date) : new Date(),
      category: expense?.category || '',
      description: expense?.description || '',
      amount: expense?.amount || 0,
      supplier_id: expense?.supplier_id || null,
    },
  });

  const fetchSuppliers = useCallback(async () => {
    if (!token) return;
    setSupplierSearchLoading(true);
    try {
      const data = await supplierService.getSuppliers(token, 0, 50); // Limit for autocomplete
      setSuppliers(data);
    } catch (error) {
      console.error("Failed to fetch suppliers:", error);
    } finally {
      setSupplierSearchLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  useEffect(() => {
    reset({
      expense_date: expense?.expense_date ? new Date(expense.expense_date) : new Date(),
      category: expense?.category || '',
      description: expense?.description || '',
      amount: expense?.amount || 0,
      supplier_id: expense?.supplier_id || null,
    });
  }, [expense, reset]);

  const handleFormSubmit: SubmitHandler<ExpenseFormData> = (data) => {
    const apiData = {
      ...data,
      expense_date: formatISO(data.expense_date, { representation: 'date' }), // Format to 'YYYY-MM-DD'
      description: data.description || null,
      supplier_id: data.supplier_id || null,
    };
    onSubmit(apiData);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <Typography variant="h6" gutterBottom>
          {expense ? 'Edit Expense' : 'Add New Expense'}
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
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
          <Grid item xs={12} sm={6}>
            <Controller
              name="supplier_id"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  options={suppliers}
                  getOptionLabel={(option) => `${option.name} (ID: ${option.id})`}
                  onChange={(_, newValue) => field.onChange(newValue ? newValue.id : null)}
                  value={suppliers.find(s => s.id === field.value) || null}
                  loading={supplierSearchLoading}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Supplier (Optional)"
                      variant="outlined"
                      error={!!errors.supplier_id}
                      helperText={errors.supplier_id?.message}
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {supplierSearchLoading ? <CircularProgress color="inherit" size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                  disabled={isLoading}
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
