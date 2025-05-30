"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import reportService from '@/services/reportService';
import { RevenueReport, TotalExpensesReport, ProfitLossReport } from '@/types/report';
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  Typography,
  Alert,
  Grid,
  Card,
  CardContent,
  CardActions,
  Divider,
  Select, MenuItem, FormControl, InputLabel, // For Branch Selector
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { formatISO, format } from 'date-fns';
import { Branch } from '@/types/branch'; // For branch selector
import branchService from '@/services/branchService'; // To fetch branches

const ReportsPage = () => {
  const { isAuthenticated, token, user, loading: authLoading } = useAuth(); // Get user
  const router = useRouter();

  const [startDate, setStartDate] = useState<Date | null>(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [endDate, setEndDate] = useState<Date | null>(new Date()); // Default to today

  const [revenueReport, setRevenueReport] = useState<RevenueReport | null>(null);
  const [expensesReport, setExpensesReport] = useState<TotalExpensesReport | null>(null);
  const [profitLossReport, setProfitLossReport] = useState<ProfitLossReport | null>(null);

  const [loadingReportType, setLoadingReportType] = useState<string | null>(null);
  const [reportError, setReportError] = useState<string | null>(null);

  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<number | 'all' | '' | undefined>(undefined); // undefined for initial state before role check

  const isAdmin = user?.role?.name.toLowerCase() === 'admin';
  const isBranchManager = user?.role?.name.toLowerCase() === 'branch_manager';

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/(pages)/login');
      } else {
        if (isAdmin && token) {
          branchService.getBranches(token)
            .then(data => {
              setBranches(data);
              setSelectedBranchId('all'); // Default admin to 'all'
            })
            .catch(err => setReportError("Failed to load branches: " + err.message));
        } else if (isBranchManager && user?.branch?.id) {
          setSelectedBranchId(user.branch.id); // BM fixed to their branch
        }
      }
    }
  }, [isAuthenticated, authLoading, router, token, isAdmin, isBranchManager, user?.branch?.id]);


  const handleGenerateReport = async (reportType: 'revenue' | 'expenses' | 'profitloss') => {
    if (!token || !startDate || !endDate) {
      setReportError("Please select a valid date range."); return;
    }
    if (startDate > endDate) {
      setReportError("Start date cannot be after end date."); return;
    }
    if (isAdmin && !selectedBranchId) { // Admin must select a branch or 'all'
        setReportError("Admin users, please select a branch or 'All Branches'."); return;
    }

    setLoadingReportType(reportType);
    setReportError(null);
    if(reportType === 'revenue') setRevenueReport(null);
    if(reportType === 'expenses') setExpensesReport(null);
    if(reportType === 'profitloss') setProfitLossReport(null);

    const isoStartDate = formatISO(startDate, { representation: 'date' });
    const isoEndDate = formatISO(endDate, { representation: 'date' });

    let branchIdForApi: number | 'all' | undefined = undefined;
    if (isAdmin) {
        branchIdForApi = selectedBranchId === '' ? 'all' : selectedBranchId;
    } else if (isBranchManager) { // Branch manager is always their own branch
        branchIdForApi = user?.branch?.id;
    }
    // If branchIdForApi is still undefined here for BM, it implies user.branch.id is not set.
    if (isBranchManager && !branchIdForApi) {
        setReportError("Branch manager is not assigned to a branch.");
        setLoadingReportType(null);
        return;
    }


    try {
      switch (reportType) {
        case 'revenue':
          const revenueData = await reportService.getRevenueReport(token, isoStartDate, isoEndDate, branchIdForApi);
          setRevenueReport(revenueData);
          break;
        case 'expenses':
          const expensesData = await reportService.getTotalExpensesReport(token, isoStartDate, isoEndDate, branchIdForApi);
          setExpensesReport(expensesData);
          break;
        case 'profitloss':
          const profitLossData = await reportService.getProfitLossReport(token, isoStartDate, isoEndDate, branchIdForApi);
          setProfitLossReport(profitLossData);
          break;
      }
    } catch (err: any) {
      setReportError(err.message || `Failed to generate ${reportType} report.`);
    } finally {
      setLoadingReportType(null);
    }
  };

  if (authLoading || selectedBranchId === undefined) { // Also wait for branchId to be determined
    return <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh"><CircularProgress /></Box>;
  }
  if (!isAuthenticated) return <Typography>Redirecting to login...</Typography>;

  const renderReportCard = (
    title: string,
    reportType: 'revenue' | 'expenses' | 'profitloss',
    data: RevenueReport | TotalExpensesReport | ProfitLossReport | null,
    fields: { label: string, value: string | number | undefined }[]
  ) => (
    <Grid item xs={12} md={4}>
      <Card sx={{ minHeight: 250, display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography variant="h6" gutterBottom>{title}</Typography>
          {loadingReportType === reportType ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="100px"><CircularProgress size={30} /></Box>
          ) : data ? (
            <>
              <Typography variant="body2" color="textSecondary">
                Period: {format(new Date(data.start_date), 'PP')} - {format(new Date(data.end_date), 'PP')}
              </Typography>
              {fields.map(field => (
                <Typography variant="h5" sx={{ mt: 1 }} key={field.label}>
                  {field.label}: <strong>${typeof field.value === 'number' ? field.value.toFixed(2) : field.value}</strong>
                </Typography>
              ))}
            </>
          ) : (
            <Typography variant="body2" color="textSecondary">Select dates and generate report.</Typography>
          )}
        </CardContent>
        <CardActions sx={{ justifyContent: 'flex-start', pl:2, pb:2 }}>
          <Button
            variant="contained"
            onClick={() => handleGenerateReport(reportType)}
            disabled={loadingReportType === reportType || !startDate || !endDate}
          >
            Generate {title}
          </Button>
        </CardActions>
      </Card>
    </Grid>
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Financial Reports
        </Typography>

        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>Report Filters</Typography>
          <Grid container spacing={2} alignItems="center">
            {isAdmin && (
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel id="branch-report-select-label">Branch</InputLabel>
                  <Select
                    labelId="branch-report-select-label"
                    value={selectedBranchId}
                    label="Branch"
                    onChange={(e) => setSelectedBranchId(e.target.value as number | 'all' | '')}
                  >
                    <MenuItem value="all"><em>All Branches (Aggregated)</em></MenuItem>
                    {branches.map((branch) => (
                      <MenuItem key={branch.id} value={branch.id}>{branch.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
            <Grid item xs={12} sm={isAdmin ? 4 : 6}>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={setStartDate}
                slotProps={{ textField: { fullWidth: true, size: 'small' } }}
              />
            </Grid>
            <Grid item xs={12} sm={5}>
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={setEndDate}
                slotProps={{ textField: { fullWidth: true, size: 'small' } }}
              />
            </Grid>
          </Grid>
          {reportError && <Alert severity="error" sx={{ mt: 2 }}>{reportError}</Alert>}
        </Paper>

        <Grid container spacing={3} sx={{ mt: 2 }}>
          {renderReportCard("Revenue", "revenue", revenueReport, [
            { label: "Total Revenue", value: revenueReport?.total_revenue }
          ])}
          {renderReportCard("Total Expenses", "expenses", expensesReport, [
            { label: "Total Expenses", value: expensesReport?.total_expenses }
          ])}
          {renderReportCard("Profit / Loss", "profitloss", profitLossReport, [
            { label: "Total Revenue", value: profitLossReport?.total_revenue },
            { label: "Total Expenses", value: profitLossReport?.total_expenses },
            { label: "Net Profit", value: profitLossReport?.net_profit }
          ])}
        </Grid>
      </Container>
    </LocalizationProvider>
  );
};

export default ReportsPage;
