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
  Select, MenuItem, FormControl, InputLabel, // For Branch Selector
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SupplierFormModal from '@/components/suppliers/SupplierFormModal';
import DeleteConfirmationDialog from '@/components/common/DeleteConfirmationDialog';
import { Branch } from '@/types/branch'; // For branch selector
import branchService from '@/services/branchService'; // To fetch branches

const SuppliersPage = () => {
  const { isAuthenticated, token, user, loading: authLoading } = useAuth(); // Get user
  const router = useRouter();

  const [suppliers, setSuppliers] = useState<Supplier[]>([]); // Displayed (paginated)
  const [allSuppliers, setAllSuppliers] = useState<Supplier[]>([]); // For client-side pagination
  const [isLoading, setIsLoading] = useState(true);
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

  // Branch selection for Admin
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

  const fetchSuppliers = useCallback(async () => {
    if (!token || (!isAdmin && !isBranchManager)) return;

    let branchIdForFetch: number | 'all' | undefined = undefined;
    if (isAdmin) {
      branchIdForFetch = selectedBranchId === '' ? 'all' : selectedBranchId;
    } else if (isBranchManager) {
      branchIdForFetch = user?.branch?.id;
    }

    if (isBranchManager && branchIdForFetch === undefined) {
        setActionError("Branch manager not assigned to a branch.");
        setIsLoading(false); setAllSuppliers([]); return;
    }
    if (!branchIdForFetch && isAdmin && selectedBranchId === '') branchIdForFetch = 'all';


    setIsLoading(true);
    setActionError(null);
    try {
      const data = await supplierService.getSuppliers(token, 0, 10000, branchIdForFetch);
      setAllSuppliers(data);
    } catch (err: any) {
      setActionError(err.message || 'Failed to fetch suppliers.');
      setAllSuppliers([]);
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
            fetchSuppliers();
        } else if (isAdmin && selectedBranchId === '') {
             fetchSuppliers(); // Default to 'all' for admin if nothing selected
        }
      } else {
        setActionError("You are not authorized to view this page.");
        setIsLoading(false);
      }
    }
  }, [isAuthenticated, token, authLoading, router, fetchSuppliers, isAdmin, isBranchManager, selectedBranchId]);

  useEffect(() => {
    const paginatedSuppliers = allSuppliers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    setSuppliers(paginatedSuppliers);
  }, [allSuppliers, page, rowsPerPage]);


  const handleAddSupplier = () => {
    setEditingSupplier(null);
    setActionError(null);
    setSuccessMessage(null);
    setIsModalOpen(true);
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setActionError(null);
    setSuccessMessage(null);
    setIsModalOpen(true);
  };

  const openDeleteDialog = (supplier: Supplier) => {
    setSupplierToDelete(supplier);
    setActionError(null);
    setSuccessMessage(null);
    setIsDeleteDialogOpen(true);
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
        // branch_id should be part of 'data' from SupplierForm
        await supplierService.createSupplier(token, data as SupplierCreateData);
        setSuccessMessage('Supplier created successfully!');
      }
      setIsModalOpen(false);
      fetchSuppliers();
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1">Suppliers</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddSupplier} disabled={isAdmin && selectedBranchId === 'all' && !editingSupplier}>
          Add New Supplier
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
      {isAdmin && selectedBranchId === 'all' && !editingSupplier && (
         <Alert severity="info" sx={{ mb: 2 }}>Please select a specific branch to add a new supplier, or the form will require branch selection.</Alert>
       )}

      {actionError && <Alert severity="error" sx={{ mb: 2 }}>{actionError}</Alert>}
      {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}

      {isLoading ? <Box display="flex" justifyContent="center" my={3}><CircularProgress /></Box> :
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell><TableCell>Contact Person</TableCell>
                  <TableCell>Email</TableCell><TableCell>Phone</TableCell>
                  {isAdmin && <TableCell>Branch</TableCell>}
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
                    {isAdmin && <TableCell>{supplier.branch?.name || 'N/A'}</TableCell>}
                    <TableCell align="right">
                      <IconButton onClick={() => handleEditSupplier(supplier)} size="small"><EditIcon /></IconButton>
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
        enforcedBranchId={ // Pass enforcedBranchId to the modal
          isBranchManager ? user?.branch?.id : (isAdmin && typeof selectedBranchId === 'number' ? selectedBranchId : undefined)
        }
      />

      {supplierToDelete && (
        <DeleteConfirmationDialog
          open={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)} onConfirm={confirmDeleteSupplier}
          title="Delete Supplier" description={`Delete supplier "${supplierToDelete.name}"? This cannot be undone.`} isLoading={isDeleting}
        />
      )}
    </Container>
  );
};

export default SuppliersPage;
