"use client";

import React, { useEffect } from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { TextField, Button, Grid, Box, Typography } from '@mui/material';
import { Product, ProductCreateData, ProductUpdateData } from '@/types/product';

import { Autocomplete, CircularProgress } from '@mui/material'; // Added Autocomplete, CircularProgress
import { Branch } from '@/types/branch'; // For branch selection
import { Supplier } from '@/types/supplier'; // For supplier selection
import supplierService from '@/services/supplierService'; // To fetch suppliers
import branchService from '@/services/branchService'; // To fetch branches for admin
import { useAuth } from '@/contexts/AuthContext'; // To check user role

// Zod schema for validation
const productFormSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  name: z.string().min(1, 'Name is required'),
  category: z.string().optional().nullable(),
  purchase_date: z.string().optional().nullable()
    .refine(val => val === null || val === undefined || val === '' || !isNaN(Date.parse(val)), {
      message: "Invalid date format for Purchase Date"
    }).transform(val => val === '' ? null : val), // Ensure empty string becomes null
  selling_price: z.preprocess(
    (val) => parseFloat(String(val)),
    z.number().min(0, 'Selling price must be non-negative')
  ),
  purchase_price: z.preprocess(
    (val) => val === '' || val === undefined || val === null ? null : parseFloat(String(val)),
    z.number().min(0, 'Purchase price must be non-negative').optional().nullable()
  ),
  supplier_id: z.preprocess(
    (val) => val === '' || val === undefined || val === null ? null : parseInt(String(val), 10),
    z.number().int().optional().nullable()
  ),
  branch_id: z.number().int().min(1, "Branch is required"), // Added branch_id, mandatory
  opening_stock: z.preprocess(
    (val) => parseInt(String(val), 10) || 0, // Ensure it's a number, default to 0 if parsing fails
    z.number().int().min(0, 'Opening stock must be non-negative').optional().default(0)
  ),
});

