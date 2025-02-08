'use client';

import React, { useState, useEffect, useCallback } from 'react';
import debounce from 'lodash/debounce';
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  IconButton,
  Box
} from '@mui/material';
import { Add, Edit, Delete, Restore, DeleteForever } from '@mui/icons-material';
import ClientLayout from "@/components/layouts/ClientLayout";

interface Category {
  idcategoria: number;
  nombre: string;
  descripcion: string;
}

interface CategoryValidationError {
  field: string;
  message: string;
}

const validateCategory = (
  values: {
    nombre: string;
    descripcion: string;
  },
  categories: Category[],
  selectedCategory: Category | null
): CategoryValidationError[] => {
  const errors: CategoryValidationError[] = [];

  if (!values.nombre.trim()) {
    errors.push({ field: 'nombre', message: 'El nombre es requerido.' });
  } else {
    if (values.nombre.trim().length < 3) {
      errors.push({ field: 'nombre', message: 'El nombre debe tener al menos 3 caracteres.' });
    }
    if (values.nombre.length > 50) {
      errors.push({ field: 'nombre', message: 'El nombre no puede exceder 50 caracteres.' });
    }
    if (!/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]*$/.test(values.nombre)) {
      errors.push({ field: 'nombre', message: 'El nombre solo puede contener letras, números y espacios.' });
    }
    const isDuplicate = categories.some(
      c => c.nombre.toLowerCase() === values.nombre.toLowerCase() && 
      (!selectedCategory || c.idcategoria !== selectedCategory.idcategoria)
    );
    if (isDuplicate) {
      errors.push({ field: 'nombre', message: 'El nombre de esta categoría ya existe.' });
    }
  }

  if (values.descripcion.trim()) {
    if (values.descripcion.length > 200) {
      errors.push({ field: 'descripcion', message: 'La descripción no puede exceder 200 caracteres.' });
    }
    if (!/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.,]*$/.test(values.descripcion)) {
      errors.push({ field: 'descripcion', message: 'La descripción solo puede contener letras, números, espacios y puntuación básica.' });
    }
  }

  return errors;
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState<Omit<Category, 'idcategoria'>>({
    nombre: '',
    descripcion: '',
  });
  const [formErrors, setFormErrors] = useState<CategoryValidationError[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDisabled, setShowDisabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const fetchCategories = useCallback(debounce(async (query: string) => {
    try {
      setIsLoading(true);
      const endpoint = showDisabled ? `/api/categories/disabled?q=${query}` : `/api/categories?q=${query}`;
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        setError('No se pudieron cargar las categorías.');
        setCategories([]);
        return;
      }
      
      const data = await response.json();
      
      if (data.length === 0 && showDisabled) {
        // En lugar de cambiar automáticamente a las categorías habilitadas,
        // simplemente mostramos que no hay categorías inhabilitadas
        setCategories([]);
        setError('No hay categorías inhabilitadas para mostrar.');
      } else {
        setCategories(data);
        setError(null);
      }
    } catch {
      setError('No se pudieron cargar las categorías.');
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  }, 300), [showDisabled]);

  useEffect(() => {
    fetchCategories(searchTerm);
    return () => fetchCategories.cancel();
  }, [searchTerm, showDisabled]);

  const handleOpen = () => {
    setOpen(true);
    setFormErrors([]);
  };

  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewCategory(prev => ({ ...prev, [name]: value }));
    setFormErrors(prev => prev.filter(error => error.field !== name));
  };

  const resetForm = () => {
    setNewCategory({
      nombre: '',
      descripcion: '',
    });
    setFormErrors([]);
    setSelectedCategory(null);
    setIsSubmitting(false);
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setNewCategory({
      nombre: category.nombre,
      descripcion: category.descripcion,
    });
    setFormErrors([]);
    setOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro de que quieres inhabilitar esta categoría?')) {
      return;
    }

    try {
      const response = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        setError('No se pudo inhabilitar la categoría.');
        return;
      }
      setCategories(prev => prev.filter(category => category.idcategoria !== id));
    } catch {
      setError('No se pudo inhabilitar la categoría.');
    }
  };

  const handleRestore = async (id: number) => {
    if (!window.confirm('¿Está seguro de restaurar esta categoría?')) return;

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type: 'restore' })
      });

      if (!response.ok) {
        setError('No se pudo restaurar la categoría.');
        return;
      }
      
      await fetchCategories(searchTerm);
    } catch {
      setError('No se pudo restaurar la categoría.');
    }
  };

  const handleDeletePermanently = async (id: number) => {
    if (!window.confirm('¿Está seguro de eliminar esta categoría permanentemente? Esta acción no se puede deshacer.')) return;

    try {
      const response = await fetch(`/api/categories/${id}?type=physical`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        setError('No se pudo eliminar la categoría.');
        return;
      }
      
      await fetchCategories(searchTerm);
    } catch {
      setError('No se pudo eliminar la categoría.');
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const errors = validateCategory(newCategory, categories, selectedCategory);
      setFormErrors(errors);

      if (errors.length > 0) {
        setIsSubmitting(false);
        return;
      }

      const url = selectedCategory 
        ? `/api/categories/${selectedCategory.idcategoria}`
        : '/api/categories';
      
      const method = selectedCategory ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newCategory,
          ...(selectedCategory && { idcategoria: selectedCategory.idcategoria })
        }),
      });

      if (!response.ok) {
        setError('No se pudo guardar la categoría.');
        return;
      }

      const updatedCategory = await response.json();

      if (selectedCategory) {
        setCategories(prevCategories => 
          prevCategories.map(category => 
            category.idcategoria === selectedCategory.idcategoria 
              ? { ...category, ...updatedCategory }
              : category
          )
        );
      } else {
        setCategories(prevCategories => [...prevCategories, updatedCategory]);
      }

      handleClose();
      await fetchCategories(searchTerm);
    } catch {
      setError('No se pudo guardar la categoría.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFieldError = (fieldName: string) => {
    return formErrors.find(error => error.field === fieldName)?.message;
  };

  const toggleView = () => {
    setShowDisabled(!showDisabled);
  };

  return (
    <ClientLayout>
      <Container>
        <Typography variant="h4" gutterBottom>
          {showDisabled ? 'Categorías Inhabilitadas' : 'Gestión de categorías de producto'}
        </Typography>
        <TextField 
          label="Buscar categoría..." 
          fullWidth 
          variant="outlined"
          margin="normal"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <Button variant="outlined" color="primary" onClick={toggleView}>
            {showDisabled ? 'Ver Habilitadas' : 'Ver Inhabilitadas'}
          </Button>
          {!showDisabled && (
            <Button variant="contained" startIcon={<Add />} onClick={handleOpen}>
              Añadir Categoría
            </Button>
          )}
        </div>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {isLoading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <Typography>Cargando...</Typography>
          </Box>
        ) : categories.length === 0 ? (
          <Box display="flex" justifyContent="center" my={4}>
            <Typography variant="h6" color="textSecondary">
              {showDisabled 
                ? 'No hay categorías inhabilitadas' 
                : 'No hay categorías disponibles'}
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
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={`category-${category.idcategoria}`}>
                    <TableCell>{category.idcategoria}</TableCell>
                    <TableCell>{category.nombre}</TableCell>
                    <TableCell>{category.descripcion}</TableCell>
                    <TableCell>
                      {!showDisabled ? (
                        <>
                          <IconButton 
                            color="primary" 
                            onClick={() => handleEdit(category)}
                          >
                            <Edit />
                          </IconButton>
                          <IconButton 
                            color="error" 
                            onClick={() => handleDelete(category.idcategoria)}
                          >
                            <Delete />
                          </IconButton>
                        </>
                      ) : (
                        <>
                          <IconButton 
                            color="primary" 
                            onClick={() => handleRestore(category.idcategoria)}
                            title="Restaurar Categoría"
                          >
                            <Restore />
                          </IconButton>
                          <IconButton 
                            color="error" 
                            onClick={() => handleDeletePermanently(category.idcategoria)}
                            title="Eliminar Permanentemente"
                          >
                            <DeleteForever />
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
            {selectedCategory ? 'Editar Categoría' : 'Añadir Categoría'}
          </DialogTitle>
          <DialogContent>
            {formErrors.length > 0 && (
              <Alert severity="error" sx={{ mb: 2 }}>
                Por favor, corrige los errores en el formulario.
              </Alert>
            )}
            <TextField
              label="Nombre"
              name="nombre"
              fullWidth
              margin="dense"
              value={newCategory.nombre}
              onChange={handleChange}
              required
              error={!!getFieldError('nombre')}
              helperText={getFieldError('nombre')}
            />
            <TextField
              label="Descripción"
              name="descripcion"
              fullWidth
              margin="dense"
              value={newCategory.descripcion}
              onChange={handleChange}
              error={!!getFieldError('descripcion')}
              helperText={getFieldError('descripcion')}
              multiline
              rows={3}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit} 
              variant="contained"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </ClientLayout>
  );
}