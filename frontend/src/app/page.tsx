"use client"; // Required for client-side hooks

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getRevenueReport, getTotalExpensesReport } from '@/services/reportService';
import { Typography, Box, CircularProgress, Button, Grid, Card, CardContent } from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AssessmentIcon from '@mui/icons-material/Assessment';

export default function HomePage() {
  const { isAuthenticated, user, logout, loading: authLoading } = useAuth();
  const router = useRouter();

  const [revenueData, setRevenueData] = useState<{ total_revenue: number } | null>(null);
  const [expensesData, setExpensesData] = useState<{ total_expenses: number } | null>(null);
  const [loadingRevenue, setLoadingRevenue] = useState(true);
  const [loadingExpenses, setLoadingExpenses] = useState(true);
  const [errorRevenue, setErrorRevenue] = useState<string | null>(null);
  const [errorExpenses, setErrorExpenses] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/(pages)/login'); // Adjusted path to match the login page route
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated && user?.token) {
      const today = new Date();
      const startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
      const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

      // Fetch Revenue
      setLoadingRevenue(true);
      getRevenueReport(user.token, startDate, endDate)
        .then(data => {
          setRevenueData(data);
          setErrorRevenue(null);
        })
        .catch(err => {
          setErrorRevenue(err.message || 'Failed to fetch revenue');
          setRevenueData({ total_revenue: 0 }); // Set to default or keep null as preferred
        })
        .finally(() => {
          setLoadingRevenue(false);
        });

      // Fetch Expenses
      setLoadingExpenses(true);
      getTotalExpensesReport(user.token, startDate, endDate)
        .then(data => {
          setExpensesData(data);
          setErrorExpenses(null);
        })
        .catch(err => {
          setErrorExpenses(err.message || 'Failed to fetch expenses');
          setExpensesData({ total_expenses: 0 }); // Set to default or keep null as preferred
        })
        .finally(() => {
          setLoadingExpenses(false);
        });
    }
  }, [isAuthenticated, user?.token]); // Dependency on user.token ensures it runs when token is available

  if (authLoading || !isAuthenticated) {
    // Show a loading spinner or a blank page while checking auth / redirecting
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  // If authenticated, show the dashboard content
  return (
    <Box sx={{ p: 3, textAlign: 'center' }}>
      <Typography variant="h4" gutterBottom>
        Welcome to ProBook Dashboard, {user?.username || 'User'}!
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        This is your main dashboard. More features will be added here soon.
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3, mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="div" gutterBottom>
                Total Revenue (Current Month)
              </Typography>
              <Typography variant="h5">
                {loadingRevenue ? <CircularProgress size={24} /> :
                  errorRevenue ? <Typography color="error" variant="caption">{errorRevenue}</Typography> :
                  `$${(revenueData?.total_revenue || 0).toFixed(2)}`}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="div" gutterBottom>
                Total Expenses (Current Month)
              </Typography>
              <Typography variant="h5">
                {loadingExpenses ? <CircularProgress size={24} /> :
                  errorExpenses ? <Typography color="error" variant="caption">{errorExpenses}</Typography> :
                  `$${(expensesData?.total_expenses || 0).toFixed(2)}`}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Action Buttons */}
      <Box sx={{ mt: 4, mb: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddShoppingCartIcon />}
          onClick={() => router.push('/(pages)/sales/new')}
        >
          Create New Sale
        </Button>
        <Button
          variant="contained"
          startIcon={<ReceiptLongIcon />}
          onClick={() => router.push('/(pages)/expenses')}
        >
          Manage Expenses
        </Button>
        <Button
          variant="contained"
          startIcon={<AssessmentIcon />}
          onClick={() => router.push('/(pages)/reports')}
        >
          View Reports
        </Button>
      </Box>

      <Button variant="contained" onClick={() => {
        logout();
        router.push('/(pages)/login'); // Redirect to login after logout
      }}>
        Logout
      </Button>
      {/* Add more dashboard components here */}
    </Box>
  );
}
