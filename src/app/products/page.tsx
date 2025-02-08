'use client';

import React, { useState, useEffect, useCallback } from 'react';
import debounce from 'lodash/debounce';
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
  FormHelperText,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Fab,
  CircularProgress,
  Box,
  SelectChangeEvent ,
  
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RestoreIcon from '@mui/icons-material/Restore';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import SearchIcon from '@mui/icons-material/Search'
import ClientLayout from "@/components/layouts/ClientLayout";

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
  estado: string;
};

type Category = {
  idcategoria: number;
  nombre: string;
};

type Provider = {
  idproveedor: number;
  nombre: string;
};

interface ProductValidationError {
  field: string;
  message: string;
}

const validateProduct = (
  values: {
    nombre: string;
    descripcion?: string;
    preciocompra: string | number;
    precioventa: string | number;
    stock: string | number;
    idcategoria: string | number;
    idproveedor: string | number;
  }, 
  products: Product[],
  selectedProduct: Product | null
): ProductValidationError[] => {
  const errors: ProductValidationError[] = [];
  
  // Validación de nombre
  if (!values.nombre.trim()) {
    errors.push({ field: 'nombre', message: 'El nombre es requerido' });
  } else {
    if (values.nombre.length > 50) {
      errors.push({ field: 'nombre', message: 'El nombre no puede exceder 50 caracteres' });
    }
 
    const isDuplicate = products.some(p => 
      p.nombre.toLowerCase() === values.nombre.trim().toLowerCase() &&
      (!selectedProduct || p.idproducto !== selectedProduct.idproducto)
    );
    if (isDuplicate) {
      errors.push({ field: 'nombre', message: 'Ya existe un producto con este nombre' });
    }
  }

  // Validación de precios
  const precioCompra = Number(values.preciocompra);
  const precioVenta = Number(values.precioventa);
  
  if (isNaN(precioCompra) || precioCompra <= 0) {
    errors.push({ field: 'preciocompra', message: 'El precio de compra debe ser mayor a 0' });
  } else if (precioCompra > 999999.99) {
    errors.push({ field: 'preciocompra', message: 'El precio de compra no puede exceder 999,999.99' });
  }

  if (isNaN(precioVenta) || precioVenta <= 0) {
    errors.push({ field: 'precioventa', message: 'El precio de venta debe ser mayor a 0' });
  } else if (precioVenta > 999999.99) {
    errors.push({ field: 'precioventa', message: 'El precio de venta no puede exceder 999,999.99' });
  }

  if (precioVenta < precioCompra) {
    errors.push({ field: 'precioventa', message: 'El precio de venta debe ser mayor o igual al precio de compra' });
  }

  // Validación de stock
  const stock = Number(values.stock);
  if (isNaN(stock) || !Number.isInteger(stock)) {
    errors.push({ field: 'stock', message: 'El stock debe ser un número entero' });
  } else if (stock < 0) {
    errors.push({ field: 'stock', message: 'El stock no puede ser negativo' });
  } else if (stock > 999999) {
    errors.push({ field: 'stock', message: 'El stock no puede exceder 999,999 unidades' });
  }

  // Validación de categoría y proveedor
  if (!values.idcategoria) {
    errors.push({ field: 'idcategoria', message: 'La categoría es requerida' });
  }
  
  if (!values.idproveedor) {
    errors.push({ field: 'idproveedor', message: 'El proveedor es requerido' });
  }

  return errors;
};