export type ProductFormData = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  product?: Product | null;
  onSubmit: (data: ProductCreateData | ProductUpdateData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  enforcedBranchId?: number | null; // For pre-filling/disabling branch for non-admins or specific admin actions
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onSubmit, onCancel, isLoading, enforcedBranchId }) => {
  const { token, user } = useAuth();
  const isAdmin = user?.role?.name.toLowerCase() === 'admin';

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]); // For admin branch selector
  const [dataLoading, setDataLoading] = useState(true);

  const { control, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      code: product?.code || '',
      name: product?.name || '',
      category: product?.category || '',
      purchase_date: product?.purchase_date ? new Date(product.purchase_date).toISOString().split('T')[0] : '',
      selling_price: product?.selling_price || 0,
      purchase_price: product?.purchase_price === null || product?.purchase_price === undefined ? undefined : product.purchase_price,
      supplier_id: product?.supplier_id === null || product?.supplier_id === undefined ? undefined : product.supplier_id,
      branch_id: enforcedBranchId || product?.branch_id || undefined,
      opening_stock: product?.opening_stock || 0,
    },
  });

  const selectedBranchId = watch("branch_id");

  // Fetch branches for Admin selector
  const fetchBranchesForAdmin = useCallback(async () => {
    if (isAdmin && !enforcedBranchId && token) {
      try {
        const branchesData = await branchService.getBranches(token);
        setBranches(branchesData);
      } catch (error) { console.error("Failed to fetch branches:", error); }
    }
  }, [isAdmin, enforcedBranchId, token]);

  // Fetch suppliers based on selected branch
  const fetchSuppliersByBranch = useCallback(async () => {
    if (token && selectedBranchId) {
      try {
        const suppliersData = await supplierService.getSuppliers(token, 0, 100, selectedBranchId);
        setSuppliers(suppliersData);
      } catch (error) {
        console.error("Failed to fetch suppliers for branch:", error);
        setSuppliers([]); // Clear suppliers on error or if branch has no suppliers
      }
      setValue('supplier_id', undefined); // Reset supplier when branch changes
    } else {
      setSuppliers([]); // Clear if no branch selected
    }
  }, [token, selectedBranchId, setValue]);

  useEffect(() => {
    setDataLoading(true);
    Promise.all([
        isAdmin && !enforcedBranchId ? fetchBranchesForAdmin() : Promise.resolve(),
        fetchSuppliersByBranch()
    ]).finally(() => setDataLoading(false));
  }, [fetchBranchesForAdmin, fetchSuppliersByBranch, isAdmin, enforcedBranchId]);

  useEffect(() => {
    // Reset form when product or enforcedBranchId changes
    const defaultBranch = enforcedBranchId || product?.branch_id || undefined;
    reset({
      code: product?.code || '',
      name: product?.name || '',
      category: product?.category || '',
      purchase_date: product?.purchase_date ? new Date(product.purchase_date).toISOString().split('T')[0] : '',
      selling_price: product?.selling_price || 0,
      purchase_price: product?.purchase_price === null || product?.purchase_price === undefined ? undefined : product.purchase_price,
      supplier_id: product?.supplier_id === null || product?.supplier_id === undefined ? undefined : product.supplier_id,
      branch_id: defaultBranch,
      opening_stock: product?.opening_stock || 0,
    });
    // If branch_id is set (either enforced or from product), trigger supplier fetch for that branch
    if (defaultBranch) {
        setValue('branch_id', defaultBranch); // Ensure this triggers watch if needed or call fetchSuppliersByBranch directly
        // Directly calling fetchSuppliersByBranch if selectedBranchId (watched value) might not update in time for first supplier load
        if (token) {
            supplierService.getSuppliers(token, 0, 100, defaultBranch).then(setSuppliers).catch(e => {console.error(e); setSuppliers([]);});
        }
    }
  }, [product, reset, enforcedBranchId, token, setValue]);


  const handleFormSubmit: SubmitHandler<ProductFormData> = (data) => {
    const apiData: ProductCreateData | ProductUpdateData = {
      ...data,
      category: data.category || null,
      purchase_date: data.purchase_date || null,
      purchase_price: data.purchase_price === undefined || data.purchase_price === null ? null : Number(data.purchase_price),
      supplier_id: data.supplier_id === undefined || data.supplier_id === null ? null : Number(data.supplier_id),
      opening_stock: Number(data.opening_stock),
      branch_id: Number(data.branch_id), // Ensure branch_id is a number
    };
    onSubmit(apiData);
  };

  if (dataLoading && (isAdmin && !enforcedBranchId)) { // Show loader if branches are loading for admin
    return <Box display="flex" justifyContent="center" my={3}><CircularProgress /></Box>;
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <Typography variant="h6" gutterBottom>{product ? 'Edit Product' : 'Add New Product'}</Typography>
      <Grid container spacing={2}>
        {isAdmin && !enforcedBranchId && (
          <Grid item xs={12}>
            <Controller
              name="branch_id"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  options={branches}
                  getOptionLabel={(option) => option.name}
                  onChange={(_, newValue) => {
                    field.onChange(newValue ? newValue.id : null);
                    // Supplier list will update via useEffect watching selectedBranchId
                  }}
                  value={branches.find(b => b.id === field.value) || null}
                  renderInput={(params) => <TextField {...params} label="Branch" fullWidth required error={!!errors.branch_id} helperText={errors.branch_id?.message} />}
                  disabled={isLoading || dataLoading}
                />
              )}
            />
          </Grid>
        )}
         <Grid item xs={12} sm={isAdmin && !enforcedBranchId ? 6 : 12}> {/* Adjust width based on branch selector */}
          <Controller
            name="code"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="Product Code" fullWidth required error={!!errors.code} helperText={errors.code?.message} disabled={isLoading} />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6}> {/* Category */}
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="Product Name" fullWidth required error={!!errors.name} helperText={errors.name?.message} disabled={isLoading} />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <TextField {...field} value={field.value ?? ''} label="Category" fullWidth error={!!errors.category} helperText={errors.category?.message} disabled={isLoading} />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Controller
            name="purchase_date"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                value={field.value ?? ''}
                label="Purchase Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                error={!!errors.purchase_date}
                helperText={errors.purchase_date?.message}
                disabled={isLoading}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Controller
            name="selling_price"
            control={control}
            render={({ field }) => (
              <TextField {...field} type="number" label="Selling Price" fullWidth required error={!!errors.selling_price} helperText={errors.selling_price?.message} disabled={isLoading} inputProps={{ step: "0.01" }} />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Controller
            name="purchase_price"
            control={control}
            render={({ field }) => (
              <TextField {...field} value={field.value ?? ''} type="number" label="Purchase Price" fullWidth error={!!errors.purchase_price} helperText={errors.purchase_price?.message} disabled={isLoading} inputProps={{ step: "0.01" }} />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Controller
            name="supplier_id"
            control={control}
            render={({ field }) => (
              <Autocomplete
                options={suppliers}
                getOptionLabel={(option) => option.name}
                onChange={(_, newValue) => field.onChange(newValue ? newValue.id : null)}
                value={suppliers.find(s => s.id === field.value) || null}
                disabled={isLoading || !selectedBranchId || suppliers.length === 0} // Disable if no branch or no suppliers
                loading={token && selectedBranchId && suppliers.length === 0 && !product?.supplier_id} // Show loading if fetching suppliers
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Supplier (Optional)"
                    fullWidth
                    error={!!errors.supplier_id}
                    helperText={errors.supplier_id?.message || (!selectedBranchId ? "Select a branch first" : (suppliers.length === 0 ? "No suppliers in selected branch" : ""))}
                  />
                )}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6}> {/* Opening Stock */}
          <Controller
            name="opening_stock"
            control={control}
            render={({ field }) => (
              <TextField {...field} type="number" label="Opening Stock" fullWidth required error={!!errors.opening_stock} helperText={errors.opening_stock?.message} disabled={isLoading} />
            )}
          />
        </Grid>
      </Grid>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        <Button onClick={onCancel} sx={{ mr: 1 }} disabled={isLoading}>Cancel</Button>
        <Button type="submit" variant="contained" disabled={isLoading}>
          {isLoading ? (product ? 'Saving...' : 'Creating...') : (product ? 'Save Changes' : 'Create Product')}
        </Button>
      </Box>
    </form>
  );
};

export default ProductForm;
