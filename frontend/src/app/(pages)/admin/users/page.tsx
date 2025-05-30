"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import userService from '@/services/userService';
import { User, UserCreateDataAdmin, UserUpdateDataAdmin } from '@/types/user';
import {
  Box, Button, CircularProgress, Container, IconButton, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Typography, Alert, TablePagination, Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import UserFormModal from '@/components/admin/users/UserFormModal';
import DeleteConfirmationDialog from '@/components/common/DeleteConfirmationDialog';

const AdminUsersPage = () => {
  const { isAuthenticated, token, user: currentUser, loading: authLoading } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isModalLoading, setIsModalLoading] = useState(false);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || currentUser?.role?.name.toLowerCase() !== 'admin') {
        router.push(isAuthenticated ? '/' : '/(pages)/login');
      }
    }
  }, [isAuthenticated, currentUser, authLoading, router]);

  const fetchUsers = useCallback(async () => {
    if (!token || currentUser?.role?.name.toLowerCase() !== 'admin') return;
    setIsLoading(true); setActionError(null);
    try {
      const data = await userService.getUsers(token, 0, 10000);
      setAllUsers(data);
    } catch (err: any) {
      setActionError(err.message || 'Failed to fetch users.');
    } finally {
      setIsLoading(false);
    }
  }, [token, currentUser?.role?.name]);

  useEffect(() => {
    if (currentUser?.role?.name.toLowerCase() === 'admin') {
        fetchUsers();
    }
  }, [currentUser, fetchUsers]);

  useEffect(() => {
    const paginatedUsers = allUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    setUsers(paginatedUsers);
  }, [allUsers, page, rowsPerPage]);

  const handleAddUser = () => {
    setEditingUser(null); setIsModalOpen(true); setActionError(null); setSuccessMessage(null);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user); setIsModalOpen(true); setActionError(null); setSuccessMessage(null);
  };

  const openDeleteDialog = (user: User) => {
    if (user.id === currentUser?.id) {
      setActionError("You cannot delete your own user account.");
      return;
    }
    setUserToDelete(user); setIsDeleteDialogOpen(true); setActionError(null); setSuccessMessage(null);
  };

  const handleModalSubmit = async (data: UserCreateDataAdmin | UserUpdateDataAdmin) => {
    if (!token) return;
    setIsModalLoading(true); setActionError(null); setSuccessMessage(null);
    try {
      if (editingUser) {
        await userService.updateUserByAdmin(token, editingUser.id, data as UserUpdateDataAdmin);
        setSuccessMessage('User updated successfully!');
      } else {
        await userService.createUserByAdmin(token, data as UserCreateDataAdmin);
        setSuccessMessage('User created successfully!');
      }
      setIsModalOpen(false); fetchUsers();
    } catch (err: any) {
      setActionError(err.message || 'Failed to save user.');
    } finally {
      setIsModalLoading(false);
    }
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete || !token) return;
    if (userToDelete.id === currentUser?.id) {
      setActionError("You cannot delete your own user account.");
      setIsDeleteDialogOpen(false);
      return;
    }
    setIsDeleting(true); setActionError(null); setSuccessMessage(null);
    try {
      await userService.deleteUserByAdmin(token, userToDelete.id);
      setIsDeleteDialogOpen(false); setUserToDelete(null); setSuccessMessage('User deleted successfully!');
      fetchUsers();
    } catch (err: any) {
      setActionError(err.message || 'Failed to delete user.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10)); setPage(0);
  };

  if (authLoading || (!isAuthenticated && !authLoading) || (isAuthenticated && currentUser?.role?.name.toLowerCase() !== 'admin' && !authLoading) ) {
    return <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh"><CircularProgress /></Box>;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1">User Management</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddUser}>Add New User</Button>
      </Box>

      {actionError && <Alert severity="error" sx={{ mb: 2 }}>{actionError}</Alert>}
      {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}

      {isLoading ? <Box display="flex" justifyContent="center" my={3}><CircularProgress /></Box> :
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer>
            <Table stickyHeader>
              <TableHead><TableRow><TableCell>ID</TableCell><TableCell>Username</TableCell><TableCell>Email</TableCell><TableCell>Full Name</TableCell><TableCell>Role</TableCell><TableCell>Branch</TableCell><TableCell>Status</TableCell><TableCell align="right">Actions</TableCell></TableRow></TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow hover key={user.id}>
                    <TableCell>{user.id}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.full_name || 'N/A'}</TableCell>
                    <TableCell><Chip label={user.role.name} size="small" color={user.role.name === 'admin' ? 'secondary' : 'primary'} /></TableCell>
                    <TableCell>{user.branch?.name || 'N/A'}</TableCell>
                    <TableCell><Chip label={user.disabled ? 'Disabled' : 'Active'} size="small" color={user.disabled ? 'default' : 'success'} /></TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => handleEditUser(user)} size="small"><EditIcon /></IconButton>
                      <IconButton onClick={() => openDeleteDialog(user)} size="small" disabled={user.id === currentUser?.id}><DeleteIcon /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination rowsPerPageOptions={[5, 10, 25]} component="div" count={allUsers.length} rowsPerPage={rowsPerPage} page={page} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage} />
        </Paper>
      }

      <UserFormModal open={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleModalSubmit} user={editingUser} isLoading={isModalLoading} error={actionError} />
      {userToDelete && <DeleteConfirmationDialog open={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)} onConfirm={confirmDeleteUser} title="Delete User" description={`Delete user "${userToDelete.username}"? This cannot be undone.`} isLoading={isDeleting} />}
    </Container>
  );
};

export default AdminUsersPage;
