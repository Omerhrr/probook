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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { format } from 'date-fns';

const SalesPage = () => {
  const { isAuthenticated, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams(); // To read query params

  const [sales, setSales] = useState<Sale[]>([]); // For displayed (paginated) sales
  const [allSales, setAllSales] = useState<Sale[]>([]); // For storing all fetched sales
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      setSuccessMessage('Sale created successfully!');
      // Optional: remove the query param from URL without reloading
      router.replace('/(pages)/sales', undefined);
    }
  }, [searchParams, router]);

  const fetchSales = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await saleService.getSales(token, 0, 10000); // Fetch all for client pagination
      setAllSales(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch sales.');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || !token) {
        router.push('/(pages)/login');
      } else {
        fetchSales();
      }
    }
  }, [isAuthenticated, token, authLoading, router, fetchSales]);

  useEffect(() => {
    // Client-side pagination logic
    const paginatedSales = allSales.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    setSales(paginatedSales);
  }, [allSales, page, rowsPerPage]);


  const handleCreateNewSale = () => {
    router.push('/(pages)/sales/new');
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
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateNewSale}
        >
          Create New Sale
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table stickyHeader aria-label="sales table">
            <TableHead>
              <TableRow>
                <TableCell>Sale ID</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell align="right">Total Amount</TableCell>
                {/* <TableCell>Seller</TableCell> TODO: Add if user details are fetched */}
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sales.map((sale) => (
                <TableRow hover key={sale.id}>
                  <TableCell>{sale.id}</TableCell>
                  <TableCell>{format(new Date(sale.sale_date), 'PPpp')}</TableCell>
                  <TableCell>{sale.customer?.name || 'N/A'}</TableCell>
                  <TableCell align="right">{sale.total_amount.toFixed(2)}</TableCell>
                  {/* <TableCell>{sale.user?.username || 'N/A'}</TableCell> */}
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
