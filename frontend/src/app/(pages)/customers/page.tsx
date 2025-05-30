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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CustomerFormModal from '@/components/customers/CustomerFormModal';
import DeleteConfirmationDialog from '@/components/common/DeleteConfirmationDialog';
import { format } from 'date-fns'; // For formatting dates

const CustomersPage = () => {
  const { isAuthenticated, token, loading: authLoading } = useAuth();
  const router = useRouter();

  const [customers, setCustomers] = useState<Customer[]>([]); // For displayed (paginated) customers
  const [allCustomers, setAllCustomers] = useState<Customer[]>([]); // For storing all fetched customers
  const [isLoading, setIsLoading] = useState(true); // For page load
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [isModalLoading, setIsModalLoading] = useState(false);

  // Delete dialog states
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchCustomers = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setActionError(null);
    try {
      const data = await customerService.getCustomers(token, 0, 10000); // Fetch all for client pagination
      setAllCustomers(data);
    } catch (err: any) {
      setActionError(err.message || 'Failed to fetch customers.');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || !token) {
        router.push('/(pages)/login');
      } else {
        fetchCustomers();
      }
    }
  }, [isAuthenticated, token, authLoading, router, fetchCustomers]);

  useEffect(() => {
    // Client-side pagination logic
    const paginatedCustomers = allCustomers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    setCustomers(paginatedCustomers);
  }, [allCustomers, page, rowsPerPage]);

  const handleAddCustomer = () => {
    setEditingCustomer(null);
    setIsModalOpen(true);
    setActionError(null);
    setSuccessMessage(null);
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsModalOpen(true);
    setActionError(null);
    setSuccessMessage(null);
  };

  const openDeleteDialog = (customer: Customer) => {
    setCustomerToDelete(customer);
    setIsDeleteDialogOpen(true);
    setActionError(null);
    setSuccessMessage(null);
  };

  const handleModalSubmit = async (data: CustomerCreateData | CustomerUpdateData) => {
    if (!token) return;
    setIsModalLoading(true);
    setActionError(null);
    setSuccessMessage(null);
    try {
      if (editingCustomer) {
        await customerService.updateCustomer(token, editingCustomer.id, data as CustomerUpdateData);
        setSuccessMessage('Customer updated successfully!');
      } else {
        await customerService.createCustomer(token, data as CustomerCreateData);
        setSuccessMessage('Customer created successfully!');
      }
      setIsModalOpen(false);
      fetchCustomers();
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4" component="h1">
          Customers
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddCustomer}
        >
          Add New Customer
        </Button>
      </Box>

      {actionError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {actionError}
        </Alert>
      )}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table stickyHeader aria-label="customers table">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Address</TableCell>
                <TableCell>Registration Date</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {customers.map((customer) => (
                <TableRow hover key={customer.id}>
                  <TableCell>{customer.name}</TableCell>
                  <TableCell>{customer.email || 'N/A'}</TableCell>
                  <TableCell>{customer.phone || 'N/A'}</TableCell>
                  <TableCell>{customer.address || 'N/A'}</TableCell>
                  <TableCell>{format(new Date(customer.registration_date), 'PP')}</TableCell> {/* Format date */}
                  <TableCell align="right">
                    <IconButton onClick={() => handleEditCustomer(customer)} size="small">
                      <EditIcon />
                    </IconButton>
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
      />

      {customerToDelete && (
        <DeleteConfirmationDialog
          open={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={confirmDeleteCustomer}
          title="Delete Customer"
          description={`Are you sure you want to delete the customer "${customerToDelete.name}"? This action cannot be undone.`}
          isLoading={isDeleting}
        />
      )}
    </Container>
  );
};

export default CustomersPage;
