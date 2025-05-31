"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import accountService from '@/services/accountService';
import { Account, AccountCreateData, AccountUpdateData } from '@/types/account';
import { Branch } from '@/types/branch';
import { AccountType } from '@/types/accountType';
import branchService from '@/services/branchService';
import accountTypeService from '@/services/accountTypeService';
import {
  Box, Button, CircularProgress, Container, IconButton, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Typography, Alert, TablePagination,
  Grid, FormControl, InputLabel, Select, MenuItem, Switch, FormControlLabel, TextField
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterListIcon from '@mui/icons-material/FilterList';
import AccountFormModal from '@/components/admin/accounts/AccountFormModal';
import DeleteConfirmationDialog from '@/components/common/DeleteConfirmationDialog';

const AdminAccountsPage = () => {
  const { isAuthenticated, token, user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [allAccounts, setAllAccounts] = useState<Account[]>([]); // For client-side pagination from filtered set
  const [isLoading, setIsLoading] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [isModalLoading, setIsModalLoading] = useState(false);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Account | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Filter states
  const [branches, setBranches] = useState<Branch[]>([]);
  const [accountTypes, setAccountTypes] = useState<AccountType[]>([]);
  const [filterBranchId, setFilterBranchId] = useState<number | 'all' | ''>('all');
  const [filterAccountTypeId, setFilterAccountTypeId] = useState<number | 'all' | ''>('all');
  const [filterIsActive, setFilterIsActive] = useState<boolean | 'all' | ''>('all');
  const [filterName, setFilterName] = useState<string>('');


  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || user?.role?.name.toLowerCase() !== 'admin') {
        router.push(isAuthenticated ? '/' : '/(pages)/login');
      } else {
        // Fetch branches and account types for filters
        branchService.getBranches(token!).then(setBranches).catch(e => setActionError("Failed to load branches."));
        accountTypeService.getAccountTypes(token!).then(setAccountTypes).catch(e => setActionError("Failed to load account types."));
      }
    }
  }, [isAuthenticated, user, authLoading, router, token]);

  const fetchAccounts = useCallback(async () => {
    if (!token || user?.role?.name.toLowerCase() !== 'admin') return;
    setIsLoading(true); setActionError(null);
    try {
      const params: any = {
        skip: 0, // Fetch all for client-side pagination based on filters
        limit: 10000,
      };
      if (filterBranchId !== 'all' && filterBranchId !== '') params.branchId = filterBranchId;
      if (filterAccountTypeId !== 'all' && filterAccountTypeId !== '') params.accountTypeId = filterAccountTypeId;
      if (filterIsActive !== 'all' && filterIsActive !== '') params.isActive = filterIsActive;
      if (filterName) params.name = filterName;

      const data = await accountService.getAccounts(token, params);
      setAllAccounts(data);
    } catch (err: any) {
      setActionError(err.message || 'Failed to fetch accounts.');
      setAllAccounts([]);
    } finally {
      setIsLoading(false);
    }
  }, [token, user?.role?.name, filterBranchId, filterAccountTypeId, filterIsActive, filterName]);

  useEffect(() => {
    if (user?.role?.name.toLowerCase() === 'admin') {
        fetchAccounts(); // Initial fetch
    }
  }, [user, fetchAccounts]); // Removed selectedBranchId dependency for initial load

  useEffect(() => {
    const paginatedData = allAccounts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    setAccounts(paginatedData);
  }, [allAccounts, page, rowsPerPage]);

  const handleApplyFilters = () => {
    setPage(0);
    fetchAccounts();
  }

  const handleAddItem = () => {
    setEditingAccount(null); setIsModalOpen(true); setActionError(null); setSuccessMessage(null);
  };

  const handleEditItem = (item: Account) => {
    setEditingAccount(item); setIsModalOpen(true); setActionError(null); setSuccessMessage(null);
  };

  const openDeleteDialog = (item: Account) => {
    setItemToDelete(item); setIsDeleteDialogOpen(true); setActionError(null); setSuccessMessage(null);
  };

  const handleModalSubmit = async (data: AccountCreateData | AccountUpdateData) => {
    if (!token) return;
    setIsModalLoading(true); setActionError(null); setSuccessMessage(null);
    try {
      if (editingAccount) {
        await accountService.updateAccount(token, editingAccount.id, data as AccountUpdateData);
        setSuccessMessage('Account updated successfully!');
      } else {
        await accountService.createAccount(token, data as AccountCreateData);
        setSuccessMessage('Account created successfully!');
      }
      setIsModalOpen(false); fetchAccounts();
    } catch (err: any) {
      setActionError(err.message || 'Failed to save account.');
    } finally {
      setIsModalLoading(false);
    }
  };

  const confirmDeleteItem = async () => {
    if (!itemToDelete || !token) return;
    setIsDeleting(true); setActionError(null); setSuccessMessage(null);
    try {
      await accountService.deleteAccount(token, itemToDelete.id);
      setIsDeleteDialogOpen(false); setItemToDelete(null); setSuccessMessage('Account deleted successfully!');
      fetchAccounts();
    } catch (err: any) {
      setActionError(err.message || 'Failed to delete account. It might be in use or a parent account.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10)); setPage(0);
  };

  if (authLoading || (!isAuthenticated && !authLoading) || (isAuthenticated && user?.role?.name.toLowerCase() !== 'admin' && !authLoading) ) {
    return <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh"><CircularProgress /></Box>;
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}> {/* Wider container for more columns */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1">Chart of Accounts</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddItem}>Add Account</Button>
      </Box>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>Filters</Typography>
        <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3}><FormControl fullWidth size="small"><InputLabel>Branch</InputLabel><Select value={filterBranchId} label="Branch" onChange={(e) => setFilterBranchId(e.target.value as number | 'all' | '')}><MenuItem value="all"><em>All Branches</em></MenuItem>{branches.map(b => <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>)}</Select></FormControl></Grid>
            <Grid item xs={12} sm={3}><FormControl fullWidth size="small"><InputLabel>Account Type</InputLabel><Select value={filterAccountTypeId} label="Account Type" onChange={(e) => setFilterAccountTypeId(e.target.value as number | 'all' | '')}><MenuItem value="all"><em>All Types</em></MenuItem>{accountTypes.map(at => <MenuItem key={at.id} value={at.id}>{at.name}</MenuItem>)}</Select></FormControl></Grid>
            <Grid item xs={12} sm={2}><FormControl fullWidth size="small"><InputLabel>Status</InputLabel><Select value={filterIsActive} label="Status" onChange={(e) => setFilterIsActive(e.target.value as boolean | 'all' | '')}><MenuItem value="all"><em>Any Status</em></MenuItem><MenuItem value={true as any}>Active</MenuItem><MenuItem value={false as any}>Inactive</MenuItem></Select></FormControl></Grid>
            <Grid item xs={12} sm={2}><TextField label="Name Contains" value={filterName} onChange={e => setFilterName(e.target.value)} fullWidth size="small"/></Grid>
            <Grid item xs={12} sm={2}><Button variant="outlined" startIcon={<FilterListIcon />} onClick={handleApplyFilters} fullWidth>Apply</Button></Grid>
        </Grid>
      </Paper>

      {actionError && <Alert severity="error" sx={{ mb: 2 }}>{actionError}</Alert>}
      {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}

      {isLoading ? <Box display="flex" justifyContent="center" my={3}><CircularProgress /></Box> :
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer sx={{ maxHeight: 600 }}> {/* Max height for scroll */}
            <Table stickyHeader size="small">
              <TableHead><TableRow><TableCell>Code</TableCell><TableCell>Name</TableCell><TableCell>Type</TableCell><TableCell>Branch</TableCell><TableCell>Parent ID</TableCell><TableCell>Active</TableCell><TableCell align="right">Actions</TableCell></TableRow></TableHead>
              <TableBody>
                {accounts.map((acc) => (
                  <TableRow hover key={acc.id}>
                    <TableCell>{acc.account_code || 'N/A'}</TableCell>
                    <TableCell>{acc.name}</TableCell>
                    <TableCell>{acc.account_type?.name || 'N/A'}</TableCell>
                    <TableCell>{acc.branch?.name || 'N/A'}</TableCell>
                    <TableCell>{acc.parent_account_id || 'N/A'}</TableCell>
                    <TableCell><Chip label={acc.is_active ? 'Active' : 'Inactive'} color={acc.is_active ? 'success' : 'default'} size="small" /></TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => handleEditItem(acc)} size="small"><EditIcon /></IconButton>
                      <IconButton onClick={() => openDeleteDialog(acc)} size="small"><DeleteIcon /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination rowsPerPageOptions={[10, 25, 50, 100]} component="div" count={allAccounts.length} rowsPerPage={rowsPerPage} page={page} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage}/>
        </Paper>
      }

      <AccountFormModal open={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleModalSubmit} account={editingAccount} isLoading={isModalLoading} error={actionError} />
      {itemToDelete && <DeleteConfirmationDialog open={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)} onConfirm={confirmDeleteItem} title="Delete Account" description={`Delete account "${itemToDelete.name}"? This cannot be undone if used in journal entries.`} isLoading={isDeleting} />}
    </Container>
  );
};

export default AdminAccountsPage;
