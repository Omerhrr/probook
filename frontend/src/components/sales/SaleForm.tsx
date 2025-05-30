"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useForm, Controller, useFieldArray, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  TextField,
  Button,
  Grid,
  Box,
  Typography,
  Autocomplete,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

import { Customer } from '@/types/customer';
import { Product } from '@/types/product';
import { SaleItemCreateData, SaleCreateData } from '@/types/sale';
import customerService from '@/services/customerService';
import productService from '@/services/productService';
import { useAuth } from '@/contexts/AuthContext';

// Zod schema for an individual sale item
const saleItemSchema = z.object({
  product_id: z.number().min(1, "Product is required"),
  product_name: z.string(), // For display purposes, not sent to backend
  quantity: z.preprocess(
    (val) => parseInt(String(val), 10),
    z.number().min(1, "Quantity must be at least 1")
  ),
  unit_price: z.preprocess(
    (val) => parseFloat(String(val)),
    z.number().min(0, "Unit price must be non-negative")
  ),
  total_price: z.number(), // Calculated: quantity * unit_price
});

import { Branch } from '@/types/branch'; // For branch selection
import branchService from '@/services/branchService'; // To fetch branches for admin

// Zod schema for the overall sale form
const saleFormSchema = z.object({
  customer_id: z.number().int().optional().nullable(),
  branch_id: z.number().int().min(1, "Branch is required for the sale"), // Added branch_id
  items: z.array(saleItemSchema).min(1, "At least one item is required in the sale"),
});

export type SaleFormData = z.infer<typeof saleFormSchema>;
type SaleItemFormData = z.infer<typeof saleItemSchema>;

