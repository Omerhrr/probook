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
  Select, // For Branch Selector
  MenuItem, // For Branch Selector
  FormControl, // For Branch Selector
  InputLabel, // For Branch Selector
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ProductFormModal from '@/components/products/ProductFormModal';
import DeleteConfirmationDialog from '@/components/common/DeleteConfirmationDialog';
import { ProductCreateData, ProductUpdateData } from '@/types/product';
import { Branch } from '@/types/branch'; // For branch selector
import branchService from '@/services/branchService'; // To fetch branches


const ProductsPage = () => {
  const { isAuthenticated, token, user, loading: authLoading } = useAuth(); // Get user for role and branch
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]); // Displayed products (paginated)
  const [allFetchedProducts, setAllFetchedProducts] = useState<Product[]>([]); // All products from current fetch

  const [isLoading, setIsLoading] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);
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
  // totalProducts will be allFetchedProducts.length for client-side pagination

  // Branch selection for Admin
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<number | 'all' | ''>(''); // '' for unselected/loading for admin

  const isAdmin = user?.role?.name.toLowerCase() === 'admin';
  const isBranchManager = user?.role?.name.toLowerCase() === 'branch_manager';

  // Fetch branches for Admin selector
  useEffect(() => {
    if (isAdmin && token) {
      branchService.getBranches(token)
        .then(data => {
          setBranches(data);
          // Default to 'all' if admin and branches are loaded
          if (selectedBranchId === '') setSelectedBranchId('all');
        })
        .catch(err => setActionError("Failed to load branches: " + err.message));
    } else if (isBranchManager && user?.branch?.id) {
        setSelectedBranchId(user.branch.id); // BM is fixed to their branch
    }
  }, [isAdmin, isBranchManager, token, user?.branch?.id]);


  const fetchProducts = useCallback(async () => {
    if (!token || (!isAdmin && !isBranchManager)) return;

    // Determine effective branchId for fetching
    let branchIdForFetch: number | 'all' | undefined = undefined;
    if (isAdmin) {
      branchIdForFetch = selectedBranchId === '' ? 'all' : selectedBranchId;
    } else if (isBranchManager) {
      branchIdForFetch = user?.branch?.id;
    }

    if (isBranchManager && branchIdForFetch === undefined) {
        setActionError("Branch manager is not assigned to a branch.");
        setIsLoading(false);
        setAllFetchedProducts([]);
        return;
    }
    if (!branchIdForFetch && isAdmin && selectedBranchId === '') { // Admin hasn't selected, don't fetch yet or fetch 'all'
        // This condition might need adjustment based on desired default behavior for admin
        // For now, if admin has '' selected (initial state), it will be treated as 'all'.
        branchIdForFetch = 'all';
    }


    setIsLoading(true);
    setActionError(null);
    try {
      const data = await productService.getProducts(token, 0, 10000, branchIdForFetch);
      setAllFetchedProducts(data);
    } catch (err: any) {
      setActionError(err.message || 'Failed to fetch products.');
      setAllFetchedProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, [token, isAdmin, isBranchManager, selectedBranchId, user?.branch?.id]);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || !token) {
        router.push('/(pages)/login');
      } else if (isAdmin || isBranchManager) {
        // Trigger fetch if selectedBranchId is set (for admin) or if user is BM (their branch is known)
        if ((isAdmin && selectedBranchId !== '') || isBranchManager) {
            fetchProducts();
        } else if (isAdmin && selectedBranchId === '') {
            // Initial state for admin, decide if you want to load "all" by default or wait for selection
            // Currently, it will fetch 'all' due to getEffectiveBranchIdForFetch logic
             fetchProducts();
        }
      } else {
        setActionError("You are not authorized to view this page.");
        setIsLoading(false);
      }
    }
  }, [isAuthenticated, token, authLoading, router, fetchProducts, isAdmin, isBranchManager, selectedBranchId]);

  // Client-side pagination logic
   useEffect(() => {
    const paginated = allFetchedProducts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    setProducts(paginated);
  }, [allFetchedProducts, page, rowsPerPage]);


  const handleAddProduct = () => {
    setEditingProduct(null);
    setActionError(null);
    setSuccessMessage(null);
    setIsModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setActionError(null);
    setSuccessMessage(null);
    setIsModalOpen(true);
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
      // branch_id should now be part of 'data' from ProductForm
      if (editingProduct) {
        await productService.updateProduct(token, editingProduct.id, data as ProductUpdateData);
        setSuccessMessage('Product updated successfully!');
      } else {
        await productService.createProduct(token, data as ProductCreateData);
        setSuccessMessage('Product created successfully!');
      }
      setIsModalOpen(false);
      fetchProducts();
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1">Products</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddProduct} disabled={isAdmin && selectedBranchId === 'all' && !editingProduct}>
          Add New Product
        </Button>
      </Box>

      {isAdmin && (
        <FormControl fullWidth sx={{ mb: 2 }} size="small">
          <InputLabel id="branch-select-label">Filter by Branch</InputLabel>
          <Select
            labelId="branch-select-label"
            value={selectedBranchId}
            label="Filter by Branch"
            onChange={(e) => {
              const value = e.target.value as number | 'all' | '';
              setSelectedBranchId(value);
              setPage(0);
              // fetchProducts will be re-triggered by useEffect watching selectedBranchId
            }}
          >
            <MenuItem value="all"><em>All Branches</em></MenuItem>
            {branches.map((branch) => (
              <MenuItem key={branch.id} value={branch.id}>{branch.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
       {isAdmin && selectedBranchId === 'all' && !editingProduct && (
         <Alert severity="info" sx={{ mb: 2 }}>Please select a specific branch to add a new product, or the product form will require branch selection.</Alert>
       )}


      {actionError && <Alert severity="error" sx={{ mb: 2 }}>{actionError}</Alert>}
      {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}

      {isLoading ? <Box display="flex" justifyContent="center" my={3}><CircularProgress /></Box> :
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Code</TableCell><TableCell>Name</TableCell><TableCell>Category</TableCell>
                  {isAdmin && <TableCell>Branch</TableCell>}
                  <TableCell>Selling Price</TableCell><TableCell>Purchase Price</TableCell>
                  <TableCell>Stock</TableCell><TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.map((product) => ( // products is now the paginated slice
                  <TableRow hover key={product.id}>
                    <TableCell>{product.code}</TableCell><TableCell>{product.name}</TableCell>
                    <TableCell>{product.category || 'N/A'}</TableCell>
                    {isAdmin && <TableCell>{product.branch?.name || 'N/A'}</TableCell>}
                    <TableCell>{product.selling_price.toFixed(2)}</TableCell>
                    <TableCell>{product.purchase_price?.toFixed(2) || 'N/A'}</TableCell>
                    <TableCell>{product.opening_stock || 0}</TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => handleEditProduct(product)} size="small"><EditIcon /></IconButton>
                      <IconButton onClick={() => openDeleteDialog(product)} size="small"><DeleteIcon /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]} component="div" count={allFetchedProducts.length}
            rowsPerPage={rowsPerPage} page={page} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      }

      <ProductFormModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        product={editingProduct}
        isLoading={isModalLoading}
        error={actionError}
        enforcedBranchId={
          isBranchManager ? user?.branch?.id : (isAdmin && typeof selectedBranchId === 'number' ? selectedBranchId : undefined)
        }
      />

      {productToDelete && (
        <DeleteConfirmationDialog
          open={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)} onConfirm={confirmDeleteProduct}
          title="Delete Product" description={`Delete product "${productToDelete.name}"? This cannot be undone.`} isLoading={isDeleting}
        />
      )}
    </Container>
  );
};

export default ProductsPage;
