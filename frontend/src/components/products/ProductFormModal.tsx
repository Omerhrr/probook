"use client";

import React from 'react';
import { Dialog, DialogContent, DialogTitle, Alert } from '@mui/material';
import ProductForm from './ProductForm';
import { Product, ProductCreateData, ProductUpdateData } from '@/types/product';

interface ProductFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ProductCreateData | ProductUpdateData) => Promise<void>;
  product?: Product | null; // Existing product for editing
  isLoading?: boolean;
  error?: string | null;
}

const ProductFormModal: React.FC<ProductFormModalProps> = ({
  open,
  onClose,
  onSubmit,
  product,
  isLoading,
  error,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{product ? 'Edit Product' : 'Add New Product'}</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <ProductForm
          product={product}
          onSubmit={async (data) => {
            await onSubmit(data);
            // onClose(); // Optionally close modal on successful submit, handled by parent
          }}
          onCancel={onClose}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ProductFormModal;
