'use client';
import React, { useEffect, useState, useCallback } from 'react';
import debounce from 'lodash/debounce';
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
  Select,
  MenuItem,
  CircularProgress,
  Chip,
  SelectChangeEvent, 
  ListItemText,
  ListItem,
  List
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import { format } from 'date-fns';
import ClientLayout from "@/components/layouts/ClientLayout";
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';



interface Product {
  idproducto: number;
  nombre: string;
  precio_unitario: number;
  precioventa: number;
  preciocompra: number;
  stock: number;
  habilitado: boolean;
  categoria?: string;
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
  tempId: string;
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

interface CreateSaleInput {
  productos: {
    idproducto: number;
    cantidad: number;
    precio_unitario: number;
  }[];
  fechaventa?: Date;
  habilitado?: boolean;
}

export default function SalesPage() {
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

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [tempQuantity, setTempQuantity] = useState(1);
  const [tempPrice, setTempPrice] = useState<number>(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);

  const fetchSales = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/sales');
      if (!response.ok) throw new Error('Error al procesar la solicitud');
      const data = await response.json();
      setSales(data);
    } catch (error) {
      console.error('[SalesPage] fetchSales error:', error);
      setSnackbar({
        open: true,
        message: 'No se pudieron cargar las ventas. Por favor, intente nuevamente.',
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const fetchProducts = useCallback(async () => {
    try {
      const response = await fetch('/api/products');
      if (!response.ok) throw new Error('Error al procesar la solicitud');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('[SalesPage] fetchProducts error:', error);
      setSnackbar({
        open: true,
        message: 'No se pudieron cargar los productos. Por favor, intente nuevamente.',
        severity: 'error'
      });
    }
  }, []);

  const searchProducts = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    try {
      setIsSearching(true);
      const response = await fetch(`/api/products?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Error al procesar la solicitud');
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('[SalesPage] searchProducts error:', error);
      setSnackbar({
        open: true,
        message: 'No se pudo realizar la búsqueda. Por favor, intente nuevamente.',
        severity: 'error'
      });
    } finally {
      setIsSearching(false);
    }
  };

  const debouncedSearch = useCallback(
    debounce((query: string) => {
      searchProducts(query);
    }, 300),
    []
  );

  useEffect(() => {
    fetchSales();
    fetchProducts();
  }, [fetchSales, fetchProducts]);

  // useEffect(() => {
  //   if (isDialogOpen && saleProducts.length === 0) {
  //     setSaleProducts([{
  //       idproducto: "",
  //       cantidad: 1,
  //       precio_unitario: 0,
  //       tempId: Date.now().toString()
  //     }]);
  //   }
  // }, [isDialogOpen]);

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);


  const resetForm = () => {
    setSaleProducts([]);
    setSearchQuery('');
    setSearchResults([]);
    setSelectedProduct(null);
    setTempQuantity(1);
    setTempPrice(0);
    setIsEditing(false);
    setEditingSale(null);
  };

  const handlePaymentStatusChange = async (idventa: number, newStatus: boolean): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/sales/${idventa}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ habilitado: newStatus })
      });

      if (!response.ok) throw new Error('Error al procesar la solicitud');

      setSnackbar({
        open: true,
        message: `Estado de venta actualizado correctamente`,
        severity: 'success'
      });
      await fetchSales();
    } catch (error) {
      console.error('[SalesPage] handlePaymentStatusChange error:', error);
      setSnackbar({
        open: true,
        message: 'No se pudo actualizar el estado. Por favor, intente nuevamente.',
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTotal = () => {
    return saleProducts.reduce((total, product) => total + (product.cantidad * product.precio_unitario), 0);
  };

  const handleCreateSale = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const saleData: CreateSaleInput = {
        productos: saleProducts.map(product => ({
          idproducto: parseInt(product.idproducto),
          cantidad: product.cantidad,
          precio_unitario: product.precio_unitario
        })),
        fechaventa: new Date(),
        habilitado: true
      };

      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saleData)
      });

      if (!response.ok) throw new Error('Error al procesar la solicitud');

      setSnackbar({
        open: true,
        message: 'Venta registrada correctamente',
        severity: 'success'
      });
      setIsDialogOpen(false);
      resetForm();
      await fetchSales();
      await fetchProducts();
    } catch (error) {
      console.error('[SalesPage] handleCreateSale error:', error);
      setSnackbar({
        open: true,
        message: 'No se pudo crear la venta. Por favor, intente nuevamente.',
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
    setSelectedProduct(null);
  };

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setTempQuantity(1);
    setTempPrice(product.precioventa)
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleAddToSale = () => {
    if (!selectedProduct) return;
    const existingProductIndex = saleProducts.findIndex(
      p => p.idproducto === selectedProduct.idproducto.toString()
    );
    if (existingProductIndex >= 0) {
      const updatedProducts = [...saleProducts];
      const newQuantity = updatedProducts[existingProductIndex].cantidad + tempQuantity;
      
      if (newQuantity > selectedProduct.stock) {
        setSnackbar({
          open: true,
          message: `Stock insuficiente. Disponible: ${selectedProduct.stock}`,
          severity: 'warning'
        });
        return;
      }
      updatedProducts[existingProductIndex].cantidad = newQuantity;
      updatedProducts[existingProductIndex].precio_unitario = tempPrice;
      setSaleProducts(updatedProducts);
    } else {
      if (tempQuantity > selectedProduct.stock) {
        setSnackbar({
          open: true,
          message: `Stock insuficiente. Disponible: ${selectedProduct.stock}`,
          severity: 'warning'
        });
        return;
      }
      setSaleProducts([
        ...saleProducts,
        {
          idproducto: selectedProduct.idproducto.toString(),
          cantidad: tempQuantity,
          precio_unitario: tempPrice,
          stock: selectedProduct.stock,
          tempId: Date.now().toString()
        }
      ]);
    }
    setSelectedProduct(null);
    setTempQuantity(1);
    setTempPrice(0);
  };

  const handleEditSale = async (sale: Sale) => {
    setIsEditing(true);
    setEditingSale(sale);
    // Convert sale products to the form format
    const formProducts = sale.productos.map(product => ({
      idproducto: product.idproducto.toString(),
      cantidad: product.cantidad,
      precio_unitario: product.precio_unitario,
      tempId: Date.now().toString() + product.idproducto
    }));
    setSaleProducts(formProducts);
    setIsDialogOpen(true);
  };

  const handleUpdateSale = async () => {
    if (!editingSale) return;
    
    try {
      setIsLoading(true);
      const saleData: CreateSaleInput = {
        productos: saleProducts.map(product => ({
          idproducto: parseInt(product.idproducto),
          cantidad: product.cantidad,
          precio_unitario: product.precio_unitario
        }))
      };
  
      const response = await fetch(`/api/sales/${editingSale.idventa}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saleData)
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar la venta');
      }
  
      setSnackbar({
        open: true,
        message: 'Venta actualizada correctamente',
        severity: 'success'
      });
      setIsDialogOpen(false);
      setIsEditing(false);
      setEditingSale(null);
      resetForm();
      await fetchSales();
      await fetchProducts();
    } catch (error) {
      console.error('[SalesPage] handleUpdateSale error:', error);
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Error al actualizar la venta',
        severity: 'error'
      });
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

  const handleStatusFilterChange = (event: SelectChangeEvent<'all' | 'paid' | 'unpaid'>): void => {
    setStatusFilter(event.target.value as 'all' | 'paid' | 'unpaid');
  };

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
    <ClientLayout>
    <Box sx={{ p: 3 }}>
            <Card>
              <CardHeader
                    title="Ventas"
                    action={
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            <FormControl size="small">
                              <Select
                                  value={statusFilter}
                                  onChange={handleStatusFilterChange}
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
                                              {sale.habilitado && (
                                                <Button
                                                    variant="outlined"
                                                    color="primary"
                                                    size="small"
                                                    onClick={() => handleEditSale(sale)}
                                                    sx={{ ml: 1 }}
                                                >
                                                    Editar
                                                </Button>
                                              )}
                                          </TableCell>
                                      </TableRow>
                                  ))}
                              </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </CardContent>
            </Card>

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
        <DialogTitle>{isEditing ? 'Editar Venta' : 'Nueva Venta'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gap: 2, pt: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="h6">Buscar y Agregar Productos</Typography>
              <TextField
                fullWidth
                label="Buscar Producto"
                value={searchQuery}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: isSearching && (
                    <InputAdornment position="end">
                      <CircularProgress size={20} />
                    </InputAdornment>
                  )
                }}
              />
              {searchResults.length > 0 && searchQuery && (
                <Paper sx={{ maxHeight: 200, overflow: 'auto' }}>
                  <List dense>
                    {searchResults
                      .filter(p => p.stock > 0)
                      .map((product) => (
                        <ListItem
                          key={product.idproducto}
                          onClick={() => handleProductSelect(product)}
                          sx={{ 
                            cursor: 'pointer',
                            '&:hover': { bgcolor: 'action.hover' }
                          }}
                        >
                          <ListItemText
                            primary={product.nombre}
                            secondary={`Stock: ${product.stock} | Precio: ${product.precioventa} Bs | ${product.categoria}`}
                          />
                        </ListItem>
                      ))}
                  </List>
                </Paper>
              )}

              {selectedProduct && (
                  <Paper sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                      <Typography variant="subtitle1" sx={{ flex: 1 }}>
                        {selectedProduct.nombre} - Stock: {selectedProduct.stock}
                      </Typography>
                      <TextField
                        type="number"
                        label="Cantidad"
                        value={tempQuantity}
                        onChange={(e) => setTempQuantity(parseInt(e.target.value) || 1)}
                        sx={{ width: 100 }}
                        InputProps={{
                          inputProps: {
                            min: 1,
                            max: selectedProduct.stock
                          }
                        }}
                      />
                      <TextField
                        type="number"
                        label="Precio Unit."
                        value={tempPrice}
                        onChange={(e) => setTempPrice(Number(e.target.value))}
                        sx={{ width: 120 }}
                        InputProps={{
                          inputProps: {
                            min: 0,
                            step: 0.1
                          }
                        }}
                      />
                      <Button
                        variant="contained"
                        onClick={handleAddToSale}
                        disabled={tempQuantity < 1 || tempQuantity > selectedProduct.stock || tempPrice <= 0}
                      >
                        Agregar
                      </Button>
                    </Box>
                  </Paper>
                )}
              </Box>
            {saleProducts.length > 0 && (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Producto</TableCell>
                      <TableCell align="right">Cantidad</TableCell>
                      <TableCell align="right">Precio Unit.</TableCell>
                      <TableCell align="right">Subtotal</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {saleProducts.map((product) => {
                      const productInfo = products.find(p => p.idproducto.toString() === product.idproducto);
                      const subtotal = product.cantidad * product.precio_unitario;
                      
                      return (
                        <TableRow key={product.tempId}>
                          <TableCell>{productInfo?.nombre}</TableCell>
                          <TableCell align="right">{product.cantidad}</TableCell>
                          <TableCell align="right">{product.precio_unitario.toFixed(2)} Bs</TableCell>
                          <TableCell align="right">{subtotal.toFixed(2)} Bs</TableCell>
                          <TableCell align="right">
                            <IconButton
                              onClick={() => {
                                setSaleProducts(prev => prev.filter(p => p.tempId !== product.tempId));
                              }}
                              color="error"
                              size="small"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    <TableRow>
                      <TableCell colSpan={3} align="right">
                        <Typography variant="subtitle1">Total:</Typography>
                      </TableCell>
                      <TableCell align="right" colSpan={2}>
                        <Typography variant="subtitle1">
                          {calculateTotal().toFixed(2)} Bs
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            onClick={() => {
              setIsDialogOpen(false);
              setIsEditing(false);
              setEditingSale(null);
              resetForm();
            }}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={isEditing ? handleUpdateSale : handleCreateSale}
            disabled={!isFormValid() || isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : (isEditing ? 'Guardar Cambios' : 'Crear Venta')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={productDetailsDialog.open}
        onClose={() => setProductDetailsDialog({ open: false, products: [] })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Detalles de Productos de la Venta
        </DialogTitle>
        <DialogContent>
          <TableContainer component={Paper} sx={{ mt: 2 }}>
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
                {productDetailsDialog.products.map((product, index) => (
                  <TableRow key={index}>
                    <TableCell>{product.nombre}</TableCell>
                    <TableCell align="right">{product.cantidad}</TableCell>
                    <TableCell align="right">{product.precio_unitario.toFixed(2)} Bs</TableCell>
                    <TableCell align="right">{product.subtotal.toFixed(2)} Bs</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={3} align="right">
                    <Typography variant="subtitle1" fontWeight="bold">
                      Total:
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="subtitle1" fontWeight="bold">
                      {productDetailsDialog.products
                        .reduce((sum, product) => sum + product.subtotal, 0)
                        .toFixed(2)} Bs
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setProductDetailsDialog({ open: false, products: [] })}
            variant="contained"
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/*-------------------- Snackbar ----------------------*/}
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
    </ClientLayout>
  );
}