"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import branchService from '@/services/branchService';
import { Branch, BranchCreateData, BranchUpdateData } from '@/types/branch';
import {
  Box, Button, CircularProgress, Container, IconButton, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Typography, Alert, TablePagination,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BranchFormModal from '@/components/admin/branches/BranchFormModal';
import DeleteConfirmationDialog from '@/components/common/DeleteConfirmationDialog';

const AdminBranchesPage = () => {
  const { isAuthenticated, token, user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [branches, setBranches] = useState<Branch[]>([]);
  const [allBranches, setAllBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [isModalLoading, setIsModalLoading] = useState(false);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState<Branch | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Role check effect
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || user?.role?.name.toLowerCase() !== 'admin') {
        router.push(isAuthenticated ? '/' : '/(pages)/login'); // Redirect to home if logged in but not admin
      }
    }
  }, [isAuthenticated, user, authLoading, router]);


  const fetchBranches = useCallback(async () => {
    if (!token || user?.role?.name.toLowerCase() !== 'admin') return;
    setIsLoading(true);
    setActionError(null);
    try {
      const data = await branchService.getBranches(token, 0, 10000);
      setAllBranches(data);
    } catch (err: any) {
      setActionError(err.message || 'Failed to fetch branches.');
    } finally {
      setIsLoading(false);
    }
  }, [token, user?.role?.name]);

  useEffect(() => {
    if (user?.role?.name.toLowerCase() === 'admin') {
        fetchBranches();
    }
  }, [user, fetchBranches]);

  useEffect(() => {
    const paginatedBranches = allBranches.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    setBranches(paginatedBranches);
  }, [allBranches, page, rowsPerPage]);

  const handleAddBranch = () => {
    setEditingBranch(null); setIsModalOpen(true); setActionError(null); setSuccessMessage(null);
  };

  const handleEditBranch = (branch: Branch) => {
    setEditingBranch(branch); setIsModalOpen(true); setActionError(null); setSuccessMessage(null);
  };

  const openDeleteDialog = (branch: Branch) => {
    setBranchToDelete(branch); setIsDeleteDialogOpen(true); setActionError(null); setSuccessMessage(null);
  };

  const handleModalSubmit = async (data: BranchCreateData | BranchUpdateData) => {
    if (!token) return;
    setIsModalLoading(true); setActionError(null); setSuccessMessage(null);
    try {
      if (editingBranch) {
        await branchService.updateBranch(token, editingBranch.id, data as BranchUpdateData);
        setSuccessMessage('Branch updated successfully!');
      } else {
        await branchService.createBranch(token, data as BranchCreateData);
        setSuccessMessage('Branch created successfully!');
      }
      setIsModalOpen(false); fetchBranches();
    } catch (err: any) {
      setActionError(err.message || 'Failed to save branch.');
    } finally {
      setIsModalLoading(false);
    }
  };

  const confirmDeleteBranch = async () => {
    if (!branchToDelete || !token) return;
    setIsDeleting(true); setActionError(null); setSuccessMessage(null);
    try {
      await branchService.deleteBranch(token, branchToDelete.id);
      setIsDeleteDialogOpen(false); setBranchToDelete(null); setSuccessMessage('Branch deleted successfully!');
      fetchBranches();
    } catch (err: any) {
      setActionError(err.message || 'Failed to delete branch. Make sure it is not in use.');
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
        <Typography variant="h4" component="h1">Branch Management</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddBranch}>Add New Branch</Button>
      </Box>

      {actionError && <Alert severity="error" sx={{ mb: 2 }}>{actionError}</Alert>}
      {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}

      {isLoading ? <Box display="flex" justifyContent="center" my={3}><CircularProgress /></Box> :
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer>
            <Table stickyHeader>
              <TableHead><TableRow><TableCell>ID</TableCell><TableCell>Name</TableCell><TableCell>Address</TableCell><TableCell align="right">Actions</TableCell></TableRow></TableHead>
              <TableBody>
                {branches.map((branch) => (
                  <TableRow hover key={branch.id}>
                    <TableCell>{branch.id}</TableCell>
                    <TableCell>{branch.name}</TableCell>
                    <TableCell>{branch.address || 'N/A'}</TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => handleEditBranch(branch)} size="small"><EditIcon /></IconButton>
                      <IconButton onClick={() => openDeleteDialog(branch)} size="small"><DeleteIcon /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]} component="div" count={allBranches.length}
            rowsPerPage={rowsPerPage} page={page} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      }

      <BranchFormModal open={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleModalSubmit} branch={editingBranch} isLoading={isModalLoading} error={actionError} />
      {branchToDelete && <DeleteConfirmationDialog open={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)} onConfirm={confirmDeleteBranch} title="Delete Branch" description={`Delete branch "${branchToDelete.name}"? This cannot be undone.`} isLoading={isDeleting} />}
    </Container>
  );
};

export default AdminBranchesPage;