interface SaleFormProps {
  onSubmit: (data: SaleCreateData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  initialError?: string | null;
  enforcedBranchId?: number | null; // For pre-filling/disabling branch
}

const SaleForm: React.FC<SaleFormProps> = ({ onSubmit, onCancel, isLoading: formSubmitting, initialError, enforcedBranchId }) => {
  const { token, user } = useAuth(); // Get user for role
  const isAdmin = user?.role?.name.toLowerCase() === 'admin';

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]); // For admin branch selector

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [itemQuantity, setItemQuantity] = useState<number>(1);
  const [itemUnitPrice, setItemUnitPrice] = useState<number>(0);

  const [customerSearchLoading, setCustomerSearchLoading] = useState(false);
  const [productSearchLoading, setProductSearchLoading] = useState(false);
  const [branchesLoading, setBranchesLoading] = useState(false); // For admin branch dropdown
  const [formError, setFormError] = useState<string | null>(initialError || null);


  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<SaleFormData>({
    resolver: zodResolver(saleFormSchema),
    defaultValues: {
      customer_id: null,
      items: [],
      branch_id: enforcedBranchId || (isAdmin ? undefined : user?.branch?.id) || undefined,
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const currentItems = watch("items");
  const selectedBranchId = watch("branch_id"); // Watch the selected branch_id

  // Fetch branches for Admin selector
  const fetchBranchesForAdmin = useCallback(async () => {
    if (isAdmin && !enforcedBranchId && token) {
      setBranchesLoading(true);
      try {
        const branchesData = await branchService.getBranches(token);
        setBranches(branchesData);
      } catch (error) { console.error("Failed to fetch branches:", error); }
      finally { setBranchesLoading(false); }
    }
  }, [isAdmin, enforcedBranchId, token]);

  useEffect(() => {
    fetchBranchesForAdmin();
  }, [fetchBranchesForAdmin]);


  // Fetch customers based on selected branch
  const fetchCustomersForBranch = useCallback(async () => {
    if (!token || !selectedBranchId) { setCustomers([]); return; }
    setCustomerSearchLoading(true);
    try {
      const data = await customerService.getCustomers(token, 0, 50, selectedBranchId);
      setCustomers(data);
    } catch (error) { console.error("Failed to fetch customers:", error); setCustomers([]); }
    finally { setCustomerSearchLoading(false); }
  }, [token, selectedBranchId]);

  // Fetch products based on selected branch
  const fetchProductsForBranch = useCallback(async () => {
    if (!token || !selectedBranchId) { setProducts([]); return; }
    setProductSearchLoading(true);
    try {
      const data = await productService.getProducts(token, 0, 50, selectedBranchId);
      setProducts(data);
    } catch (error) { console.error("Failed to fetch products:", error); setProducts([]); }
    finally { setProductSearchLoading(false); }
  }, [token, selectedBranchId]);

  useEffect(() => {
    // When selectedBranchId changes, fetch relevant customers and products
    if (selectedBranchId) {
      fetchCustomersForBranch();
      fetchProductsForBranch();
      // Reset customer and product selections if branch changes
      setValue('customer_id', null);
      setSelectedProduct(null);
      setValue('items', []); // Clear items as products/customers are branch-specific
    } else {
      setCustomers([]);
      setProducts([]);
    }
  }, [selectedBranchId, fetchCustomersForBranch, fetchProductsForBranch, setValue]);

  // Set initial branch for branch manager
  useEffect(() => {
    if (isBranchManager && user?.branch?.id && !enforcedBranchId) {
      setValue('branch_id', user.branch.id);
    }
    if (enforcedBranchId) { // If branchId passed from list page (admin selection)
        setValue('branch_id', enforcedBranchId);
    }
  }, [isBranchManager, user?.branch?.id, setValue, enforcedBranchId]);


  const handleAddSaleItem = () => {
    if (selectedProduct && itemQuantity > 0 && itemUnitPrice >= 0) {
      const newItem: SaleItemFormData = {
        product_id: selectedProduct.id,
        product_name: selectedProduct.name,
        quantity: itemQuantity,
        unit_price: itemUnitPrice,
        total_price: itemQuantity * itemUnitPrice,
      };
      append(newItem);
      setSelectedProduct(null); // Reset product selection
      setItemQuantity(1);
      setItemUnitPrice(0);
    } else {
      setFormError("Please select a product, and ensure quantity & unit price are valid.");
    }
  };

  const calculateOverallTotal = () => {
    return currentItems.reduce((sum, item) => sum + item.total_price, 0);
  };

  const handleFormSubmit: SubmitHandler<SaleFormData> = (data) => {
    setFormError(null);
    const saleCreateData: SaleCreateData = {
      customer_id: data.customer_id,
      branch_id: Number(data.branch_id), // Ensure branch_id is included and is a number
      items: data.items.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
      })),
    };
    onSubmit(saleCreateData).catch(err => setFormError(err.message || "Submission failed"));
  };

  useEffect(() => { // Corrected from _ to ()
      if(initialError) setFormError(initialError);
  }, [initialError]);

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <Typography variant="h6" gutterBottom>Create New Sale</Typography>

      {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
      {errors.items?.message && <Alert severity="warning" sx={{ mb: 2 }}>{errors.items.message}</Alert>}
      {errors.items?.root?.message && <Alert severity="warning" sx={{ mb: 2 }}>{errors.items.root.message}</Alert>}
      {errors.branch_id?.message && <Alert severity="error" sx={{ mb: 2 }}>{errors.branch_id.message}</Alert>}


      <Grid container spacing={3}>
        {/* Branch Selection for Admin */}
        {isAdmin && !enforcedBranchId && (
          <Grid item xs={12} md={6}>
            <Controller
              name="branch_id"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  options={branches}
                  getOptionLabel={(option) => option.name}
                  onChange={(_, newValue) => field.onChange(newValue ? newValue.id : null)}
                  value={branches.find(b => b.id === field.value) || null}
                  loading={branchesLoading}
                  renderInput={(params) => (
                    <TextField {...params} label="Select Branch for Sale" fullWidth required error={!!errors.branch_id} helperText={errors.branch_id?.message} />
                  )}
                />
              )}
            />
          </Grid>
        )}

        {/* Customer Selection */}
        <Grid item xs={12} md={isAdmin && !enforcedBranchId ? 6 : 12}>
          <Controller
            name="customer_id"
            control={control}
            render={({ field }) => (
              <Autocomplete
                options={customers}
                getOptionLabel={(option) => `${option.name} (ID: ${option.id})`}
                onChange={(_, newValue) => field.onChange(newValue ? newValue.id : null)}
                value={customers.find(c => c.id === field.value) || null}
                loading={customerSearchLoading}
                disabled={!selectedBranchId && !enforcedBranchId} // Disable if no branch selected by admin or enforced
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Customer (Optional)"
                    variant="outlined"
                    helperText={!selectedBranchId && !enforcedBranchId && isAdmin ? "Please select a branch first" : ""}
                    InputProps={{ ...params.InputProps, endAdornment: (<>{customerSearchLoading ? <CircularProgress color="inherit" size={20} /> : null}{params.InputProps.endAdornment}</>)}}
                  />
                )}
              />
            )}
          />
        </Grid>

        {/* Add Sale Item Section */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>Add Product to Sale</Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={4}>
                <Autocomplete
                  options={products}
                  getOptionLabel={(option) => `${option.name} (Code: ${option.code}) - Stock: ${option.opening_stock || 0}`}
                  value={selectedProduct}
                  disabled={!selectedBranchId && !enforcedBranchId}
                  onChange={(_, newValue) => {
                    setSelectedProduct(newValue);
                    setItemUnitPrice(newValue ? newValue.selling_price : 0);
                  }}
                  loading={productSearchLoading}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Product"
                      variant="outlined"
                      helperText={!selectedBranchId && !enforcedBranchId && isAdmin ? "Please select a branch first" : ""}
                      InputProps={{ ...params.InputProps, endAdornment: (<>{productSearchLoading ? <CircularProgress color="inherit" size={20} /> : null}{params.InputProps.endAdornment}</>)}}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={6} sm={3}> {/* Quantity */}
                <TextField
                  label="Quantity"
                  type="number"
                  value={itemQuantity}
                  onChange={(e) => setItemQuantity(Math.max(1, parseInt(e.target.value,10) || 1))}
                  fullWidth
                  inputProps={{ min: 1 }}
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField
                  label="Unit Price"
                  type="number"
                  value={itemUnitPrice}
                  onChange={(e) => setItemUnitPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                  fullWidth
                  inputProps={{ step: "0.01", min: 0 }}
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <Button
                  variant="outlined"
                  onClick={handleAddSaleItem}
                  startIcon={<AddCircleOutlineIcon />}
                  fullWidth
                  sx={{height: '56px'}} // Match TextField height
                >
                  Add
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Sale Items Table */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom sx={{mt: 1}}>Current Sale Items</Typography>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell align="right">Quantity</TableCell>
                  <TableCell align="right">Unit Price</TableCell>
                  <TableCell align="right">Total Price</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {fields.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.product_name}</TableCell>
                    <TableCell align="right">{item.quantity}</TableCell>
                    <TableCell align="right">{item.unit_price.toFixed(2)}</TableCell>
                    <TableCell align="right">{item.total_price.toFixed(2)}</TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => remove(index)} size="small">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {fields.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">No items added to sale yet.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        {/* Overall Total */}
        <Grid item xs={12} sx={{ textAlign: 'right' }}>
          <Typography variant="h5">
            Overall Total: {calculateOverallTotal().toFixed(2)}
          </Typography>
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        <Button onClick={onCancel} sx={{ mr: 1 }} disabled={formSubmitting}>Cancel</Button>
        <Button type="submit" variant="contained" disabled={formSubmitting || fields.length === 0}>
          {formSubmitting ? 'Creating Sale...' : 'Create Sale'}
        </Button>
      </Box>
    </form>
  );
};

export default SaleForm;
