"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import expenseService from '@/services/expenseService';
import { Expense, ExpenseCreateData, ExpenseUpdateData } from '@/types/expense';
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
  TextField,
  Grid,
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterListIcon from '@mui/icons-material/FilterList';
import ExpenseFormModal from '@/components/expenses/ExpenseFormModal';
import DeleteConfirmationDialog from '@/components/common/DeleteConfirmationDialog';
import { format, formatISO } from 'date-fns';

const ExpensesPage = () => {
  const { isAuthenticated, token, loading: authLoading } = useAuth();
  const router = useRouter();

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [allExpenses, setAllExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isModalLoading, setIsModalLoading] = useState(false);

  // Delete dialog states
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Filter states
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterStartDate, setFilterStartDate] = useState<Date | null>(null);
  const [filterEndDate, setFilterEndDate] = useState<Date | null>(null);

  const fetchExpenses = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setActionError(null);
    try {
      const params: any = { skip: 0, limit: 10000 }; // Fetch all for client pagination/filtering
      if (filterCategory) params.category = filterCategory;
      if (filterStartDate) params.start_date = formatISO(filterStartDate, { representation: 'date' });
      if (filterEndDate) params.end_date = formatISO(filterEndDate, { representation: 'date' });

      const data = await expenseService.getExpenses(token, params);
      setAllExpenses(data);
    } catch (err: any) {
      setActionError(err.message || 'Failed to fetch expenses.');
    } finally {
      setIsLoading(false);
    }
  }, [token, filterCategory, filterStartDate, filterEndDate]);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || !token) {
        router.push('/(pages)/login');
      } else {
        fetchExpenses();
      }
    }
  }, [isAuthenticated, token, authLoading, router, fetchExpenses]);

  useEffect(() => {
    const paginatedExpenses = allExpenses.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    setExpenses(paginatedExpenses);
  }, [allExpenses, page, rowsPerPage]);

  const handleApplyFilters = () => {
    setPage(0); // Reset to first page when filters change
    fetchExpenses();
  };

  const handleAddExpense = () => {
    setEditingExpense(null);
    setIsModalOpen(true);
    setActionError(null);
    setSuccessMessage(null);
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setIsModalOpen(true);
    setActionError(null);
    setSuccessMessage(null);
  };

  const openDeleteDialog = (expense: Expense) => {
    setExpenseToDelete(expense);
    setIsDeleteDialogOpen(true);
    setActionError(null);
    setSuccessMessage(null);
  };

  const handleModalSubmit = async (data: ExpenseCreateData | ExpenseUpdateData) => {
    if (!token) return;
    setIsModalLoading(true);
    setActionError(null);
    setSuccessMessage(null);
    try {
      if (editingExpense) {
        await expenseService.updateExpense(token, editingExpense.id, data as ExpenseUpdateData);
        setSuccessMessage('Expense updated successfully!');
      } else {
        await expenseService.createExpense(token, data as ExpenseCreateData);
        setSuccessMessage('Expense created successfully!');
      }
      setIsModalOpen(false);
      fetchExpenses();
    } catch (err: any) {
      setActionError(err.message || 'Failed to save expense.');
    } finally {
      setIsModalLoading(false);
    }
  };

  const confirmDeleteExpense = async () => {
    if (!expenseToDelete || !token) return;
    setIsDeleting(true);
    setActionError(null);
    setSuccessMessage(null);
    try {
      await expenseService.deleteExpense(token, expenseToDelete.id);
      setIsDeleteDialogOpen(false);
      setExpenseToDelete(null);
      setSuccessMessage('Expense deleted successfully!');
      fetchExpenses();
    } catch (err: any) {
      setActionError(err.message || 'Failed to delete expense.');
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

  if (authLoading) { // Only show full page loader for auth check
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }
  if (!isAuthenticated) return <Typography>Redirecting to login...</Typography>;


  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1">
            Expenses
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddExpense}>
            Add New Expense
          </Button>
        </Box>

        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom>Filters</Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <TextField
                label="Category"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <DatePicker
                label="Start Date"
                value={filterStartDate}
                onChange={setFilterStartDate}
                slotProps={{ textField: { fullWidth: true, size: 'small' } }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <DatePicker
                label="End Date"
                value={filterEndDate}
                onChange={setFilterEndDate}
                slotProps={{ textField: { fullWidth: true, size: 'small' } }}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <Button
                variant="outlined"
                startIcon={<FilterListIcon />}
                onClick={handleApplyFilters}
                fullWidth
              >
                Apply
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {actionError && <Alert severity="error" sx={{ mb: 2 }}>{actionError}</Alert>}
        {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}

        {isLoading && !authLoading ?  // Show table loader only if not authLoading
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh"><CircularProgress /></Box> :
            <>
              <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                <TableContainer>
                  <Table stickyHeader aria-label="expenses table">
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>Supplier</TableCell>
                        <TableCell align="right">Amount</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {expenses.map((expense) => (
                        <TableRow hover key={expense.id}>
                          <TableCell>{format(new Date(expense.expense_date), 'PP')}</TableCell>
                          <TableCell>{expense.category}</TableCell>
                          <TableCell>{expense.description || 'N/A'}</TableCell>
                          <TableCell>{expense.supplier?.name || 'N/A'}</TableCell>
                          <TableCell align="right">${expense.amount.toFixed(2)}</TableCell>
                          <TableCell align="center">
                            <IconButton onClick={() => handleEditExpense(expense)} size="small">
                              <EditIcon />
                            </IconButton>
                            <IconButton onClick={() => openDeleteDialog(expense)} size="small">
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
                  count={allExpenses.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </Paper>
            </>
        }

        <ExpenseFormModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleModalSubmit}
          expense={editingExpense}
          isLoading={isModalLoading}
          error={actionError} // Pass down error to potentially display in modal
        />

        {expenseToDelete && (
          <DeleteConfirmationDialog
            open={isDeleteDialogOpen}
            onClose={() => setIsDeleteDialogOpen(false)}
            onConfirm={confirmDeleteExpense}
            title="Delete Expense"
            description={`Are you sure you want to delete this expense: "${expenseToDelete.category} - $${expenseToDelete.amount}"? This action cannot be undone.`}
            isLoading={isDeleting}
          />
        )}
      </Container>
    </LocalizationProvider>
  );
};

export default ExpensesPage;
