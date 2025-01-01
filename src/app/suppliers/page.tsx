'use client';

import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import { Add } from '@mui/icons-material';

interface Supplier {
  idproveedor: number;
  nombre: string;
  contacto: string;
  telefono: string;
  direccion: string;
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [open, setOpen] = useState(false);
  const [newSupplier, setNewSupplier] = useState<Omit<Supplier, 'idproveedor'>>({
    nombre: '',
    contacto: '',
    telefono: '',
    direccion: '',
  });

  // Listar proveedores
  useEffect(() => {
    fetch('/api/suppliers')
      .then((res) => res.json())
      .then((data) => setSuppliers(data));
  }, []);

  // Handle Dialog Open/Close
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  // Handle Form Change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewSupplier({ ...newSupplier, [e.target.name]: e.target.value });
  };

  //resert form
  const resetForm= () =>{
    setNewSupplier({
      nombre: '',
      contacto: '',
      telefono: '',
      direccion: '',
    });
  };

  //validation form
  const isFormValid = () => {
    return(
      newSupplier.nombre
    );
  };


  //------------Edit form-------------------
  const [selectedSupplier, setSelectedSupplier] = useState<Partial<Supplier> | null>(null);

  const handleEdit = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setNewSupplier(supplier);
    setOpen(true);
  }

  //---------DELETE PROVEEDORES --------------------
  const handleDelete = async (id: number) => {
    if(!window.confirm("Estas seguro de que quieres eliminar esta proveedor?")){
      return;
    }
    const response = await fetch(`/api/suppliers/${id}`, {method: "DELETE"});

    if(response.ok){
      setSuppliers(suppliers.filter((supplier) => supplier.idproveedor !== id));
      alert("El proveedor fue eliminado correctamente.");
    }
    else{
      alert("Error al eliminar proveedor.");
    }
  };

  // Handle Proveedor Submit
  const handleSubmit = async () => { 
    if(selectedSupplier){
      //----------------Update suppliers-----------------
      const response = await fetch(`/api/suppliers/${selectedSupplier!.idproveedor}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json' },
        body: JSON.stringify(newSupplier),
      });

      if(response.ok){
        const updateSupplier = await response.json();
        setSuppliers(
          suppliers.map((p) =>
            p.idproveedor === updateSupplier.idproveedor ? updateSupplier: p
          )
        );
        setSelectedSupplier(null);
      }
    }else{
      if (!isFormValid()){
        alert('Por favor ingrese los datos correspondientes en el formulario.');
        return;
      }
      
      const response = await fetch('/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSupplier),
      });
      if (response.ok) {
        const addedSupplier = await response.json();
        setSuppliers((prevSuppliers) => [...prevSuppliers, addedSupplier]);
        handleClose();
      }else{
        alert('Error al agregar proveedor, intentelo nuevamente.');
      }
    }
    handleClose();
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Gestión de proveedores
      </Typography>
      <Button variant="contained" startIcon={<Add />} onClick={handleOpen}>
        Añadir Proveedor
      </Button>
      <TableContainer component={Paper} sx={{ marginTop: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Contacto</TableCell>
              <TableCell>Telefono</TableCell>
              <TableCell>Direccion</TableCell>
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
                  <Button color="primary" onClick={() => handleEdit(supplier)}>Editar</Button>
                  <Button color="error" onClick={() => handleDelete(supplier.idproveedor)}>Eliminar</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog for Adding Suppliers */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Añadir Proveedor</DialogTitle>
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
            label="Telefono"
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
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
