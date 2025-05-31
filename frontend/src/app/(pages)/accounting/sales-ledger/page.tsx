"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import journalEntryService from '@/services/journalEntryService';
import { JournalEntry, JournalEntryItem } from '@/types/journalEntry';
import { Branch } from '@/types/branch';
import branchService from '@/services/branchService';
import { AccountingSetting, AccountingSettingKey } from '@/types/accountingSetting';
import accountingSettingService from '@/services/accountingSettingService';
import { getSingleAccountIdFromSettings } from '@/utils/accountingUtils';
import {
  Box, Button, CircularProgress, Container, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Typography, Alert, Grid,
  FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import FilterListIcon from '@mui/icons-material/FilterList';
import { format, formatISO, parseISO } from 'date-fns';

const SalesLedgerPage = () => {
  const { isAuthenticated, token, user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false); // For data fetching on "View Ledger"
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<number | ''>('');
  const [filterStartDate, setFilterStartDate] = useState<Date | null>(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [filterEndDate, setFilterEndDate] = useState<Date | null>(new Date());

  const [salesRevenueAccountId, setSalesRevenueAccountId] = useState<number | null>(null);
  const [dataFetched, setDataFetched] = useState(false);


  const isAdmin = user?.role?.name.toLowerCase() === 'admin';
  const isBranchManager = user?.role?.name.toLowerCase() === 'branch_manager';

  // Fetch branches for Admin selector
  useEffect(() => {
    if (!authLoading && isAuthenticated && token) {
      if (isAdmin) {
        branchService.getBranches(token)
          .then(data => { setBranches(data); if (data.length > 0) setSelectedBranchId(data[0].id); }) // Default to first branch for admin
          .catch(e => setError("Failed to load branches: " + e.message));
      } else if (isBranchManager && user?.branch?.id) {
        setSelectedBranchId(user.branch.id); // BM fixed to their branch
      }
    } else if (!authLoading && !isAuthenticated) {
      router.push('/(pages)/login');
    }
  }, [isAuthenticated, user, authLoading, router, token, isAdmin, isBranchManager]);

  // Fetch account settings when branch is selected
  const fetchAccountSettingsForBranch = useCallback(async (branchId: number) => {
    if (!token) return;
    setIsLoading(true); setError(null);
    try {
      const settings = await accountingSettingService.getAccountingSettingsForBranch(token, branchId);
      const revenueAccId = getSingleAccountIdFromSettings(settings, "default_sales_revenue_account_id");
      if (!revenueAccId) {
        setError(`Default Sales Revenue Account not configured for branch ${branchId}.`);
        setSalesRevenueAccountId(null);
      } else {
        setSalesRevenueAccountId(revenueAccId);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch account settings.');
      setSalesRevenueAccountId(null);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (typeof selectedBranchId === 'number') {
      fetchAccountSettingsForBranch(selectedBranchId);
    } else {
      setSalesRevenueAccountId(null); // Clear if no branch or "all" selected
      setJournalEntries([]); // Clear ledger if no specific branch for revenue account
    }
  }, [selectedBranchId, fetchAccountSettingsForBranch]);


  const handleViewLedger = async () => {
    if (!token || !selectedBranchId || !salesRevenueAccountId || !filterStartDate || !filterEndDate) {
      setError("Please select branch, ensure Sales Revenue account is set, and select a valid date range.");
      setJournalEntries([]);
      return;
    }
    if (filterStartDate > filterEndDate) {
        setError("Start date cannot be after end date.");
        return;
    }

    setIsLoading(true); setError(null); setDataFetched(false);
    try {
      const params: any = {
        branchId: selectedBranchId, // Admin selected or BM's branch
        accountId: salesRevenueAccountId,
        entryDateStart: formatISO(filterStartDate, { representation: 'date' }),
        entryDateEnd: formatISO(filterEndDate, { representation: 'date' }),
        limit: 10000, // Fetch all relevant entries
      };
      const data = await journalEntryService.getJournalEntries(token, params);
      setJournalEntries(data);
      setDataFetched(true);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch sales ledger.');
      setJournalEntries([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh"><CircularProgress /></Box>;
  }
  if (!isAuthenticated || !user?.role?.name || !['admin', 'branch_manager'].includes(user.role.name.toLowerCase())) {
    return <Typography sx={{p:3}}>Access Denied. Redirecting...</Typography>;
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>Sales Ledger</Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>Filters</Typography>
        <Grid container spacing={2} alignItems="center">
          {isAdmin && (
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth size="small" disabled={branches.length === 0}>
                <InputLabel>Branch</InputLabel>
                <Select value={selectedBranchId} label="Branch" onChange={(e) => setSelectedBranchId(e.target.value as number)}>
                  {branches.map((b) => <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
          )}
          <Grid item xs={12} sm={isAdmin ? 3 : 4}><DatePicker label="Start Date" value={filterStartDate} onChange={setFilterStartDate} slotProps={{textField:{fullWidth: true, size: 'small'}}} /></Grid>
          <Grid item xs={12} sm={isAdmin ? 3 : 4}><DatePicker label="End Date" value={filterEndDate} onChange={setFilterEndDate} slotProps={{textField:{fullWidth: true, size: 'small'}}} /></Grid>
          <Grid item xs={12} sm={isAdmin ? 3 : 4}><Button variant="contained" startIcon={<FilterListIcon />} onClick={handleViewLedger} fullWidth disabled={isLoading || !selectedBranchId || !salesRevenueAccountId}>View Ledger</Button></Grid>
        </Grid>
        {!salesRevenueAccountId && selectedBranchId && !isLoading && <Alert severity="warning" sx={{mt:1}}>Sales Revenue Account not set for this branch in Accounting Settings.</Alert>}
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {isLoading && <Box display="flex" justifyContent="center" my={3}><CircularProgress /></Box>}

      {!isLoading && dataFetched && salesRevenueAccountId && (
        <Paper sx={{ width: '100%', overflow: 'hidden', mt: 2 }}>
          <TableContainer sx={{ maxHeight: 600 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell>JE Date</TableCell><TableCell>JE ID</TableCell><TableCell>JE Description</TableCell>
                  <TableCell>Account (Sales Revenue)</TableCell>
                  <TableCell align="right">Debit</TableCell><TableCell align="right">Credit</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {journalEntries.length === 0 && <TableRow><TableCell colSpan={6} align="center">No sales entries found for this period/account.</TableCell></TableRow>}
                {journalEntries.map((entry) =>
                    entry.items.filter(item => item.account_id === salesRevenueAccountId && item.credit_amount > 0) // Show only credit side to revenue
                    .map(item => (
                        <TableRow hover key={`${entry.id}-${item.id}`}>
                            <TableCell>{format(parseISO(entry.entry_date), 'PP')}</TableCell>
                            <TableCell>{entry.id}</TableCell>
                            <TableCell>{entry.description}</TableCell>
                            <TableCell>{item.account?.name}</TableCell>
                            <TableCell align="right">{item.debit_amount > 0 ? item.debit_amount.toFixed(2) : '-'}</TableCell>
                            <TableCell align="right">{item.credit_amount > 0 ? item.credit_amount.toFixed(2) : '-'}</TableCell>
                        </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          {/* No pagination here as we fetch all relevant JEs for the account and period */}
        </Paper>
      )}
    </Container>
    </LocalizationProvider>
  );
};

export default SalesLedgerPage;
