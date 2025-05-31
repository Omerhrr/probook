"use client";

// This component is designed to be used within a react-hook-form FieldArray.
// Props will be passed by the parent form (JournalEntryForm) using react-hook-form's `control` and `register`.

import React from 'react';
import { Control, Controller, UseFieldArrayRemove, UseFormWatch } from 'react-hook-form';
import { TextField, IconButton, Autocomplete, Grid, CircularProgress } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { AccountLookup } from '@/types/account'; // Using AccountLookup for lighter Autocomplete options
import { JournalEntryFormData, JournalEntryItemFormData } from './JournalEntryForm'; // Assuming types are co-located or imported

interface JournalEntryItemFormProps {
  index: number;
  control: Control<JournalEntryFormData>; // Control from the parent form
  remove: UseFieldArrayRemove;
  accounts: AccountLookup[]; // Accounts for the selected branch
  accountsLoading: boolean;
  watch: UseFormWatch<JournalEntryFormData>; // To watch other fields if needed (e.g., for complex validation)
  setValue: (name: any, value: any, options?: Object) => void; // To set values, e.g. account_name
}

const JournalEntryItemForm: React.FC<JournalEntryItemFormProps> = ({
  index,
  control,
  remove,
  accounts,
  accountsLoading,
  watch,
  setValue,
}) => {
  const currentItem = watch(`items.${index}` as const);

  const handleAccountChange = (newValue: AccountLookup | null) => {
    setValue(`items.${index}.account_id`, newValue ? newValue.id : null);
    // We don't store account_name in the form data sent to backend, but could for display in row if needed
  };

  // Ensure either debit or credit is zero
  const handleDebitChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(event.target.value) || 0;
    setValue(`items.${index}.debit_amount`, value);
    if (value > 0) {
      setValue(`items.${index}.credit_amount`, 0);
    }
  };

  const handleCreditChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(event.target.value) || 0;
    setValue(`items.${index}.credit_amount`, value);
    if (value > 0) {
      setValue(`items.${index}.debit_amount`, 0);
    }
  };


  return (
    <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
      <Grid item xs={12} sm={4} md={3}>
        <Controller
          name={`items.${index}.account_id`}
          control={control}
          render={({ field, fieldState: { error } }) => (
            <Autocomplete
              options={accounts}
              getOptionLabel={(option) => `${option.name} (${option.account_code || 'N/A'})`}
              value={accounts.find(acc => acc.id === field.value) || null}
              onChange={(_, newValue) => handleAccountChange(newValue)}
              loading={accountsLoading}
              disabled={accountsLoading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Account"
                  required
                  error={!!error}
                  helperText={error?.message || (accounts.length === 0 && !accountsLoading ? "No accounts in branch" : "")}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {accountsLoading ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
          )}
        />
      </Grid>
      <Grid item xs={6} sm={3} md={2}>
        <Controller
          name={`items.${index}.debit_amount`}
          control={control}
          render={({ field, fieldState: { error } }) => (
            <TextField
              {...field}
              label="Debit"
              type="number"
              fullWidth
              inputProps={{ step: "0.01", min: 0 }}
              error={!!error}
              helperText={error?.message}
              onChange={(e) => { field.onChange(e); handleDebitChange(e as any); }}
            />
          )}
        />
      </Grid>
      <Grid item xs={6} sm={3} md={2}>
        <Controller
          name={`items.${index}.credit_amount`}
          control={control}
          render={({ field, fieldState: { error } }) => (
            <TextField
              {...field}
              label="Credit"
              type="number"
              fullWidth
              inputProps={{ step: "0.01", min: 0 }}
              error={!!error}
              helperText={error?.message}
              onChange={(e) => { field.onChange(e); handleCreditChange(e as any); }}
            />
          )}
        />
      </Grid>
      <Grid item xs={10} sm={10} md={4}>
        <Controller
          name={`items.${index}.description`}
          control={control}
          render={({ field, fieldState: { error } }) => (
            <TextField
              {...field}
              value={field.value ?? ''}
              label="Line Description (Optional)"
              fullWidth
              error={!!error}
              helperText={error?.message}
            />
          )}
        />
      </Grid>
      <Grid item xs={2} sm={2} md={1} sx={{ textAlign: 'right' }}>
        <IconButton onClick={() => remove(index)} color="error">
          <DeleteIcon />
        </IconButton>
      </Grid>
    </Grid>
  );
};

export default JournalEntryItemForm;
