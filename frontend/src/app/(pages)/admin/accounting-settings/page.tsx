"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useForm, Controller, SubmitHandler, FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Box, Button, CircularProgress, Container, Paper, Typography, Alert, Grid,
  Autocomplete, TextField, FormControl, InputLabel, Select, MenuItem, Card, CardContent, CardHeader
} from '@mui/material';

import { Branch } from '@/types/branch';
import branchService from '@/services/branchService';
import { Account, AccountLookup } from '@/types/account';
import accountService from '@/services/accountService';
import { AccountType } from '@/types/accountType';
import accountTypeService from '@/services/accountTypeService';
import { KnownAccountingSettingKeys, AccountingSettingKey, AccountingSetting, AccountingSettingCreateData, AccountingSettingsFormData } from '@/types/accountingSetting';
import accountingSettingService from '@/services/accountingSettingService';

// Define a mapping from setting keys to human-readable labels and expected account types
const settingKeyMetadata: Record<AccountingSettingKey, { label: string; accountTypeName: string; description: string }> = {
  "default_sales_revenue_account_id": { label: "Sales Revenue Account", accountTypeName: "Revenue", description: "Default account for crediting sales revenue." },
  "default_accounts_receivable_account_id": { label: "Accounts Receivable (A/R) Account", accountTypeName: "Asset", description: "Default account for tracking money owed by customers." },
  "default_cogs_account_id": { label: "Cost of Goods Sold (COGS) Account", accountTypeName: "Expense", description: "Default account for recording the cost of goods sold." },
  "default_inventory_account_id": { label: "Inventory Account", accountTypeName: "Asset", description: "Default account for tracking product inventory." },
  "default_cash_on_hand_account_id": { label: "Cash on Hand Account", accountTypeName: "Asset", description: "Default account for physical cash transactions." },
  // Add more as needed, e.g.:
  // "default_bank_account_id": { label: "Primary Bank Account", accountTypeName: "Asset" },
  // "default_vat_payable_account_id": { label: "VAT Payable Account", accountTypeName: "Liability" },
};

// Create a dynamic Zod schema based on KnownAccountingSettingKeys
const zodSchemaObject = KnownAccountingSettingKeys.reduce((obj, key) => {
  obj[key] = z.number().int().min(1, `${settingKeyMetadata[key].label} is required.`);
  return obj;
}, {} as Record<AccountingSettingKey, z.ZodNumber>);

const accountingSettingsFormSchema = z.object(zodSchemaObject);


