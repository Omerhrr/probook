"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import journalEntryService from '@/services/journalEntryService';
import { JournalEntry } from '@/types/journalEntry';
import { Branch } from '@/types/branch';
import branchService from '@/services/branchService';
import { AccountLookup } from '@/types/account';
import accountService from '@/services/accountService';
import {
  Box, Button, CircularProgress, Container, IconButton, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Typography, Alert, TablePagination,
  Grid, FormControl, InputLabel, Select, MenuItem, TextField, Collapse, Chip
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FilterListIcon from '@mui/icons-material/FilterList';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { format, formatISO, parseISO } from 'date-fns';

const JournalEntryRow = ({ entry, isAdmin }: { entry: JournalEntry, isAdmin: boolean }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TableRow hover sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>{entry.id}</TableCell>
        <TableCell>{format(parseISO(entry.entry_date), 'PP')}</TableCell>
        {isAdmin && <TableCell>{entry.branch?.name || 'N/A'}</TableCell>}
        <TableCell>{entry.description}</TableCell>
        <TableCell>{entry.created_by?.username || 'N/A'}</TableCell>
        <TableCell align="center">
          {/* Link to detail page can be added here if a separate detail page is built */}
          {/* <IconButton onClick={() => router.push(`/(pages)/accounting/journal-entries/${entry.id}`)} size="small">
            <VisibilityIcon />
          </IconButton> */}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={isAdmin ? 7 : 6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">Items</Typography>
              <Table size="small" aria-label="items">
                <TableHead>
                  <TableRow>
                    <TableCell>Account</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell align="right">Debit</TableCell>
                    <TableCell align="right">Credit</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {entry.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.account?.name} ({item.account?.account_code || 'N/A'})</TableCell>
                      <TableCell>{item.description || 'N/A'}</TableCell>
                      <TableCell align="right">{item.debit_amount > 0 ? item.debit_amount.toFixed(2) : '-'}</TableCell>
                      <TableCell align="right">{item.credit_amount > 0 ? item.credit_amount.toFixed(2) : '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};


const JournalEntriesPage = () => {
  const { isAuthenticated, token, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [allJournalEntries, setAllJournalEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [branches, setBranches] = useState<Branch[]>([]);
  const [accounts, setAccounts] = useState<AccountLookup[]>([]);

  const [filterBranchId, setFilterBranchId] = useState<number | 'all' | ''>('');
  const [filterAccountId, setFilterAccountId] = useState<number | ''>('');
  const [filterStartDate, setFilterStartDate] = useState<Date | null>(null);
  const [filterEndDate, setFilterEndDate] = useState<Date | null>(null);

  const isAdmin = user?.role?.name.toLowerCase() === 'admin';
  const isBranchManager = user?.role?.name.toLowerCase() === 'branch_manager';

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || !user?.role?.name || !['admin', 'branch_manager'].includes(user.role.name.toLowerCase())) {
        router.push(isAuthenticated ? '/' : '/(pages)/login');
      } else {
        if (isAdmin && token) {
          branchService.getBranches(token).then(setBranches).catch(e => setError("Failed to load branches."));
          setSelectedBranchIdForFilter('all'); // Default for admin
        } else if (isBranchManager && user?.branch?.id) {
          setSelectedBranchIdForFilter(user.branch.id); // BM fixed to their branch
        }
      }
    }
  }, [isAuthenticated, user, authLoading, router, token, isAdmin, isBranchManager]);

  // Helper to set selectedBranchId for filter and fetch accounts if needed
  const setSelectedBranchIdForFilter = (branchId: number | 'all' | '') => {
    setFilterBranchId(branchId);
    setFilterAccountId(''); // Reset account filter when branch changes
    if (typeof branchId === 'number' && token) {
      accountService.getAccountLookups(token, branchId).then(setAccounts).catch(e => setError("Failed to load accounts."));
    } else if (branchId === 'all' && token && isAdmin) {
      // Fetch all accounts if admin selects "all branches" - potentially many! Or disable account filter.
      // For now, let's clear accounts or provide a message.
      accountService.getAccounts(token, {limit: 1000}).then(data => setAccounts(data.map(a => ({id: a.id, name: a.name, account_code: a.account_code, branch_id: a.branch_id})))).catch(e => setError("Failed to load accounts."));
    }
    else {
      setAccounts([]);
    }
  };


  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      setSuccessMessage('Journal Entry created successfully!');
      router.replace('/(pages)/accounting/journal-entries', { scroll: false });
    }
  }, [searchParams, router]);

  const fetchJournalEntries = useCallback(async () => {
    if (!token || (!isAdmin && !isBranchManager)) return;

    let effectiveBranchId: number | 'all' | undefined;
    if (isAdmin) {
      effectiveBranchId = filterBranchId === '' ? 'all' : filterBranchId;
    } else if (isBranchManager) {
      effectiveBranchId = user?.branch?.id;
    }

    if (isBranchManager && effectiveBranchId === undefined) {
      setError("Branch manager is not assigned to a branch."); setIsLoading(false); setAllJournalEntries([]); return;
    }
     if (!effectiveBranchId && isAdmin && filterBranchId === '') effectiveBranchId = 'all';


    setIsLoading(true); setError(null);
    try {
      const params: any = {
        skip: 0, limit: 10000,
        branchId: effectiveBranchId,
        accountId: filterAccountId === '' ? undefined : filterAccountId,
        entryDateStart: filterStartDate ? formatISO(filterStartDate, { representation: 'date' }) : undefined,
        entryDateEnd: filterEndDate ? formatISO(filterEndDate, { representation: 'date' }) : undefined,
      };
      const data = await journalEntryService.getJournalEntries(token, params);
      setAllJournalEntries(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch journal entries.'); setAllJournalEntries([]);
    } finally {
      setIsLoading(false);
    }
  }, [token, isAdmin, isBranchManager, user?.branch?.id, filterBranchId, filterAccountId, filterStartDate, filterEndDate]);

  useEffect(() => {
    if (isAuthenticated && token && ((isAdmin && filterBranchId !== '') || isBranchManager)) {
      fetchJournalEntries();
    }
  }, [isAuthenticated, token, fetchJournalEntries, isAdmin, filterBranchId, isBranchManager]);

  useEffect(() => {
    const paginated = allJournalEntries.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    setJournalEntries(paginated);
  }, [allJournalEntries, page, rowsPerPage]);

  const handleApplyFilters = () => { setPage(0); fetchJournalEntries(); };

  const handleCreateNew = () => {
    let path = '/(pages)/accounting/journal-entries/new';
    if (isAdmin && typeof filterBranchId === 'number') { // Pass currently selected filter branch
      path += `?branchId=${filterBranchId}`;
    } // BM's branch is handled by form based on AuthContext
    router.push(path);
  };

  if (authLoading || (isAuthenticated && ((isAdmin && filterBranchId === '') || (isBranchManager && !user?.branch?.id)) && isLoading) ) {
    // Show loader if auth is loading, or if admin hasn't picked a branch yet for initial load, or BM has no branch
    return <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh"><CircularProgress /></Box>;
  }
   if (!isAuthenticated || !user?.role?.name || !['admin', 'branch_manager'].includes(user.role.name.toLowerCase())) {
    return <Typography sx={{p:3}}>Access Denied. Redirecting...</Typography>;
  }


  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1">Journal Entries</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateNew} disabled={isAdmin && filterBranchId === 'all'}>
          Create Journal Entry
        </Button>
      </Box>
      {isAdmin && filterBranchId === 'all' && <Alert severity="info" sx={{mb:2}}>Please select a specific branch to create a new Journal Entry for that branch.</Alert>}


      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>Filters</Typography>
        <Grid container spacing={2} alignItems="center">
          {isAdmin && (
            <Grid item xs={12} sm={3}><FormControl fullWidth size="small"><InputLabel>Branch</InputLabel>
              <Select value={filterBranchId} label="Branch" onChange={(e) => setSelectedBranchIdForFilter(e.target.value as any)}>
                <MenuItem value="all"><em>All Branches</em></MenuItem>
                {branches.map((b) => <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>)}
              </Select></FormControl>
            </Grid>
          )}
          <Grid item xs={12} sm={isAdmin ? 3 : 4}><FormControl fullWidth size="small"><InputLabel>Account</InputLabel>
            <Select value={filterAccountId} label="Account" onChange={(e) => setFilterAccountId(e.target.value as any)} disabled={accounts.length === 0 && typeof filterBranchId !== 'number'}>
              <MenuItem value=""><em>Any Account</em></MenuItem>
              {accounts.map(acc => <MenuItem key={acc.id} value={acc.id}>{acc.name} ({acc.account_code || 'N/A'})</MenuItem>)}
            </Select></FormControl>
          </Grid>
          <Grid item xs={12} sm={isAdmin ? 2 : 3}><DatePicker label="Start Date" value={filterStartDate} onChange={setFilterStartDate} slotProps={{textField: {fullWidth: true, size: 'small'}}} /></Grid>
          <Grid item xs={12} sm={isAdmin ? 2 : 3}><DatePicker label="End Date" value={filterEndDate} onChange={setFilterEndDate} slotProps={{textField: {fullWidth: true, size: 'small'}}} /></Grid>
          <Grid item xs={12} sm={2}><Button variant="outlined" startIcon={<FilterListIcon />} onClick={handleApplyFilters} fullWidth>Apply</Button></Grid>
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
                  <TableCell padding="checkbox" /> {/* For expand icon */}
                  <TableCell>ID</TableCell><TableCell>Date</TableCell>
                  {isAdmin && <TableCell>Branch</TableCell>}
                  <TableCell>Description</TableCell><TableCell>Created By</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {journalEntries.map((entry) => <JournalEntryRow key={entry.id} entry={entry} isAdmin={isAdmin}/>)}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination rowsPerPageOptions={[10, 25, 50]} component="div" count={allJournalEntries.length} rowsPerPage={rowsPerPage} page={page} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage}/>
        </Paper>
      }
      {/* No modal for edit/delete of JEs for now as per plan */}
    </Container>
    </LocalizationProvider>
  );
};

export default JournalEntriesPage;
