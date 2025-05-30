"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation'; // useSearchParams for success message
import { useAuth } from '@/contexts/AuthContext';
import saleService from '@/services/saleService';
import { Sale } from '@/types/sale';
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
import VisibilityIcon from '@mui/icons-material/Visibility';
import { format } from 'date-fns';
import { Branch } from '@/types/branch'; // For branch selector
import branchService from '@/services/branchService'; // To fetch branches

const SalesPage = () => {
  const { isAuthenticated, token, user, loading: authLoading } = useAuth(); // Get user
  const router = useRouter();
  const searchParams = useSearchParams();

  const [sales, setSales] = useState<Sale[]>([]);
  const [allSales, setAllSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
        .catch(err => setError("Failed to load branches: " + err.message));
    } else if (isBranchManager && user?.branch?.id) {
      setSelectedBranchId(user.branch.id);
    }
  }, [isAdmin, isBranchManager, token, user?.branch?.id]);

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      setSuccessMessage('Sale created successfully!');
      router.replace('/(pages)/sales', undefined);
    }
  }, [searchParams, router]);

  const fetchSales = useCallback(async () => {
    if (!token || (!isAdmin && !isBranchManager)) return;

    let branchIdForFetch: number | 'all' | undefined = undefined;
    if (isAdmin) {
      branchIdForFetch = selectedBranchId === '' ? 'all' : selectedBranchId;
    } else if (isBranchManager) {
      branchIdForFetch = user?.branch?.id;
    }

    if (isBranchManager && branchIdForFetch === undefined) {
        setError("Branch manager not assigned to a branch.");
        setIsLoading(false); setAllSales([]); return;
    }
    if (!branchIdForFetch && isAdmin && selectedBranchId === '') branchIdForFetch = 'all';

    setIsLoading(true);
    setError(null);
    try {
      // Pass customerId as null or undefined if not filtering by it.
      const data = await saleService.getSales(token, 0, 10000, branchIdForFetch, null);
      setAllSales(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch sales.');
      setAllSales([]);
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
          fetchSales();
        } else if (isAdmin && selectedBranchId === '') {
           fetchSales();
        }
      } else {
        setError("You are not authorized to view this page.");
        setIsLoading(false);
      }
    }
  }, [isAuthenticated, token, authLoading, router, fetchSales, isAdmin, isBranchManager, selectedBranchId]);

  useEffect(() => {
    const paginatedSales = allSales.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    setSales(paginatedSales);
  }, [allSales, page, rowsPerPage]);


  const handleCreateNewSale = () => {
    let path = '/(pages)/sales/new';
    if (isAdmin && typeof selectedBranchId === 'number') {
      path += `?branchId=${selectedBranchId}`;
    }
    // For branch manager, their branch is known via AuthContext in SaleForm
    router.push(path);
  };

  const handleViewSaleDetails = (saleId: number) => {
    router.push(`/(pages)/sales/${saleId}`);
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

  if (!isAuthenticated) {
    return <Typography>Redirecting to login...</Typography>;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1">
          Sales
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateNewSale} disabled={isAdmin && selectedBranchId === 'all'}>
          Create New Sale
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
      {isAdmin && selectedBranchId === 'all' && (
         <Alert severity="info" sx={{ mb: 2 }}>Please select a specific branch to create a new sale for that branch.</Alert>
       )}


      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}

      {isLoading ? <Box display="flex" justifyContent="center" my={3}><CircularProgress /></Box> :
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Sale ID</TableCell><TableCell>Date</TableCell>
                  {isAdmin && <TableCell>Branch</TableCell>}
                  <TableCell>Customer</TableCell><TableCell align="right">Total Amount</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sales.map((sale) => (
                  <TableRow hover key={sale.id}>
                    <TableCell>{sale.id}</TableCell>
                    <TableCell>{format(new Date(sale.sale_date), 'PPpp')}</TableCell>
                    {isAdmin && <TableCell>{sale.branch?.name || 'N/A'}</TableCell>}
                    <TableCell>{sale.customer?.name || 'N/A'}</TableCell>
                    <TableCell align="right">{sale.total_amount.toFixed(2)}</TableCell>
                    <TableCell align="center">
                      <IconButton onClick={() => handleViewSaleDetails(sale.id)} size="small">
                      <VisibilityIcon />
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
          count={allSales.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Container>
  );
};

export default SalesPage;