const ProductTable = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formErrors, setFormErrors] = useState<ProductValidationError[]>([]);
  const [showDisabled, setShowDisabled] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isSearching, setIsSearching] = useState(false);

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

  const getFieldError = (field: string) => {
    return formErrors.find(error => error.field === field)?.message || '';
  };

  const [formValues, setFormValues] = useState(initialFormState);

  const debouncedSearch = useCallback(
    debounce(async (term: string) => {
      try {
        setIsSearching(true);
        const endpoint = showDisabled 
          ? '/api/products/disabled' 
          : `/api/products?q=${encodeURIComponent(term)}`;
        
        const response = await fetch(endpoint);
        
        if (!response.ok) {
          if (showDisabled && response.status === 404) {
            setProducts([]);
            return;
          }
          throw new Error('Error al buscar productos');
        }
        
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Error searching products:', error);
        if (!showDisabled) {
          // Handle error
        }
        setProducts([]);
      } finally {
        setIsSearching(false);
      }
    }, 300), 
    [showDisabled]
  );

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const endpoint = showDisabled ? '/api/products/disabled' : '/api/products';
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        if (showDisabled && response.status === 404) {
          setProducts([]);
          setLoading(false);
          return;
        }
        throw new Error('Error al obtener productos');
      }
      
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      if (!showDisabled) {
        console.error(error);
      }
      setProducts([]);
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
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  useEffect(() => {
    if (!searchTerm) {
      fetchProducts();
    }
    fetchCategories();
    fetchProviders();
  }, [showDisabled, searchTerm]);

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
    setFormErrors([]);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }> | SelectChangeEvent) => {
    const { name, value } = e.target as { name: string; value: unknown };
  
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  
    setFormErrors((prev) => prev.filter((error) => error.field !== name));
  };

  const handleSubmit = async () => {
    try {
      const errors = validateProduct(formValues, products, selectedProduct);
      setFormErrors(errors);
      if (errors.length > 0) {
        return; 
      }
  
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
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al procesar la solicitud');
      }
  
      await fetchProducts();
      handleClose();
    }  catch (error) {
      console.error('Error:', error);
      alert(error instanceof Error ? error.message : 'Ha ocurrido un error');
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

  const handleDeletePermanently = async (id: number) => {
    if (!window.confirm('¿Está seguro de eliminar este producto permanentemente? Esta acción no se puede deshacer.')) return;

    try {
      const response = await fetch(`/api/products/${id}?type=physical`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Error al eliminar producto');
      await fetchProducts();
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : 'Error al eliminar producto');
    }
  };

  const handleRestore = async (id: number) => {
    if (!window.confirm('¿Está seguro de restaurar este producto?')) return;

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type: 'restore' })
      });

      if (!response.ok) throw new Error('Error al restaurar el producto');
      await fetchProducts();
    } catch (error) {
      console.error('Error:', error);
      alert(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = event.target.value;
    setSearchTerm(newSearchTerm);
    debouncedSearch(newSearchTerm);
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
    <ClientLayout>
    <Container>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <Typography variant="h4">
          {showDisabled ? 'Productos Inhabilitados' : 'Productos Habilitados'}
        </Typography>
        {!showDisabled && (
          <Fab 
            color="primary" 
            onClick={() => handleOpen()}
            style={{ backgroundColor: '#1976d2' }}
          >
            <AddIcon />
          </Fab>
        )}
      </div>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
          <Button 
            variant="outlined" 
            color="primary" 
            onClick={() => setShowDisabled(!showDisabled)}
          >
            {showDisabled ? 'Ver Habilitados' : 'Ver Inhabilitados'}
          </Button>

          <TextField
            placeholder="Buscar productos..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />,
              endAdornment: isSearching ? (
                <CircularProgress size={20} sx={{ mr: 1 }} />
              ) : null
            }}
            sx={{ minWidth: 300 }}
          />
        </Box>

      {products.length === 0 ? (
        <Box 
          display="flex" 
          justifyContent="center" 
          alignItems="center" 
          height="200px" 
          bgcolor="background.default" 
          borderRadius={2}
        >
          <Typography variant="h6" color="textSecondary">
            {showDisabled 
              ? 'No hay productos inhabilitados' 
              : 'No hay productos disponibles'}
          </Typography>
        </Box>
      ) : (
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
                  <TableCell>{Number(product.preciocompra).toFixed(2)} Bs</TableCell>
                  <TableCell>{Number(product.precioventa).toFixed(2)} Bs</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>{product.categoria}</TableCell>
                  <TableCell>{product.proveedor}</TableCell>
                  <TableCell>
                    {!showDisabled ? (
                      <>
                        <IconButton onClick={() => handleOpen(product)} color="primary">
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => handleDelete(product.idproducto)} color="error">
                          <DeleteIcon />
                        </IconButton>
                      </>
                    ) : (
                      <>
                        <IconButton 
                          onClick={() => handleRestore(product.idproducto)} 
                          color="primary"
                          title="Restaurar Producto"
                        >
                          <RestoreIcon />
                        </IconButton>
                        <IconButton 
                          onClick={() => handleDeletePermanently(product.idproducto)} 
                          color="error"
                          title="Eliminar Permanentemente"
                        >
                          <DeleteForeverIcon />
                        </IconButton>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
        </Table>
    </TableContainer>
    )}
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
              error={!!getFieldError('nombre')}
              helperText={getFieldError('nombre')}
            />
            <TextField
              label="Descripción"
              name="descripcion"
              value={formValues.descripcion}
              onChange={handleChange}
              fullWidth
              multiline
              rows={3}
              error={!!getFieldError('descripcion')}
              helperText={getFieldError('descripcion')}
            />
            <TextField
              label="Precio Compra"
              name="preciocompra"
              type="number"
              value={formValues.preciocompra}
              onChange={handleChange}
              fullWidth
              required
              error={!!getFieldError('preciocompra')}
              helperText={getFieldError('preciocompra')}
              inputProps={{ step: "0.01" }}
            />
            <TextField
              label="Precio Venta"
              name="precioventa"
              type="number"
              value={formValues.precioventa}
              onChange={handleChange}
              fullWidth
              required
              error={!!getFieldError('precioventa')}
              helperText={getFieldError('precioventa')}
              inputProps={{ step: "0.01" }}
            />
            <TextField
              label="Stock"
              name="stock"
              type="number"
              value={formValues.stock}
              onChange={handleChange}
              fullWidth
              required
              error={!!getFieldError('stock')}
              helperText={getFieldError('stock')}
              inputProps={{ step: "1" }}
            />
            <FormControl 
              fullWidth 
              error={!!getFieldError('idcategoria')}
            >
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
              {getFieldError('idcategoria') && (
                <FormHelperText error>
                  {getFieldError('idcategoria')}
                </FormHelperText>
              )}
            </FormControl>
            <FormControl 
              fullWidth
              error={!!getFieldError('idproveedor')}
            >
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
              {getFieldError('idproveedor') && (
                <FormHelperText error>
                  {getFieldError('idproveedor')}
                </FormHelperText>
              )}
            </FormControl>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="inherit">
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            color="primary" 
            variant="contained"
            disabled={formErrors.length > 0}
          >
            {selectedProduct ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
    </ClientLayout>
  );
};

export default ProductTable;