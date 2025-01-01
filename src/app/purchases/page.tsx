"use client";
import React, { useEffect, useState } from 'react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Dialog,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  IconButton,
  Paper,
  Snackbar,
  Alert
} from '@mui/material';
import { 
  Delete as DeleteIcon,
  Add as AddIcon, 
  ShoppingBag as ShoppingBagIcon 
} from '@mui/icons-material';
import { format } from 'date-fns';

// Types
interface Provider {
  idproveedor: number;
  nombre: string;
}

interface Product {
  idproducto: number;
  nombre: string;
  preciocompra: number;
  stock: number;
}

interface PurchaseProduct {
  idproducto: number;
  nombre: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

interface Purchase {
  idcompra: number;
  fechacompra: string;
  total: number;
  proveedor: {
    idproveedor: number;
    nombre: string;
  };
  productos: PurchaseProduct[];
}

export default function PurchasePage() {
  // States
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [purchaseProducts, setPurchaseProducts] = useState<{
    idproducto: string;
    cantidad: number;
    precio_unitario: number;
  }[]>([{ idproducto: "", cantidad: 1, precio_unitario: 0 }]);
  const [productDetailsDialog, setProductDetailsDialog] = useState<{
    open: boolean;
    products: PurchaseProduct[];
  }>({ open: false, products: [] });
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  // Fetch initial data
  useEffect(() => {
    fetchPurchases();
    fetchProviders();
    fetchProducts();
  }, []);

  // Fetch functions
  const fetchPurchases = async () => {
    try {
      const response = await fetch('/api/purchase');
      if (!response.ok) throw new Error('Error fetching purchases');
      const data = await response.json();
      setPurchases(data);
    } catch (error) {
      console.error('Error al cargar las compras', error);
    }
  };

  const fetchProviders = async () => {
    try {
      const response = await fetch('/api/suppliers');
      if (!response.ok) throw new Error('Error fetching providers');
      const data = await response.json();
      setProviders(data);
    } catch (error) {
      console.error('Error al cargar los proveedores', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (!response.ok) throw new Error('Error fetching products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error al cargar los productos', error);
    }
  };

  // Handle form changes
  const handleAddProduct = () => {
    setPurchaseProducts([
      ...purchaseProducts,
      { idproducto: "", cantidad: 1, precio_unitario: 0 }
    ]);
  };

  const handleRemoveProduct = (index: number) => {
    setPurchaseProducts(purchaseProducts.filter((_, i) => i !== index));
  };

  const handleProductChange = (index: number, field: string, value: string | number) => {
    const updatedProducts = [...purchaseProducts];
    updatedProducts[index] = {
      ...updatedProducts[index],
      [field]: value,
    };
    
    if (field === 'idproducto') {
      const selectedProduct = products.find(p => p.idproducto.toString() === value);
      if (selectedProduct) {
        updatedProducts[index].precio_unitario = selectedProduct.preciocompra;
      }
    }
    
    setPurchaseProducts(updatedProducts);
  };

  // Calculate total
  const calculateTotal = () => {
    return purchaseProducts.reduce((total, product) => {
      return total + (product.cantidad * product.precio_unitario);
    }, 0);
  };

  // Show snackbar
  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  // Handle purchase creation
  const handleCreatePurchase = async () => {
    try {
      const purchase = {
        idproveedor: parseInt(selectedProvider),
        productos: purchaseProducts.map(p => ({
          idproducto: parseInt(p.idproducto),
          cantidad: p.cantidad,
          precio_unitario: p.precio_unitario
        }))
      };

      const response = await fetch('/api/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(purchase),
      });

      if (!response.ok) throw new Error('Error creating purchase');

      showSnackbar('Compra creada exitosamente', 'success');
      setIsDialogOpen(false);
      resetForm();
      fetchPurchases();
    } catch (error) {
      console.error('Error al crear la compra',error);
    }
  };

  // Reset form
  const resetForm = () => {
    setSelectedProvider("");
    setPurchaseProducts([{ idproducto: "", cantidad: 1, precio_unitario: 0 }]);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <Card>
        <CardHeader
          title="Compras"
          action={
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setIsDialogOpen(true)}
            >
              Nueva Compra
            </Button>
          }
        />
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Proveedor</TableCell>
                  <TableCell>Productos</TableCell>
                  <TableCell align="right">Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {purchases.map((purchase) => (
                  <TableRow key={purchase.idcompra}>
                    <TableCell>{purchase.idcompra}</TableCell>
                    <TableCell>
                      {format(new Date(purchase.fechacompra), 'dd/MM/yyyy')}
                    </TableCell>
                    <TableCell>{purchase.proveedor.nombre}</TableCell>
                    <TableCell>
                      <Button
                        startIcon={<ShoppingBagIcon />}
                        onClick={() => setProductDetailsDialog({
                          open: true,
                          products: purchase.productos
                        })}
                      >
                        Ver Productos ({purchase.productos.length})
                      </Button>
                    </TableCell>
                    <TableCell align="right">
                      ${purchase.total.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* New Purchase Dialog */}
      <Dialog 
        open={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Nueva Compra</DialogTitle>
        <DialogContent>
          <div style={{ display: 'grid', gap: '1rem', paddingTop: '1rem' }}>
            <FormControl fullWidth>
              <InputLabel>Proveedor</InputLabel>
              <Select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
                label="Proveedor"
              >
                {providers.map((provider) => (
                  <MenuItem
                    key={provider.idproveedor}
                    value={provider.idproveedor.toString()}
                  >
                    {provider.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <Typography variant="h6">Productos</Typography>
                <Button
                  startIcon={<AddIcon />}
                  onClick={handleAddProduct}
                  variant="outlined"
                >
                  Agregar Producto
                </Button>
              </div>

              {purchaseProducts.map((product, index) => (
                <div key={index} style={{ display: 'grid', gridTemplateColumns: '5fr 2fr 3fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <FormControl fullWidth>
                    <InputLabel>Producto</InputLabel>
                    <Select
                      value={product.idproducto}
                      onChange={(e) => handleProductChange(index, 'idproducto', e.target.value)}
                      label="Producto"
                    >
                      {products.map((p) => (
                        <MenuItem
                          key={p.idproducto}
                          value={p.idproducto.toString()}
                        >
                          {p.nombre}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    type="number"
                    label="Cantidad"
                    value={product.cantidad}
                    onChange={(e) => handleProductChange(index, 'cantidad', parseInt(e.target.value))}
                    InputProps={{ inputProps: { min: 1 } }}
                  />
                  <TextField
                    type="number"
                    label="Precio unitario"
                    value={product.precio_unitario}
                    onChange={(e) => handleProductChange(index, 'precio_unitario', parseFloat(e.target.value))}
                    InputProps={{ inputProps: { step: "0.01" } }}
                  />
                  {purchaseProducts.length > 1 && (
                    <IconButton
                      onClick={() => handleRemoveProduct(index)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
              <Typography variant="h6">Total:</Typography>
              <Typography variant="h6">
                ${calculateTotal().toFixed(2)}
              </Typography>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
              <Button
                variant="outlined"
                onClick={() => {
                  setIsDialogOpen(false);
                  resetForm();
                }}
              >
                Cancelar
              </Button>
              <Button
                variant="contained"
                onClick={handleCreatePurchase}
                disabled={!selectedProvider || purchaseProducts.some(p => !p.idproducto)}
              >
                Crear Compra
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Product Details Dialog */}
      <Dialog
        open={productDetailsDialog.open}
        onClose={() => setProductDetailsDialog({ open: false, products: [] })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Productos de la Compra</DialogTitle>
        <DialogContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Producto</TableCell>
                  <TableCell>Cantidad</TableCell>
                  <TableCell>Precio Unit.</TableCell>
                  <TableCell align="right">Subtotal</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {productDetailsDialog.products.map((product) => (
                  <TableRow key={product.idproducto}>
                    <TableCell>{product.nombre}</TableCell>
                    <TableCell>{product.cantidad}</TableCell>
                    <TableCell>${product.precio_unitario.toFixed(2)}</TableCell>
                    <TableCell align="right">
                      ${product.subtotal.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}