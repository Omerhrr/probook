"use client";

import React, { useEffect } from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { TextField, Button, Grid, Box, Typography } from '@mui/material';
import { Product, ProductCreateData, ProductUpdateData } from '@/types/product';

// Zod schema for validation
const productFormSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  name: z.string().min(1, 'Name is required'),
  category: z.string().optional().nullable(),
  purchase_date: z.string().optional().nullable() // Should be a valid date string or null
    .refine(val => val === null || val === undefined || val === '' || !isNaN(Date.parse(val)), {
      message: "Invalid date format for Purchase Date"
    }),
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
  opening_stock: z.preprocess(
    (val) => parseInt(String(val), 10),
    z.number().int().min(0, 'Opening stock must be non-negative').optional().default(0)
  ),
});

export type ProductFormData = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  product?: Product | null; // Existing product for editing, null for creation
  onSubmit: (data: ProductCreateData | ProductUpdateData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onSubmit, onCancel, isLoading }) => {
  const { control, handleSubmit, reset, formState: { errors } } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      code: product?.code || '',
      name: product?.name || '',
      category: product?.category || '',
      purchase_date: product?.purchase_date ? new Date(product.purchase_date).toISOString().split('T')[0] : '', // Format for date input
      selling_price: product?.selling_price || 0,
      purchase_price: product?.purchase_price || undefined, // react-hook-form prefers undefined for empty number fields
      supplier_id: product?.supplier_id || undefined,
      opening_stock: product?.opening_stock || 0,
    },
  });

  useEffect(() => {
    // Reset form if product data changes (e.g., when opening modal for different product)
    reset({
      code: product?.code || '',
      name: product?.name || '',
      category: product?.category || '',
      purchase_date: product?.purchase_date ? new Date(product.purchase_date).toISOString().split('T')[0] : '',
      selling_price: product?.selling_price || 0,
      purchase_price: product?.purchase_price || undefined,
      supplier_id: product?.supplier_id || undefined,
      opening_stock: product?.opening_stock || 0,
    });
  }, [product, reset]);

  const handleFormSubmit: SubmitHandler<ProductFormData> = (data) => {
    // Convert empty strings for nullable fields to null or undefined as appropriate for the API
    const apiData = {
      ...data,
      category: data.category || null,
      purchase_date: data.purchase_date || null,
      purchase_price: data.purchase_price === undefined || data.purchase_price === null ? null : Number(data.purchase_price),
      supplier_id: data.supplier_id === undefined || data.supplier_id === null ? null : Number(data.supplier_id),
      opening_stock: Number(data.opening_stock)
    };
    onSubmit(apiData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <Typography variant="h6" gutterBottom>
        {product ? 'Edit Product' : 'Add New Product'}
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Controller
            name="code"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="Product Code" fullWidth required error={!!errors.code} helperText={errors.code?.message} disabled={isLoading} />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
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
              <TextField {...field} value={field.value ?? ''} type="number" label="Supplier ID" fullWidth error={!!errors.supplier_id} helperText={errors.supplier_id?.message} disabled={isLoading} />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
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
