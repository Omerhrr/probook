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
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { formatISO, format } from 'date-fns';

const ReportsPage = () => {
  const { isAuthenticated, token, loading: authLoading } = useAuth();
  const router = useRouter();

  const [startDate, setStartDate] = useState<Date | null>(new Date(new Date().getFullYear(), new Date().getMonth(), 1)); // Default to start of current month
  const [endDate, setEndDate] = useState<Date | null>(new Date()); // Default to today

  const [revenueReport, setRevenueReport] = useState<RevenueReport | null>(null);
  const [expensesReport, setExpensesReport] = useState<TotalExpensesReport | null>(null);
  const [profitLossReport, setProfitLossReport] = useState<ProfitLossReport | null>(null);

  const [loadingReportType, setLoadingReportType] = useState<string | null>(null); // 'revenue', 'expenses', 'profitloss'
  const [reportError, setReportError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/(pages)/login');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleGenerateReport = async (reportType: 'revenue' | 'expenses' | 'profitloss') => {
    if (!token || !startDate || !endDate) {
      setReportError("Please select a valid date range.");
      return;
    }
    if (startDate > endDate) {
        setReportError("Start date cannot be after end date.");
        return;
    }

    setLoadingReportType(reportType);
    setReportError(null);
    // Clear previous specific report data before fetching new one
    if(reportType === 'revenue') setRevenueReport(null);
    if(reportType === 'expenses') setExpensesReport(null);
    if(reportType === 'profitloss') setProfitLossReport(null);

    const isoStartDate = formatISO(startDate, { representation: 'date' });
    const isoEndDate = formatISO(endDate, { representation: 'date' });

    try {
      switch (reportType) {
        case 'revenue':
          const revenueData = await reportService.getRevenueReport(token, isoStartDate, isoEndDate);
          setRevenueReport(revenueData);
          break;
        case 'expenses':
          const expensesData = await reportService.getTotalExpensesReport(token, isoStartDate, isoEndDate);
          setExpensesReport(expensesData);
          break;
        case 'profitloss':
          const profitLossData = await reportService.getProfitLossReport(token, isoStartDate, isoEndDate);
          setProfitLossReport(profitLossData);
          break;
      }
    } catch (err: any) {
      setReportError(err.message || `Failed to generate ${reportType} report.`);
    } finally {
      setLoadingReportType(null);
    }
  };

  if (authLoading) {
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
          <Typography variant="h6" gutterBottom>Select Date Range</Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={5}>
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
            {/* Global generate all button could be an option too */}
          </Grid>
          {reportError && <Alert severity="error" sx={{ mt: 2 }}>{reportError}</Alert>}
        </Paper>

        <Grid container spacing={3}>
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
