"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import saleService from '@/services/saleService';
import { Sale, SaleItem } from '@/types/sale'; // Assuming SaleItem is part of Sale type from service
import {
  Box,
  CircularProgress,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Alert,
  Grid,
  Button,
  Divider,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { format } from 'date-fns';

const SaleDetailPage = () => {
  const { isAuthenticated, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const saleId = params.id ? parseInt(params.id as string, 10) : null;

  const [sale, setSale] = useState<Sale | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSaleDetails = useCallback(async () => {
    if (!token || !saleId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await saleService.getSaleById(token, saleId);
      setSale(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch sale details.');
    } finally {
      setIsLoading(false);
    }
  }, [token, saleId]);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || !token) {
        router.push('/(pages)/login');
      } else if (saleId) {
        fetchSaleDetails();
      } else {
        setError("Sale ID not provided."); // Should not happen with route structure
        setIsLoading(false);
      }
    }
  }, [isAuthenticated, token, authLoading, router, saleId, fetchSaleDetails]);

  if (authLoading || isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => router.back()} sx={{ mt: 2 }}>
          Go Back
        </Button>
      </Container>
    );
  }

  if (!isAuthenticated) {
    // Should be caught by useEffect but as a fallback
    return <Typography>Redirecting to login...</Typography>;
  }

  if (!sale) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="info">No sale data found.</Alert>
         <Button startIcon={<ArrowBackIcon />} onClick={() => router.back()} sx={{ mt: 2 }}>
          Go Back
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => router.push('/(pages)/sales')} sx={{ mb: 2 }}>
        Back to Sales List
      </Button>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Sale Details - ID: {sale.id}
        </Typography>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1"><strong>Sale Date:</strong> {format(new Date(sale.sale_date), 'PPpp')}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1"><strong>Customer:</strong> {sale.customer?.name || 'N/A'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1"><strong>Total Amount:</strong> ${sale.total_amount.toFixed(2)}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1"><strong>Branch:</strong> {sale.branch?.name || 'N/A'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1"><strong>Processed by (User ID):</strong> {sale.user_id}</Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h5" component="h2" gutterBottom sx={{mt: 2}}>
          Sale Items
        </Typography>
        <TableContainer component={Paper} variant="outlined">
          <Table stickyHeader aria-label="sale items table">
            <TableHead>
              <TableRow>
                <TableCell>Product ID</TableCell>
                <TableCell>Product Name</TableCell>
                <TableCell align="right">Quantity</TableCell>
                <TableCell align="right">Unit Price</TableCell>
                <TableCell align="right">Total Price</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sale.items.map((item: SaleItem) => (
                <TableRow hover key={item.id}>
                  <TableCell>{item.product_id}</TableCell>
                  <TableCell>{item.product?.name || 'N/A'}</TableCell> {/* Assuming product is populated */}
                  <TableCell align="right">{item.quantity}</TableCell>
                  <TableCell align="right">${item.unit_price.toFixed(2)}</TableCell>
                  <TableCell align="right">${item.total_price.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
};

export default SaleDetailPage;