const AdminAccountingSettingsPage = () => {
  const { isAuthenticated, token, user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<number | ''>('');

  const [accountsByBranch, setAccountsByBranch] = useState<Account[]>([]); // Changed to Account[]
  const [accountTypes, setAccountTypes] = useState<AccountType[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // For form submission
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm<AccountingSettingsFormData>({
    resolver: zodResolver(accountingSettingsFormSchema),
    defaultValues: KnownAccountingSettingKeys.reduce((acc, key) => ({ ...acc, [key]: undefined }), {}),
  });

  // Initial data loading (branches, account types)
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role?.name.toLowerCase() !== 'admin')) {
      router.push(isAuthenticated ? '/' : '/(pages)/login');
    } else if (token) {
      setIsLoading(true);
      Promise.all([
        branchService.getBranches(token),
        accountTypeService.getAccountTypes(token)
      ]).then(([branchesData, accTypesData]) => {
        setBranches(branchesData);
        setAccountTypes(accTypesData);
        if (branchesData.length > 0) {
          // setSelectedBranchId(branchesData[0].id); // Optionally select first branch by default
        }
      }).catch(err => {
        setActionError("Failed to load initial data: " + err.message);
      }).finally(() => setIsLoading(false));
    }
  }, [isAuthenticated, user, authLoading, router, token]);

  // Fetch accounts and existing settings when branch changes
  const loadBranchSpecificData = useCallback(async (branchId: number) => {
    if (!token || !branchId) {
      setAccountsByBranch([]);
      reset(KnownAccountingSettingKeys.reduce((acc, key) => ({ ...acc, [key]: undefined }), {})); // Clear form
      return;
    }
    setIsLoading(true);
    setActionError(null);
    try {
      const [branchAccounts, existingSettingsArray] = await Promise.all([
        accountService.getAccounts(token, { branchId: branchId, limit: 1000, isActive: true }), // This returns Account[]
        accountingSettingService.getAccountingSettingsForBranch(token, branchId)
      ]);
      setAccountsByBranch(branchAccounts); // Store full Account objects

      const newFormValues: AccountingSettingsFormData = {};
      KnownAccountingSettingKeys.forEach(key => {
        const setting = existingSettingsArray.find(s => s.key === key);
        newFormValues[key] = setting ? setting.value_account_id : undefined;
      });
      reset(newFormValues);

    } catch (err: any) {
      setActionError("Failed to load branch data: " + err.message);
      reset(KnownAccountingSettingKeys.reduce((acc, key) => ({ ...acc, [key]: undefined }), {}));
    } finally {
      setIsLoading(false);
    }
  }, [token, reset]);

  useEffect(() => {
    if (typeof selectedBranchId === 'number') {
      loadBranchSpecificData(selectedBranchId);
    } else {
      setAccountsByBranch([]);
      reset(KnownAccountingSettingKeys.reduce((acc, key) => ({ ...acc, [key]: undefined }), {}));
    }
  }, [selectedBranchId, loadBranchSpecificData, reset]);


  const handleFormSubmit: SubmitHandler<AccountingSettingsFormData> = async (formData) => {
    if (!token || typeof selectedBranchId !== 'number') {
      setActionError("Please select a branch.");
      return;
    }
    setIsSubmitting(true);
    setActionError(null);
    setSuccessMessage(null);
    let successCount = 0;

    try {
      for (const key of KnownAccountingSettingKeys) {
        const accountId = formData[key];
        if (accountId) {
          const createData: AccountingSettingCreateData = {
            branch_id: selectedBranchId,
            key: key,
            value_account_id: accountId,
          };
          await accountingSettingService.upsertAccountingSetting(token, createData);
          successCount++;
        }
      }
      if (successCount > 0) {
        setSuccessMessage(`${successCount} accounting settings saved successfully for branch ${selectedBranchId}!`);
        loadBranchSpecificData(selectedBranchId); // Refresh to show current state
      } else {
        setActionError("No settings were changed or saved.");
      }
    } catch (err: any) {
      setActionError(err.message || 'Failed to save one or more settings.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFilteredAccounts = (accountTypeName: string): AccountLookup[] => {
    const targetAccountType = accountTypes.find(at => at.name.toLowerCase() === accountTypeName.toLowerCase());
    if (!targetAccountType) return accountsByBranch; // Return all if type not found (should not happen)
    return accountsByBranch.filter(acc => {
        // This assumes `acc` has `account_type_id` or nested `account_type`.
        // `AccountLookup` needs `account_type_id` or the main `Account` type should be used.
        // For now, assuming `getAccounts` in service populates `account_type` for filtering here.
        // This requires `Account` type in `accountsByBranch` state, not just `AccountLookup`.
        // Let's adjust `accountsByBranch` state to hold `Account[]`.
        const fullAccount = accountsByBranch.find(a => a.id === acc.id) as Account; // Temporary fix if accountsByBranch is AccountLookup[]
        return fullAccount?.account_type?.id === targetAccountType.id;
    });
};


  if (authLoading || (isLoading && !selectedBranchId)) { // Initial loading for branches or if no branch selected yet
    return <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh"><CircularProgress /></Box>;
  }
   if (!isAuthenticated || user?.role?.name.toLowerCase() !== 'admin') {
    return <Typography sx={{p:3}}>Access Denied. Redirecting...</Typography>;
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>Accounting Settings</Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <FormControl fullWidth sx={{ mb: actionError || successMessage ? 2 : 0 }}>
          <InputLabel id="branch-select-label">Select Branch</InputLabel>
          <Select
            labelId="branch-select-label"
            value={selectedBranchId}
            label="Select Branch"
            onChange={(e) => setSelectedBranchId(e.target.value as number | '')}
          >
            <MenuItem value=""><em>-- Select a Branch --</em></MenuItem>
            {branches.map((branch) => (
              <MenuItem key={branch.id} value={branch.id}>{branch.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        {actionError && <Alert severity="error" sx={{ mt: 2 }}>{actionError}</Alert>}
        {successMessage && <Alert severity="success" sx={{ mt: 2 }}>{successMessage}</Alert>}
      </Paper>

      {typeof selectedBranchId === 'number' && (
        isLoading ? <Box display="flex" justifyContent="center" my={3}><CircularProgress /></Box> :
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <Grid container spacing={3}>
            {KnownAccountingSettingKeys.map((key) => {
              const metadata = settingKeyMetadata[key];
              const filteredAccounts = getFilteredAccounts(metadata.accountTypeName);
              return (
                <Grid item xs={12} key={key}>
                  <Card variant="outlined">
                    <CardHeader title={metadata.label} subheader={metadata.description} titleTypographyProps={{variant: 'h6'}}/>
                    <CardContent>
                      <Controller
                        name={key}
                        control={control}
                        render={({ field }) => (
                          <Autocomplete
                            options={filteredAccounts}
                            getOptionLabel={(option) => `${option.name} (${option.account_code || 'N/A'})`}
                            value={filteredAccounts.find(acc => acc.id === field.value) || null}
                            onChange={(_, newValue) => field.onChange(newValue ? newValue.id : null)}
                            disabled={isSubmitting}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label={`Select ${metadata.accountTypeName} Account`}
                                fullWidth
                                error={!!errors[key]}
                                helperText={(errors[key] as any)?.message || (filteredAccounts.length === 0 ? `No active '${metadata.accountTypeName}' accounts in this branch.` : "")}
                              />
                            )}
                          />
                        )}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button type="submit" variant="contained" disabled={isSubmitting || isLoading}>
              {isSubmitting ? 'Saving Settings...' : 'Save All Settings'}
            </Button>
          </Box>
        </form>
      )}
    </Container>
  );
};

export default AdminAccountingSettingsPage;
