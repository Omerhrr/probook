"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import supplierService from '@/services/supplierService';
import { Supplier, SupplierCreateData, SupplierUpdateData } from '@/types/supplier';
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
import SupplierFormModal from '@/components/suppliers/SupplierFormModal';
import DeleteConfirmationDialog from '@/components/common/DeleteConfirmationDialog';

const SuppliersPage = () => {
  const { isAuthenticated, token, loading: authLoading } = useAuth();
  const router = useRouter();

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [allSuppliers, setAllSuppliers] = useState<Supplier[]>([]); // For client-side pagination
  const [isLoading, setIsLoading] = useState(true); // For page load
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [isModalLoading, setIsModalLoading] = useState(false);

  // Delete dialog states
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchSuppliers = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setActionError(null);
    try {
      // Fetch all suppliers for client-side pagination (temporary)
      const data = await supplierService.getSuppliers(token, 0, 10000);
      setAllSuppliers(data);
    } catch (err: any) {
      setActionError(err.message || 'Failed to fetch suppliers.');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || !token) {
        router.push('/(pages)/login');
      } else {
        fetchSuppliers();
      }
    }
  }, [isAuthenticated, token, authLoading, router, fetchSuppliers]);

  useEffect(() => {
    // Client-side pagination logic
    const paginatedSuppliers = allSuppliers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    setSuppliers(paginatedSuppliers);
  }, [allSuppliers, page, rowsPerPage]);


  const handleAddSupplier = () => {
    setEditingSupplier(null);
    setIsModalOpen(true);
    setActionError(null);
    setSuccessMessage(null);
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setIsModalOpen(true);
    setActionError(null);
    setSuccessMessage(null);
  };

  const openDeleteDialog = (supplier: Supplier) => {
    setSupplierToDelete(supplier);
    setIsDeleteDialogOpen(true);
    setActionError(null);
    setSuccessMessage(null);
  };

  const handleModalSubmit = async (data: SupplierCreateData | SupplierUpdateData) => {
    if (!token) return;
    setIsModalLoading(true);
    setActionError(null);
    setSuccessMessage(null);
    try {
      if (editingSupplier) {
        await supplierService.updateSupplier(token, editingSupplier.id, data as SupplierUpdateData);
        setSuccessMessage('Supplier updated successfully!');
      } else {
        await supplierService.createSupplier(token, data as SupplierCreateData);
        setSuccessMessage('Supplier created successfully!');
      }
      setIsModalOpen(false);
      fetchSuppliers(); // Refresh list
    } catch (err: any) {
      setActionError(err.message || 'Failed to save supplier.');
    } finally {
      setIsModalLoading(false);
    }
  };

  const confirmDeleteSupplier = async () => {
    if (!supplierToDelete || !token) return;
    setIsDeleting(true);
    setActionError(null);
    setSuccessMessage(null);
    try {
      await supplierService.deleteSupplier(token, supplierToDelete.id);
      setIsDeleteDialogOpen(false);
      setSupplierToDelete(null);
      setSuccessMessage('Supplier deleted successfully!');
      fetchSuppliers(); // Refresh list
    } catch (err: any) {
      setActionError(err.message || 'Failed to delete supplier.');
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
          Suppliers
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddSupplier}
        >
          Add New Supplier
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
          <Table stickyHeader aria-label="suppliers table">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Contact Person</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {suppliers.map((supplier) => (
                <TableRow hover key={supplier.id}>
                  <TableCell>{supplier.name}</TableCell>
                  <TableCell>{supplier.contact_person || 'N/A'}</TableCell>
                  <TableCell>{supplier.email || 'N/A'}</TableCell>
                  <TableCell>{supplier.phone || 'N/A'}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleEditSupplier(supplier)} size="small">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => openDeleteDialog(supplier)} size="small">
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
          count={allSuppliers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      <SupplierFormModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        supplier={editingSupplier}
        isLoading={isModalLoading}
        error={actionError}
      />

      {supplierToDelete && (
        <DeleteConfirmationDialog
          open={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={confirmDeleteSupplier}
          title="Delete Supplier"
          description={`Are you sure you want to delete the supplier "${supplierToDelete.name}"? This action cannot be undone.`}
          isLoading={isDeleting}
        />
      )}
    </Container>
  );
};

export default SuppliersPage;
