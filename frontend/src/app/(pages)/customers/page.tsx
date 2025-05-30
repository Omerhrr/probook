"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import customerService from '@/services/customerService';
import { Customer, CustomerCreateData, CustomerUpdateData } from '@/types/customer';
import {
  Box,
  Button,
  CircularProgress,
  Container,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Alert,
  TablePagination,
  Select, MenuItem, FormControl, InputLabel, // For Branch Selector
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CustomerFormModal from '@/components/customers/CustomerFormModal';
import DeleteConfirmationDialog from '@/components/common/DeleteConfirmationDialog';
import { format } from 'date-fns';
import { Branch } from '@/types/branch';
import branchService from '@/services/branchService';

const CustomersPage = () => {
  const { isAuthenticated, token, user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [isModalLoading, setIsModalLoading] = useState(false);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<number | 'all' | ''>('');

  const isAdmin = user?.role?.name.toLowerCase() === 'admin';
  const isBranchManager = user?.role?.name.toLowerCase() === 'branch_manager';

  useEffect(() => {
    if (isAdmin && token) {
      branchService.getBranches(token)
        .then(data => {
          setBranches(data);
          if (selectedBranchId === '') setSelectedBranchId('all');
        })
        .catch(err => setActionError("Failed to load branches: " + err.message));
    } else if (isBranchManager && user?.branch?.id) {
      setSelectedBranchId(user.branch.id);
    }
  }, [isAdmin, isBranchManager, token, user?.branch?.id]);

  const fetchCustomers = useCallback(async () => {
    if (!token || (!isAdmin && !isBranchManager)) return;

    let branchIdForFetch: number | 'all' | undefined = undefined;
    if (isAdmin) {
      branchIdForFetch = selectedBranchId === '' ? 'all' : selectedBranchId;
    } else if (isBranchManager) {
      branchIdForFetch = user?.branch?.id;
    }

    if (isBranchManager && branchIdForFetch === undefined) {
        setActionError("Branch manager not assigned to a branch.");
        setIsLoading(false); setAllCustomers([]); return;
    }
    if (!branchIdForFetch && isAdmin && selectedBranchId === '') branchIdForFetch = 'all';

    setIsLoading(true);
    setActionError(null);
    try {
      const data = await customerService.getCustomers(token, 0, 10000, branchIdForFetch);
      setAllCustomers(data);
    } catch (err: any) {
      setActionError(err.message || 'Failed to fetch customers.');
      setAllCustomers([]);
    } finally {
      setIsLoading(false);
    }
  }, [token, isAdmin, isBranchManager, selectedBranchId, user?.branch?.id]);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || !token) {
        router.push('/(pages)/login');
      } else if (isAdmin || isBranchManager) {
        if ((isAdmin && selectedBranchId !== '') || isBranchManager) {
          fetchCustomers();
        } else if (isAdmin && selectedBranchId === '') {
           fetchCustomers();
        }
      } else {
        setActionError("You are not authorized to view this page.");
        setIsLoading(false);
      }
    }
  }, [isAuthenticated, token, authLoading, router, fetchCustomers, isAdmin, isBranchManager, selectedBranchId]);

  useEffect(() => {
    const paginatedCustomers = allCustomers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    setCustomers(paginatedCustomers);
  }, [allCustomers, page, rowsPerPage]);

  const handleAddCustomer = () => {
    setEditingCustomer(null); setIsModalOpen(true); setActionError(null); setSuccessMessage(null);
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer); setIsModalOpen(true); setActionError(null); setSuccessMessage(null);
  };

  const openDeleteDialog = (customer: Customer) => {
    setCustomerToDelete(customer); setIsDeleteDialogOpen(true); setActionError(null); setSuccessMessage(null);
  };

  const handleModalSubmit = async (data: CustomerCreateData | CustomerUpdateData) => {
    if (!token) return;
    setIsModalLoading(true); setActionError(null); setSuccessMessage(null);
    try {
      if (editingCustomer) {
        await customerService.updateCustomer(token, editingCustomer.id, data as CustomerUpdateData);
        setSuccessMessage('Customer updated successfully!');
      } else {
        await customerService.createCustomer(token, data as CustomerCreateData);
        setSuccessMessage('Customer created successfully!');
      }
      setIsModalOpen(false); fetchCustomers();
    } catch (err: any) {
      setActionError(err.message || 'Failed to save customer.');
    } finally {
      setIsModalLoading(false);
    }
  };

  const confirmDeleteCustomer = async () => {
    if (!customerToDelete || !token) return;
    setIsDeleting(true);
    setActionError(null);
    setSuccessMessage(null);
    try {
      await customerService.deleteCustomer(token, customerToDelete.id);
      setIsDeleteDialogOpen(false);
      setCustomerToDelete(null);
      setSuccessMessage('Customer deleted successfully!');
      fetchCustomers();
    } catch (err: any) {
      setActionError(err.message || 'Failed to delete customer.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (authLoading || isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1">Customers</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddCustomer} disabled={isAdmin && selectedBranchId === 'all' && !editingCustomer}>
          Add New Customer
        </Button>
      </Box>

      {isAdmin && (
        <FormControl fullWidth sx={{ mb: 2 }} size="small">
          <InputLabel id="branch-select-label">Filter by Branch</InputLabel>
          <Select
            labelId="branch-select-label"
            value={selectedBranchId}
            label="Filter by Branch"
            onChange={(e) => {
              setSelectedBranchId(e.target.value as number | 'all' | '');
              setPage(0);
            }}
          >
            <MenuItem value="all"><em>All Branches</em></MenuItem>
            {branches.map((branch) => (
              <MenuItem key={branch.id} value={branch.id}>{branch.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
      {isAdmin && selectedBranchId === 'all' && !editingCustomer && (
         <Alert severity="info" sx={{ mb: 2 }}>Please select a specific branch to add a new customer, or the form will require branch selection.</Alert>
       )}

      {actionError && <Alert severity="error" sx={{ mb: 2 }}>{actionError}</Alert>}
      {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}

      {isLoading ? <Box display="flex" justifyContent="center" my={3}><CircularProgress /></Box> :
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell><TableCell>Email</TableCell><TableCell>Phone</TableCell>
                  {isAdmin && <TableCell>Branch</TableCell>}
                  <TableCell>Address</TableCell><TableCell>Registered</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow hover key={customer.id}>
                    <TableCell>{customer.name}</TableCell><TableCell>{customer.email || 'N/A'}</TableCell>
                    <TableCell>{customer.phone || 'N/A'}</TableCell>
                    {isAdmin && <TableCell>{customer.branch?.name || 'N/A'}</TableCell>}
                    <TableCell>{customer.address || 'N/A'}</TableCell>
                    <TableCell>{format(new Date(customer.registration_date), 'PP')}</TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => handleEditCustomer(customer)} size="small"><EditIcon /></IconButton>
                      <IconButton onClick={() => openDeleteDialog(customer)} size="small">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={allCustomers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      <CustomerFormModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        customer={editingCustomer}
        isLoading={isModalLoading}
        error={actionError}
        enforcedBranchId={
          isBranchManager ? user?.branch?.id : (isAdmin && typeof selectedBranchId === 'number' ? selectedBranchId : undefined)
        }
      />

      {customerToDelete && (
        <DeleteConfirmationDialog
          open={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)} onConfirm={confirmDeleteCustomer}
          title="Delete Customer" description={`Delete customer "${customerToDelete.name}"? This cannot be undone.`} isLoading={isDeleting}
        />
      )}
    </Container>
  );
};

export default CustomersPage;
