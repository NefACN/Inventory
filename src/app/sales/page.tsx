'use client';
import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Button,
  Card,
  CardHeader,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Grid,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import { format } from 'date-fns';



interface Product {
  idproducto: number;
  nombre: string;
  precio_unitario: number;
  precioventa: number;
  stock: number;
}

interface SaleProduct {
  idproducto: number;
  nombre: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}
interface Sale {
  idventa: number;
  fechaventa: Date;
  total: number;
  habilitado: boolean; // true = no pagado, false = pagado
  productos: SaleProduct[];
}
interface SaleProductForm {
  idproducto: string;
  cantidad: number;
  precio_unitario: number;
  stock?: number;
  tempId?: string;
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning';
}

interface ProductDetailsDialog {
  open: boolean;
  products: SaleProduct[];
}


export default function SalesPage() {
  // States
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [saleProducts, setSaleProducts] = useState<SaleProductForm[]>([]);
  const [productDetailsDialog, setProductDetailsDialog] = useState<ProductDetailsDialog>({
    open: false,
    products: []
  });
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success'
  });

  // Fetch functions
  const fetchSales = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/sales');
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al cargar las ventas');
      }
      const data = await response.json();
      setSales(data);
    } catch (error) {
      console.error('Error:', error);
      showSnackbar(error instanceof Error ? error.message : 'Error al cargar las ventas', 'error');
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const fetchProducts = useCallback(async () => {
    try {
      const response = await fetch('/api/products');
      if (!response.ok) throw new Error('Error al cargar los productos');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error:', error);
      showSnackbar('Error al cargar los productos', 'error');
    }
  }, []);

  useEffect(() => {
    fetchSales();
    fetchProducts();
  }, [fetchSales, fetchProducts]);

  useEffect(() => {
    if (isDialogOpen && saleProducts.length === 0) {
      setSaleProducts([{
        idproducto: "",
        cantidad: 1,
        precio_unitario: 0,
        tempId: Date.now().toString()
      }]);
    }
  }, [isDialogOpen]);

  // Helper functions
  const showSnackbar = (message: string, severity: SnackbarState['severity']) => {
    setSnackbar({ open: true, message, severity });
  };

  const resetForm = () => {
    setSaleProducts([]);
  };
  // Event handlers
  const handleAddProduct = () => {
    setSaleProducts(prev => [
      ...prev,
      {
        idproducto: "",
        cantidad: 1,
        precio_unitario: 0,
        tempId: Date.now().toString()
      }
    ]);
  };

  const handlePaymentStatusChange = async (idventa: number, newStatus: boolean) => {
    try {
        setIsLoading(true);
        const response = await fetch(`/api/sales/${idventa}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado_pago: newStatus })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error al actualizar el estado');
        }
        
        showSnackbar(
            `Venta marcada como ${!newStatus ? 'pagada' : 'no pagada'} correctamente`,
            'success'
        );
        await fetchSales();
    } catch (error) {
        console.error('Error:', error);
        showSnackbar(error instanceof Error ? error.message : 'Error al actualizar', 'error');
    } finally {
        setIsLoading(false);
    }
};

  const handleProductChange = (index: number, field: keyof SaleProductForm, value: string | number) => {
    setSaleProducts(prevProducts => {
      const updatedProducts = [...prevProducts];
      const updatedProduct = { ...updatedProducts[index] };

      if (field === 'idproducto' && typeof value === 'string') {
        const selectedProduct = products.find(p => p.idproducto.toString() === value);
        if (selectedProduct) {
          updatedProduct.precio_unitario = selectedProduct.precioventa;
          updatedProduct.stock = selectedProduct.stock;
          
          if (updatedProduct.cantidad > selectedProduct.stock) {
            showSnackbar(`Solo hay ${selectedProduct.stock} unidades disponibles`, 'warning');
            updatedProduct.cantidad = selectedProduct.stock;
          }
        }
      }

      if (field === 'cantidad' && typeof value === 'number') {
        const product = products.find(p => p.idproducto.toString() === updatedProduct.idproducto);
        if (product && value > product.stock) {
          showSnackbar(`Solo hay ${product.stock} unidades disponibles`, 'warning');
          updatedProduct.cantidad = product.stock;
        } else {
          updatedProduct.cantidad = value;
        }
      } else {
        (updatedProduct[field] as typeof value) = value;
      }

      updatedProducts[index] = updatedProduct;
      return updatedProducts;
    });
  };

  const handleRemoveProduct = (index: number) => {
    setSaleProducts(prev => prev.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return saleProducts.reduce((total, product) => {
      return total + (product.cantidad * product.precio_unitario);
    }, 0);
  };

  
  interface ApiError {
    error: string;
    message?: string;
  }

  const handleCreateSale = async () => {
    try {
        setIsLoading(true);
        const saleData = {
            productos: saleProducts.map(product => ({
                idproducto: parseInt(product.idproducto),
                cantidad: product.cantidad,
                precio_unitario: product.precio_unitario
            })),
            fechaventa: new Date(),
            habilitado: true  // Explícitamente lo establecemos como no pagado
        };

        const response = await fetch('/api/sales', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(saleData)
        });

        if (!response.ok) {
            const errorData = await response.json() as ApiError;
            throw new Error(errorData.error || errorData.message || 'Error al crear la venta');
        }

        showSnackbar('Venta creada exitosamente', 'success');
        setIsDialogOpen(false);
        resetForm();
        await fetchSales();
        await fetchProducts();
    } catch (error) {
        console.error('Error:', error);
        showSnackbar(error instanceof Error ? error.message : 'Error al crear la venta', 'error');
    } finally {
        setIsLoading(false);
    }
};

  const isFormValid = () => {
    return saleProducts.length > 0 && saleProducts.every(product => 
      product.idproducto && 
      product.cantidad > 0 && 
      product.precio_unitario > 0
    );
  };
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'unpaid'>('all');

  const filteredSales = sales.filter(sale => {
    switch (statusFilter) {
        case 'paid':
            return !sale.habilitado;
        case 'unpaid':
            return sale.habilitado;
        default:
            return true;
    }
});

const getSaleStats = () => {
  const total = sales.length;
  const paid = sales.filter(sale => !sale.habilitado).length;
  const unpaid = sales.filter(sale => sale.habilitado).length;
  return { total, paid, unpaid };
};
  return (
    
    <Box sx={{ p: 3 }}>
            <Card>
              <CardHeader
                    title="Ventas"
                    action={
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            <FormControl size="small">
                                <Select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value as 'all' | 'paid' | 'unpaid')}
                                    sx={{ minWidth: 120 }}
                                >
                                    <MenuItem value="all">Todas</MenuItem>
                                    <MenuItem value="paid">Pagadas</MenuItem>
                                    <MenuItem value="unpaid">No Pagadas</MenuItem>
                                </Select>
                            </FormControl>
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => setIsDialogOpen(true)}
                            >
                                Nueva Venta
                            </Button>
                            <Box sx={{ mb: 2 }}>
                              <Grid container spacing={2}>
                                  <Grid item>
                                      <Chip
                                          label={`Total: ${getSaleStats().total}`}
                                          color="default"
                                      />
                                  </Grid>
                                  <Grid item>
                                      <Chip
                                          label={`Pagadas: ${getSaleStats().paid}`}
                                          color="success"
                                      />
                                  </Grid>
                                  <Grid item>
                                      <Chip
                                          label={`No Pagadas: ${getSaleStats().unpaid}`}
                                          color="error"
                                      />
                                  </Grid>
                              </Grid>
                          </Box>
                        </Box>
                    }
                />
                <CardContent>
                    {isLoading ? (
                        <Box display="flex" justifyContent="center" p={3}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>ID</TableCell>
                                        <TableCell>Fecha</TableCell>
                                        <TableCell>Productos</TableCell>
                                        <TableCell align="right">Total</TableCell>
                                        <TableCell>Estado</TableCell>
                                        <TableCell>Acciones</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                  {filteredSales.map((sale) =>  (
                                      <TableRow key={sale.idventa} hover>
                                          <TableCell>{sale.idventa}</TableCell>
                                          <TableCell>
                                              {format(new Date(sale.fechaventa), 'dd/MM/yyyy')}
                                          </TableCell>
                                          <TableCell>
                                              <Button
                                                  startIcon={<ShoppingBagIcon />}
                                                  onClick={() => setProductDetailsDialog({
                                                      open: true,
                                                      products: sale.productos
                                                  })}
                                                  size="small"
                                              >
                                                  Ver Productos ({sale.productos.length})
                                              </Button>
                                          </TableCell>
                                          <TableCell align="right">
                                              {sale.total.toFixed(2)} Bs.
                                          </TableCell>
                                          <TableCell>
                                              <Chip
                                                  label={sale.habilitado ? "No pagado" : "Pagado"}
                                                  color={sale.habilitado ? "error" : "success"}
                                              />
                                          </TableCell>
                                          <TableCell>
                                              <Button
                                                  variant="outlined"
                                                  color={sale.habilitado ? "success" : "error"}
                                                  size="small"
                                                  onClick={() => handlePaymentStatusChange(sale.idventa, !sale.habilitado)}
                                              >
                                                  {sale.habilitado ? "Marcar como Pagado" : "Marcar como No Pagado"}
                                              </Button>
                                          </TableCell>
                                      </TableRow>
                                  ))}
                              </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </CardContent>
            </Card>

      {/* New Sale Dialog */}
      <Dialog 
        open={isDialogOpen} 
        onClose={() => {
          if (!isLoading) {
            setIsDialogOpen(false);
            resetForm();
          }
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Nueva Venta</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gap: 2, pt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Productos</Typography>
              <Button
                startIcon={<AddIcon />}
                onClick={handleAddProduct}
                variant="outlined"
              >
                Agregar Producto
              </Button>
            </Box>

            {saleProducts.map((product, index) => (
              <Grid
                key={product.tempId || index}
                container
                spacing={2}
                alignItems="center"
              >
                <Grid item xs={5}>
                  <FormControl fullWidth>
                    <InputLabel>Producto</InputLabel>
                    <Select
                      value={product.idproducto}
                      onChange={(e) => handleProductChange(index, 'idproducto', e.target.value)}
                      label="Producto"
                    >
                      {products
                        .filter(p => p.stock > 0)
                        .map((p) => (
                          <MenuItem
                            key={p.idproducto}
                            value={p.idproducto.toString()}
                          >
                            {p.nombre} (Stock: {p.stock})
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={2}>
                  <TextField
                    type="number"
                    label="Cantidad"
                    value={product.cantidad}
                    onChange={(e) => handleProductChange(index, 'cantidad', parseInt(e.target.value) || 0)}
                    fullWidth
                    InputProps={{ 
                      inputProps: { 
                        min: 1,
                        max: product.stock
                      } 
                    }}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    type="number"
                    label="Precio unitario"
                    value={product.precio_unitario}
                    onChange={(e) => handleProductChange(index, 'precio_unitario', parseFloat(e.target.value) || 0)}
                    fullWidth
                    InputProps={{ 
                      inputProps: { 
                        step: "0.01",
                        min: 0
                      } 
                    }}
                  />
                </Grid>
                <Grid item xs={2}>
                  <IconButton
                    onClick={() => handleRemoveProduct(index)}
                    color="error"
                    disabled={saleProducts.length === 1}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Grid>
              </Grid>
            ))}

            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mt: 2,
              borderTop: 1,
              borderColor: 'divider',
              pt: 2
            }}>
              <Typography variant="h6">Total:</Typography>
              <Typography variant="h6">
                ${calculateTotal().toFixed(2)}
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            onClick={() => {
              setIsDialogOpen(false);
              resetForm();
            }}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateSale}
            disabled={!isFormValid() || isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Crear Venta'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Product Details Dialog */}
      <Dialog
        open={productDetailsDialog.open}
        onClose={() => setProductDetailsDialog({ open: false, products: [] })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Detalles de la Venta</DialogTitle>
        <DialogContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Producto</TableCell>
                  <TableCell align="right">Cantidad</TableCell>
                  <TableCell align="right">Precio Unit.</TableCell>
                  <TableCell align="right">Subtotal</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {productDetailsDialog.products.map((product) => (
                  <TableRow key={product.idproducto}>
                    <TableCell>{product.nombre}</TableCell>
                    <TableCell align="right">{product.cantidad}</TableCell>
                    <TableCell align="right">${product.precio_unitario.toFixed(2)}</TableCell>
                    <TableCell align="right">
                      ${product.subtotal.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProductDetailsDialog({ open: false, products: [] })}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}