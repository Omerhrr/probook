"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import customerPaymentService from '@/services/customerPaymentService';
import { CustomerPayment } from '@/types/customerPayment';
import { Branch } from '@/types/branch';
import branchService from '@/services/branchService';
import { Customer } from '@/types/customer'; // For customer filter dropdown
import customerService from '@/services/customerService'; // For customer filter
import { AccountLookup } from '@/types/account'; // For payment account filter
import accountService from '@/services/accountService'; // For payment account filter

import {
  Box, Button, CircularProgress, Container, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Typography, Alert, TablePagination,
  Grid, FormControl, InputLabel, Select, MenuItem, TextField
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import { format, formatISO, parseISO } from 'date-fns';

const CustomerPaymentsPage = () => {
  const { isAuthenticated, token, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [payments, setPayments] = useState<CustomerPayment[]>([]);
  const [allPayments, setAllPayments] = useState<CustomerPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Filter States
  const [branches, setBranches] = useState<Branch[]>([]);
  const [customersForFilter, setCustomersForFilter] = useState<Customer[]>([]);
  const [assetAccountsForFilter, setAssetAccountsForFilter] = useState<AccountLookup[]>([]);

  const [filterBranchId, setFilterBranchId] = useState<number | 'all' | ''>('');
  const [filterCustomerId, setFilterCustomerId] = useState<number | ''>('');
  const [filterPaymentAccountId, setFilterPaymentAccountId] = useState<number | ''>('');
  const [filterStartDate, setFilterStartDate] = useState<Date | null>(null);
  const [filterEndDate, setFilterEndDate] = useState<Date | null>(null);

  const isAdmin = user?.role?.name.toLowerCase() === 'admin';
  const isBranchManager = user?.role?.name.toLowerCase() === 'branch_manager';

  // Initial data load for filters (branches, and potentially customers/accounts if a branch is pre-selected)
  useEffect(() => {
    if (!authLoading && isAuthenticated && token) {
      if (isAdmin) {
        branchService.getBranches(token)
          .then(data => { setBranches(data); if (filterBranchId === '') setFilterBranchId('all'); })
          .catch(e => setError("Failed to load branches."));
      } else if (isBranchManager && user?.branch?.id) {
        setFilterBranchId(user.branch.id); // Auto-select manager's branch
      }
    } else if (!authLoading && !isAuthenticated) {
      router.push('/(pages)/login');
    }
  }, [isAuthenticated, user, authLoading, router, token, isAdmin, isBranchManager]);

  // Load customers and asset accounts when filterBranchId changes
  useEffect(() => {
    if (token && (typeof filterBranchId === 'number')) {
      customerService.getCustomers(token, 0, 1000, filterBranchId).then(setCustomersForFilter).catch(e => setError("Failed to load customers for filter."));
      // Assuming 'Asset' type ID is known or fetched. For simplicity, let's say it's 1 or fetch dynamically.
      // This part might need an AccountTypeService call if not hardcoding asset type id
      accountService.getAccounts(token, { branchId: filterBranchId, accountTypeId: 1 /* Placeholder for Asset type ID */, isActive: true, limit: 1000 })
        .then(accs => setAssetAccountsForFilter(accs.map(a => ({ id: a.id, name: a.name, account_code: a.account_code, branch_id: a.branch_id }))))
        .catch(e => setError("Failed to load payment accounts for filter."));
    } else if (filterBranchId === 'all' && isAdmin && token) { // Admin selected "All Branches"
        customerService.getCustomers(token, 0, 1000, 'all').then(setCustomersForFilter).catch(e => setError("Failed to load customers."));
        accountService.getAccounts(token, { limit: 1000, accountTypeId: 1, isActive: true /* Potentially remove branchId filter for accounts if selecting all branches for payments */ })
            .then(accs => setAssetAccountsForFilter(accs.map(a => ({ id: a.id, name: a.name, account_code: a.account_code, branch_id: a.branch_id }))))
            .catch(e => setError("Failed to load payment accounts."));
    } else {
      setCustomersForFilter([]);
      setAssetAccountsForFilter([]);
    }
  }, [token, filterBranchId, isAdmin]);


  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      setSuccessMessage('Customer Payment recorded successfully!');
      router.replace('/(pages)/accounting/customer-payments', { scroll: false });
    }
  }, [searchParams, router]);

  const fetchPayments = useCallback(async () => {
    if (!token || (!isAdmin && !isBranchManager)) return;

    let effectiveBranchId: number | 'all' | undefined;
    if (isAdmin) {
      effectiveBranchId = filterBranchId === '' ? 'all' : filterBranchId;
    } else if (isBranchManager) {
      effectiveBranchId = user?.branch?.id;
    }

    if (isBranchManager && effectiveBranchId === undefined) {
      setError("Branch manager not assigned to a branch."); setIsLoading(false); setAllPayments([]); return;
    }
    if (!effectiveBranchId && isAdmin && filterBranchId === '') effectiveBranchId = 'all';

    setIsLoading(true); setError(null);
    try {
      const params: GetCustomerPaymentsParams = {
        skip: 0, limit: 10000,
        branchId: effectiveBranchId,
        customerId: filterCustomerId === '' ? undefined : filterCustomerId,
        paymentMethodAccountId: filterPaymentAccountId === '' ? undefined : filterPaymentAccountId,
        paymentDateStart: filterStartDate ? formatISO(filterStartDate, { representation: 'date' }) : undefined,
        paymentDateEnd: filterEndDate ? formatISO(filterEndDate, { representation: 'date' }) : undefined,
      };
      const data = await customerPaymentService.getCustomerPayments(token, params);
      setAllPayments(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch payments.'); setAllPayments([]);
    } finally {
      setIsLoading(false);
    }
  }, [token, isAdmin, isBranchManager, user?.branch?.id, filterBranchId, filterCustomerId, filterPaymentAccountId, filterStartDate, filterEndDate]);

  useEffect(() => {
    if (isAuthenticated && token && ((isAdmin && filterBranchId !== '') || isBranchManager)) {
      fetchPayments();
    }
  }, [isAuthenticated, token, fetchPayments, isAdmin, filterBranchId, isBranchManager]);

  useEffect(() => {
    const paginated = allPayments.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    setPayments(paginated);
  }, [allPayments, page, rowsPerPage]);

  const handleApplyFilters = () => { setPage(0); fetchPayments(); };

  const handleRecordNewPayment = () => {
    let path = '/(pages)/accounting/customer-payments/new';
    if (isAdmin && typeof filterBranchId === 'number') {
      path += `?branchId=${filterBranchId}`;
    }
    router.push(path);
  };

  if (authLoading || (isLoading && !filterBranchId && isAdmin) ) {
    return <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh"><CircularProgress /></Box>;
  }
  if (!isAuthenticated || !user?.role?.name || !['admin', 'branch_manager'].includes(user.role.name.toLowerCase())) {
    return <Typography sx={{p:3}}>Access Denied. Redirecting...</Typography>;
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1">Customer Payments</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleRecordNewPayment} disabled={isAdmin && filterBranchId === 'all'}>
          Record New Payment
        </Button>
      </Box>
      {isAdmin && filterBranchId === 'all' && <Alert severity="info" sx={{mb:2}}>Please select a specific branch to record a new payment for that branch.</Alert>}


      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>Filters</Typography>
        <Grid container spacing={2} alignItems="center">
          {isAdmin && (
            <Grid item xs={12} sm={6} md={2.5}>
              <FormControl fullWidth size="small">
                <InputLabel>Branch</InputLabel>
                <Select value={filterBranchId} label="Branch" onChange={(e) => setFilterBranchId(e.target.value as any)}>
                  <MenuItem value="all"><em>All Branches</em></MenuItem>
                  {branches.map((b) => <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
          )}
          <Grid item xs={12} sm={6} md={isAdmin ? 2.5 : 3}><FormControl fullWidth size="small"><InputLabel>Customer</InputLabel>
            <Select value={filterCustomerId} label="Customer" onChange={(e) => setFilterCustomerId(e.target.value as any)} disabled={customersForFilter.length === 0 && typeof filterBranchId !== 'number' && filterBranchId !== 'all'}>
              <MenuItem value=""><em>Any Customer</em></MenuItem>
              {customersForFilter.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
            </Select></FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={isAdmin ? 2.5 : 3}><DatePicker label="Start Date" value={filterStartDate} onChange={setFilterStartDate} slotProps={{textField:{fullWidth: true, size: 'small'}}} /></Grid>
          <Grid item xs={12} sm={6} md={isAdmin ? 2.5 : 3}><DatePicker label="End Date" value={filterEndDate} onChange={setFilterEndDate} slotProps={{textField:{fullWidth: true, size: 'small'}}} /></Grid>
          <Grid item xs={12} sm={6} md={isAdmin ? 2 : 3}><Button variant="outlined" startIcon={<FilterListIcon />} onClick={handleApplyFilters} fullWidth>Apply</Button></Grid>
        </Grid>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}

      {isLoading ? <Box display="flex" justifyContent="center" my={3}><CircularProgress /></Box> :
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer sx={{ maxHeight: 600 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell><TableCell>Date</TableCell>
                  {isAdmin && <TableCell>Branch</TableCell>}
                  <TableCell>Customer</TableCell><TableCell>Payment Account</TableCell>
                  <TableCell>Reference</TableCell><TableCell align="right">Amount Paid</TableCell>
                  {/* <TableCell>Notes</TableCell> */}
                </TableRow>
              </TableHead>
              <TableBody>
                {payments.map((p) => (
                  <TableRow hover key={p.id}>
                    <TableCell>{p.id}</TableCell>
                    <TableCell>{format(parseISO(p.payment_date), 'PP')}</TableCell>
                    {isAdmin && <TableCell>{p.branch?.name || 'N/A'}</TableCell>}
                    <TableCell>{p.customer?.name || 'N/A'}</TableCell>
                    <TableCell>{p.payment_account?.name || 'N/A'}</TableCell>
                    <TableCell>{p.reference_number || 'N/A'}</TableCell>
                    <TableCell align="right">${p.amount_paid.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination rowsPerPageOptions={[10, 25, 50]} component="div" count={allPayments.length} rowsPerPage={rowsPerPage} page={page} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage}/>
        </Paper>
      }
      {/* No Edit/Delete for payments for now */}
    </Container>
    </LocalizationProvider>
  );
};

export default CustomerPaymentsPage;
