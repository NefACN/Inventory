'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Fab,
  CircularProgress
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

type Product = {
  idproducto: number;
  nombre: string;
  descripcion: string;
  preciocompra: number;
  precioventa: number;
  stock: number;
  fechaingreso: string;
  idcategoria: number;
  idproveedor: number;
  categoria?: string;
  proveedor?: string;
};

type Category = {
  idcategoria: number;
  nombre: string;
};

type Provider = {
  idproveedor: number;
  nombre: string;
};

const ProductTable = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const initialFormState = {
    nombre: '',
    descripcion: '',
    preciocompra: '',
    precioventa: '',
    stock: '',
    idcategoria: '',
    idproveedor: '',
    fechaingreso: new Date().toISOString().split('T')[0]
  };

  const [formValues, setFormValues] = useState(initialFormState);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error fetching products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProviders = async () => {
    try {
      const response = await fetch('/api/suppliers');
      if (!response.ok) throw new Error('Failed to fetch providers');
      const data = await response.json();
      setProviders(data);
    } catch (error) {
      console.error('Error fetching providers:', error);
    }
  };

  const fetchProductById = async (id: number) => {
    try {
      const response = await fetch(`/api/products/${id}`);
      if (!response.ok) throw new Error('Failed to fetch product');
      const product = await response.json();
      setSelectedProduct(product);
      
      // Safely handle potentially null values
      setFormValues({
        nombre: product.nombre || '',
        descripcion: product.descripcion || '',
        preciocompra: product.preciocompra?.toString() || '0',
        precioventa: product.precioventa?.toString() || '0',
        stock: product.stock?.toString() || '0',
        idcategoria: product.idcategoria?.toString() || '',
        idproveedor: product.idproveedor?.toString() || '',
        fechaingreso: product.fechaingreso || new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      console.error('Error fetching product:', error);
      alert('Error al cargar el producto. Por favor, intente nuevamente.');
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchProviders();
  }, []);

  const handleOpen = (product?: Product) => {
    if (product) {
      fetchProductById(product.idproducto);
    } else {
      setSelectedProduct(null);
      setFormValues(initialFormState);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedProduct(null);
    setFormValues(initialFormState);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target as HTMLInputElement;
    setFormValues(prev => ({
      ...prev,
      [name as string]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        ...formValues,
        preciocompra: parseFloat(formValues.preciocompra),
        precioventa: parseFloat(formValues.precioventa),
        stock: parseInt(formValues.stock),
        idcategoria: parseInt(formValues.idcategoria),
        idproveedor: parseInt(formValues.idproveedor)
      };

      const url = selectedProduct 
        ? `/api/products/${selectedProduct.idproducto}`
        : '/api/products';
      
      const response = await fetch(url, {
        method: selectedProduct ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(selectedProduct 
          ? 'Error al actualizar el producto'
          : 'Error al crear el producto'
        );
      }

      await fetchProducts();
      handleClose();
    } catch (error) {
      console.error('Error:', error);
      alert(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Está seguro de eliminar este producto?')) return;

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Error al eliminar el producto');
      await fetchProducts();
    } catch (error) {
      console.error('Error:', error);
      alert(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <Typography color="error">{error}</Typography>
      </div>
    );
  }

  return (
    <Container>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <Typography variant="h4">Productos</Typography>
        <Fab 
          color="primary" 
          onClick={() => handleOpen()}
          style={{ backgroundColor: '#1976d2' }}
        >
          <AddIcon />
        </Fab>
      </div>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Precio Compra</TableCell>
              <TableCell>Precio Venta</TableCell>
              <TableCell>Stock</TableCell>
              <TableCell>Categoría</TableCell>
              <TableCell>Proveedor</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.idproducto}>
                <TableCell>{product.idproducto}</TableCell>
                <TableCell>{product.nombre}</TableCell>
                <TableCell>{product.descripcion}</TableCell>
                <TableCell>${Number(product.preciocompra).toFixed(2)}</TableCell>
                <TableCell>${Number(product.precioventa).toFixed(2)}</TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell>{product.categoria}</TableCell>
                <TableCell>{product.proveedor}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpen(product)} color="primary">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(product.idproducto)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog 
        open={open} 
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedProduct ? 'Editar Producto' : 'Nuevo Producto'}
        </DialogTitle>
        <DialogContent>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
            <TextField
              label="Nombre"
              name="nombre"
              value={formValues.nombre}
              onChange={handleChange}
              fullWidth
              required
            />
            <TextField
              label="Descripción"
              name="descripcion"
              value={formValues.descripcion}
              onChange={handleChange}
              fullWidth
              multiline
              rows={3}
            />
            <TextField
              label="Precio Compra"
              name="preciocompra"
              type="number"
              value={formValues.preciocompra}
              onChange={handleChange}
              fullWidth
              required
            />
            <TextField
              label="Precio Venta"
              name="precioventa"
              type="number"
              value={formValues.precioventa}
              onChange={handleChange}
              fullWidth
              required
            />
            <TextField
              label="Stock"
              name="stock"
              type="number"
              value={formValues.stock}
              onChange={handleChange}
              fullWidth
              required
            />
            <FormControl fullWidth>
              <InputLabel>Categoría</InputLabel>
              <Select
                name="idcategoria"
                value={formValues.idcategoria}
                onChange={handleChange}
                required
              >
                {categories.map((category) => (
                  <MenuItem key={category.idcategoria} value={category.idcategoria}>
                    {category.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Proveedor</InputLabel>
              <Select
                name="idproveedor"
                value={formValues.idproveedor}
                onChange={handleChange}
                required
              >
                {providers.map((provider) => (
                  <MenuItem key={provider.idproveedor} value={provider.idproveedor}>
                    {provider.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="inherit">
            Cancelar
          </Button>
          <Button onClick={handleSubmit} color="primary" variant="contained">
            {selectedProduct ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProductTable;