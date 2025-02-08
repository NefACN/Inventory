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
  Box,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
  AlertColor
} from '@mui/material';
import { Add, Edit, Delete, Restore, DeleteForever } from '@mui/icons-material';
import ClientLayout from "@/components/layouts/ClientLayout";

interface Supplier {
  idproveedor: number;
  nombre: string;
  contacto: string;
  telefono: string;
  direccion: string;
}

interface SnackbarMessage {
  message: string;
  severity: AlertColor;
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [newSupplier, setNewSupplier] = useState<Omit<Supplier, 'idproveedor'>>({
    nombre: '',    
    contacto: '',
    telefono: '',
    direccion: '',
  });
  const [showDisabled, setShowDisabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Partial<Supplier> | null>(null);
  const [snackbar, setSnackbar] = useState<SnackbarMessage | null>(null);

  const handleSnackbarClose = () => {
    setSnackbar(null);
  };

  const showMessage = (message: string, severity: AlertColor) => {
    setSnackbar({ message, severity });
  };

  const fetchSuppliers = useCallback(
    debounce(async (query: string) => {
      setIsLoading(true);
      const endpoint = showDisabled 
        ? `/api/suppliers/disabled?q=${query}` 
        : `/api/suppliers?q=${query}`;
      
      try {
        const res = await fetch(endpoint);
        if (!res.ok) throw new Error('Error al cargar proveedores');
        const data: Supplier[] = await res.json(); 
        setSuppliers(data);
      } catch {
        showMessage('Error al cargar los proveedores', 'error');
      } finally {
        setIsLoading(false);
      }
    }, 300),
    [showDisabled]
  );

  useEffect(() => {
    fetchSuppliers(searchTerm);
    return () => fetchSuppliers.cancel();
  }, [searchTerm, fetchSuppliers]);

  const handleOpen = () => {
    setSelectedSupplier(null);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewSupplier(prev => ({
      ...prev, 
      [name]: value || ''  
    }));
  };

  const resetForm = () => {
    setNewSupplier({
      nombre: '',
      contacto: '',
      telefono: '',
      direccion: '',
    });
    setSelectedSupplier(null);
  };

  const handleEdit = (supplier: Supplier) => {
    setNewSupplier({
      nombre: supplier.nombre || '',
      contacto: supplier.contacto || '',
      telefono: supplier.telefono || '',
      direccion: supplier.direccion || '',
    });
    setSelectedSupplier(supplier);
    setOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/suppliers/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error();

      setSuppliers((prev) => prev.filter((supplier) => supplier.idproveedor !== id));
      showMessage('Proveedor eliminado correctamente', 'success');
    } catch {
      showMessage('Error al eliminar el proveedor', 'error');
    }
  };

  const handleRestore = async (id: number) => {
    try {
      const response = await fetch(`/api/suppliers/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'restore' }),
      });

      if (!response.ok) throw new Error();
      
      setSuppliers((prev) => prev.filter((supplier) => supplier.idproveedor !== id));
      showMessage('Proveedor restaurado correctamente', 'success');
    } catch {
      showMessage('Error al restaurar el proveedor', 'error');
    }
  };

  const handleDeletePermanently = async (id: number) => {
    try {
      const response = await fetch(`/api/suppliers/${id}?type=physical`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error();

      showMessage('Proveedor eliminado permanentemente', 'success');
      fetchSuppliers(searchTerm);
    } catch {
      showMessage('Error al eliminar el proveedor', 'error');
    }
  };

  const handleSubmit = async () => { 
    const trimmedSupplier = {
      nombre: newSupplier.nombre.trim(),
      contacto: newSupplier.contacto.trim(),
      telefono: newSupplier.telefono.trim(),
      direccion: newSupplier.direccion.trim()
    };

    if (!trimmedSupplier.nombre) {
      showMessage('El nombre del proveedor es obligatorio', 'error');
      return;
    }

    const isDuplicate = suppliers.some(
      supplier => 
        supplier.nombre.toLowerCase().trim() === trimmedSupplier.nombre.toLowerCase() && 
        supplier.idproveedor !== selectedSupplier?.idproveedor
    );

    if (isDuplicate) {
      showMessage('El proveedor ya existe', 'error');
      return;
    }

    try {
      if (selectedSupplier) {
        const response = await fetch(`/api/suppliers/${selectedSupplier.idproveedor}`, {
          method: 'PUT',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(trimmedSupplier),
        });
  
        if (response.ok) {
          const updatedSupplier = await response.json();
          setSuppliers(prev =>
            prev.map((p) => p.idproveedor === updatedSupplier.idproveedor ? updatedSupplier : p)
          );
          showMessage('Proveedor actualizado correctamente', 'success');
          handleClose();
        } else {
          const errorData = await response.json();
          showMessage(errorData.message || 'Error al actualizar proveedor', 'error');
        }
      } else {
        const response = await fetch('/api/suppliers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(trimmedSupplier),
        });
  
        if (response.ok) {
          const addedSupplier = await response.json();
          setSuppliers((prev) => [...prev, addedSupplier]);
          showMessage('Proveedor agregado correctamente', 'success');
          handleClose();
        } else {
          const errorData = await response.json();
          showMessage(errorData.message || 'Error al agregar proveedor', 'error');
        }
      }
    } catch {
      showMessage('Ocurrió un error inesperado', 'error');
    }
  };

  const toggleView = () => {
    setShowDisabled((prev) => !prev);
    setSuppliers([]); 
    setSearchTerm(''); 
  };

  return (
    <ClientLayout>
      <Container>
        <Typography variant="h4" gutterBottom>
          Gestión de proveedores
        </Typography>
        <TextField 
          label="Buscar proveedor..." 
          fullWidth 
          variant="outlined"
          margin="normal"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Button variant="outlined" color="primary" onClick={toggleView}>
            {showDisabled ? 'Ver Habilitados' : 'Ver Inhabilitados'}
          </Button>
          {!showDisabled && (
            <Button variant="contained" startIcon={<Add />} onClick={handleOpen}>
              Añadir Proveedor
            </Button>
          )}
        </Box>

        {isLoading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : suppliers.length === 0 ? (
          <Box display="flex" justifyContent="center" my={4}>
            <Typography variant="h6" color="textSecondary">
              {showDisabled 
                ? 'No hay proveedores inhabilitados' 
                : 'No hay proveedores disponibles'}
            </Typography>
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Contacto</TableCell>
                  <TableCell>Teléfono</TableCell>
                  <TableCell>Dirección</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {suppliers.map((supplier) => (
                  <TableRow key={supplier.idproveedor}>
                    <TableCell>{supplier.idproveedor}</TableCell>
                    <TableCell>{supplier.nombre}</TableCell>
                    <TableCell>{supplier.contacto}</TableCell>
                    <TableCell>{supplier.telefono}</TableCell>
                    <TableCell>{supplier.direccion}</TableCell>
                    <TableCell>
                      {!showDisabled ? (
                        <>
                          <IconButton 
                            color="primary" 
                            onClick={() => handleEdit(supplier)}
                          >
                            <Edit />
                          </IconButton>
                          <IconButton 
                            color="error" 
                            onClick={() => handleDelete(supplier.idproveedor)}
                          >
                            <Delete />
                          </IconButton>
                        </>
                      ) : (
                        <>
                          <IconButton 
                            color="primary" 
                            onClick={() => handleRestore(supplier.idproveedor)}
                            title="Restaurar Proveedor"
                          >
                            <Restore />
                          </IconButton>
                          <IconButton 
                            color="error" 
                            onClick={() => handleDeletePermanently(supplier.idproveedor)}
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
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>
            {selectedSupplier ? 'Editar Proveedor' : 'Añadir Proveedor'}
          </DialogTitle>
          <DialogContent>
            <TextField
              label="Nombre"
              name="nombre"
              fullWidth
              margin="dense"
              value={newSupplier.nombre}
              onChange={handleChange}
              required
            />
            <TextField
              label="Contacto"
              name="contacto"
              fullWidth
              margin="dense"
              value={newSupplier.contacto}
              onChange={handleChange}
            />
            <TextField
              label="Teléfono"
              name="telefono"
              fullWidth
              margin="dense"
              value={newSupplier.telefono}
              onChange={handleChange}
            />
            <TextField
              label="Dirección"
              name="direccion"
              fullWidth
              margin="dense"
              value={newSupplier.direccion}
              onChange={handleChange}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancelar</Button>
            <Button onClick={handleSubmit} variant="contained">
              {selectedSupplier ? 'Actualizar' : 'Guardar'}
            </Button>
          </DialogActions>
        </Dialog>

        {snackbar && (
          <Snackbar 
            open={true}
            autoHideDuration={6000} 
            onClose={handleSnackbarClose}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <Alert 
              onClose={handleSnackbarClose} 
              severity={snackbar.severity}
              sx={{ width: '100%' }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        )}
      </Container>
    </ClientLayout>
  );
}