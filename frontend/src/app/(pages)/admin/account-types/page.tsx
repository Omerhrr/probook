"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import accountTypeService from '@/services/accountTypeService';
import { AccountType, AccountTypeCreateData, AccountTypeUpdateData } from '@/types/accountType';
import {
  Box, Button, CircularProgress, Container, IconButton, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Typography, Alert, TablePagination,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AccountTypeFormModal from '@/components/admin/accounttypes/AccountTypeFormModal';
import DeleteConfirmationDialog from '@/components/common/DeleteConfirmationDialog';

const AdminAccountTypesPage = () => {
  const { isAuthenticated, token, user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [accountTypes, setAccountTypes] = useState<AccountType[]>([]);
  const [allAccountTypes, setAllAccountTypes] = useState<AccountType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccountType, setEditingAccountType] = useState<AccountType | null>(null);
  const [isModalLoading, setIsModalLoading] = useState(false);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<AccountType | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || user?.role?.name.toLowerCase() !== 'admin') {
        router.push(isAuthenticated ? '/' : '/(pages)/login');
      }
    }
  }, [isAuthenticated, user, authLoading, router]);

  const fetchAccountTypes = useCallback(async () => {
    if (!token || user?.role?.name.toLowerCase() !== 'admin') return;
    setIsLoading(true); setActionError(null);
    try {
      const data = await accountTypeService.getAccountTypes(token, 0, 1000);
      setAllAccountTypes(data);
    } catch (err: any) {
      setActionError(err.message || 'Failed to fetch account types.');
    } finally {
      setIsLoading(false);
    }
  }, [token, user?.role?.name]);

  useEffect(() => {
    if (user?.role?.name.toLowerCase() === 'admin') {
        fetchAccountTypes();
    }
  }, [user, fetchAccountTypes]);

  useEffect(() => {
    const paginatedData = allAccountTypes.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    setAccountTypes(paginatedData);
  }, [allAccountTypes, page, rowsPerPage]);

  const handleAddItem = () => {
    setEditingAccountType(null); setIsModalOpen(true); setActionError(null); setSuccessMessage(null);
  };

  const handleEditItem = (item: AccountType) => {
    setEditingAccountType(item); setIsModalOpen(true); setActionError(null); setSuccessMessage(null);
  };

  const openDeleteDialog = (item: AccountType) => {
    setItemToDelete(item); setIsDeleteDialogOpen(true); setActionError(null); setSuccessMessage(null);
  };

  const handleModalSubmit = async (data: AccountTypeCreateData | AccountTypeUpdateData) => {
    if (!token) return;
    setIsModalLoading(true); setActionError(null); setSuccessMessage(null);
    try {
      if (editingAccountType) {
        await accountTypeService.updateAccountType(token, editingAccountType.id, data as AccountTypeUpdateData);
        setSuccessMessage('Account type updated successfully!');
      } else {
        await accountTypeService.createAccountType(token, data as AccountTypeCreateData);
        setSuccessMessage('Account type created successfully!');
      }
      setIsModalOpen(false); fetchAccountTypes();
    } catch (err: any) {
      setActionError(err.message || 'Failed to save account type.');
    } finally {
      setIsModalLoading(false);
    }
  };

  const confirmDeleteItem = async () => {
    if (!itemToDelete || !token) return;
    setIsDeleting(true); setActionError(null); setSuccessMessage(null);
    try {
      await accountTypeService.deleteAccountType(token, itemToDelete.id);
      setIsDeleteDialogOpen(false); setItemToDelete(null); setSuccessMessage('Account type deleted successfully!');
      fetchAccountTypes();
    } catch (err: any) {
      setActionError(err.message || 'Failed to delete account type. It might be in use.');
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
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1">Account Type Management</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddItem}>Add Account Type</Button>
      </Box>

      {actionError && <Alert severity="error" sx={{ mb: 2 }}>{actionError}</Alert>}
      {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}

      {isLoading ? <Box display="flex" justifyContent="center" my={3}><CircularProgress /></Box> :
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer>
            <Table stickyHeader>
              <TableHead><TableRow><TableCell>ID</TableCell><TableCell>Name</TableCell><TableCell>Description</TableCell><TableCell align="right">Actions</TableCell></TableRow></TableHead>
              <TableBody>
                {accountTypes.map((item) => (
                  <TableRow hover key={item.id}>
                    <TableCell>{item.id}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.description || 'N/A'}</TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => handleEditItem(item)} size="small"><EditIcon /></IconButton>
                      <IconButton onClick={() => openDeleteDialog(item)} size="small"><DeleteIcon /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]} component="div" count={allAccountTypes.length}
            rowsPerPage={rowsPerPage} page={page} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      }

      <AccountTypeFormModal open={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleModalSubmit} accountType={editingAccountType} isLoading={isModalLoading} error={actionError} />
      {itemToDelete && <DeleteConfirmationDialog open={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)} onConfirm={confirmDeleteItem} title="Delete Account Type" description={`Delete account type "${itemToDelete.name}"? This cannot be undone if not in use.`} isLoading={isDeleting} />}
    </Container>
  );
};

export default AdminAccountTypesPage;
