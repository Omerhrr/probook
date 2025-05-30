"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import productService from '@/services/productService';
import { Product } from '@/types/product';
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
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ProductFormModal from '@/components/products/ProductFormModal';
import DeleteConfirmationDialog from '@/components/common/DeleteConfirmationDialog';
import { ProductCreateData, ProductUpdateData } from '@/types/product';


const ProductsPage = () => {
  const { isAuthenticated, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true); // For page load
  const [actionError, setActionError] = useState<string | null>(null); // For modal/delete errors
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isModalLoading, setIsModalLoading] = useState(false);

  // Delete dialog states
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalProducts, setTotalProducts] = useState(0); // We don't get this from backend directly yet

  const fetchProducts = useCallback(async () => {
    if (!token) return;
    if (!token) return;
    setIsLoading(true); // For main page loading
    setActionError(null);
    // setSuccessMessage(null); // Clear previous success messages
    try {
      // This approach of fetching all and slicing client-side is temporary.
      // Ideally, backend should provide total count for server-side pagination.
      const allData = await productService.getProducts(token, 0, 10000); // Fetch more if needed
      setProducts(allData); // Store all products
      setTotalProducts(allData.length);
      // The displayed products will be derived from this list using pagination logic later
    } catch (err: any) {
      setActionError(err.message || 'Failed to fetch products.');
    } finally {
      setIsLoading(false); // For main page loading
    }
  }, [token, page, rowsPerPage]);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || !token) {
        router.push('/(pages)/login');
      } else {
        fetchProducts();
      }
    }
  }, [isAuthenticated, token, authLoading, router, fetchProducts]);

  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
    setActionError(null);
    setSuccessMessage(null);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
    setActionError(null);
    setSuccessMessage(null);
  };

  const openDeleteDialog = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteDialogOpen(true);
    setActionError(null);
    setSuccessMessage(null);
  };

  const handleModalSubmit = async (data: ProductCreateData | ProductUpdateData) => {
    if (!token) return;
    setIsModalLoading(true);
    setActionError(null);
    setSuccessMessage(null);
    try {
      if (editingProduct) {
        await productService.updateProduct(token, editingProduct.id, data as ProductUpdateData);
        setSuccessMessage('Product updated successfully!');
      } else {
        await productService.createProduct(token, data as ProductCreateData);
        setSuccessMessage('Product created successfully!');
      }
      setIsModalOpen(false);
      fetchProducts(); // Refresh list
    } catch (err: any) {
      setActionError(err.message || 'Failed to save product.');
    } finally {
      setIsModalLoading(false);
    }
  };

  const confirmDeleteProduct = async () => {
    if (!productToDelete || !token) return;
    setIsDeleting(true);
    setActionError(null);
    setSuccessMessage(null);
    try {
      await productService.deleteProduct(token, productToDelete.id);
      setIsDeleteDialogOpen(false);
      setProductToDelete(null);
      setSuccessMessage('Product deleted successfully!');
      fetchProducts(); // Refresh list
    } catch (err: any) {
      setActionError(err.message || 'Failed to delete product.');
    } finally {
      setIsDeleting(false);
    }
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

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4" component="h1">
          Products
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddProduct} // Updated
        >
          Add New Product
        </Button>
      </Box>

      {actionError && ( // Changed from error to actionError
        <Alert severity="error" sx={{ mb: 2 }}>
          {actionError}
        </Alert>
      )}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table stickyHeader aria-label="products table">
            <TableHead>
              <TableRow>
                <TableCell>Code</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Selling Price</TableCell>
                <TableCell>Purchase Price</TableCell>
                <TableCell>Stock</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products // This should be the paginated slice of all products
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((product) => (
                <TableRow hover key={product.id}>
                  <TableCell>{product.code}</TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.category || 'N/A'}</TableCell>
                  <TableCell>{product.selling_price.toFixed(2)}</TableCell>
                  <TableCell>{product.purchase_price?.toFixed(2) || 'N/A'}</TableCell>
                  <TableCell>{product.opening_stock || 0}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleEditProduct(product)} size="small"> {/* Updated */}
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => openDeleteDialog(product)} size="small"> {/* Updated */}
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalProducts} // This is total number of items
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      <ProductFormModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        product={editingProduct}
        isLoading={isModalLoading}
        error={actionError} // Pass actionError to modal
      />

      {productToDelete && (
        <DeleteConfirmationDialog
          open={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={confirmDeleteProduct}
          title="Delete Product"
          description={`Are you sure you want to delete the product "${productToDelete.name}"? This action cannot be undone.`}
          isLoading={isDeleting}
        />
      )}
    </Container>
  );
};

export default ProductsPage;
