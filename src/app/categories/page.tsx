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

interface Category {
  idcategoria: number;
  nombre: string;
  descripcion: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);
  const [newCategory, setNewCategory] = useState<Omit<Category, 'idcategoria'>>({
    nombre: '',
    descripcion: '',
  });

  // Listar productos
  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data));
  }, []);

  // Handle Dialog Open/Close
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  // Handle Form Change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewCategory({ ...newCategory, [e.target.name]: e.target.value });
  };

  //resert form
  const resetForm= () =>{
    setNewCategory({
      nombre: '',
      descripcion: '',
    });
  };

  //validation form
  const isFormValid = () => {
    return(
      newCategory.nombre
    );
  };


  //------------Edit form-------------------
  const [selectedCategory, setSelectedCategory] = useState<Partial<Category> | null>(null);

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setNewCategory(category);
    setOpen(true);
  }

  //---------DELETE PRODUCTO --------------------
  const handleDelete = async (id: number) => {
    if(!window.confirm("Estas seguro de que quieres eliminar esta categoria?")){
      return;
    }
    const response = await fetch(`/api/categories/${id}`, {method: "DELETE"});

    if(response.ok){
      setCategories(categories.filter((category) => category.idcategoria !== id));
      alert("La categoria fue eliminado correctamente.");
    }
    else{
      alert("Error al eliminar categoria.");
    }
  };

  // Handle Product Submit
  const handleSubmit = async () => { 
    if(selectedCategory){
      //----------------Update product-----------------
      const response = await fetch(`/api/categories/${selectedCategory!.idcategoria}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json' },
        body: JSON.stringify(newCategory),
      });

      if(response.ok){
        const updateCategory = await response.json();
        setCategories(
          categories.map((p) =>
            p.idcategoria === updateCategory.idcategoria ? updateCategory: p
          )
        );
        setSelectedCategory(null);
      }
    }else{
      if (!isFormValid()){
        alert('Por favor ingrese los datos correspondientes en el formulario.');
        return;
      }
      
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCategory),
      });
      if (response.ok) {
        const addedCategory = await response.json();
        setCategories((prevCategories) => [...prevCategories, addedCategory]);
        handleClose();
      }else{
        alert('Error al agregar la categoria, intentelo nuevamente.');
      }
    }
    handleClose();
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Gestión de categorias de producto
      </Typography>
      <Button variant="contained" startIcon={<Add />} onClick={handleOpen}>
        Añadir Categoria
      </Button>
      <TableContainer component={Paper} sx={{ marginTop: 2 }}>
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
              <TableRow key={category.idcategoria}>
                <TableCell>{category.idcategoria}</TableCell>
                <TableCell>{category.nombre}</TableCell>
                <TableCell>{category.descripcion}</TableCell>
                <TableCell>
                  <Button color="primary" onClick={() => handleEdit(category)}>Editar</Button>
                  <Button color="error" onClick={() => handleDelete(category.idcategoria)}>Eliminar</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog for Adding a Product */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Añadir Categoria</DialogTitle>
        <DialogContent>
          <TextField
            label="Nombre"
            name="nombre"
            fullWidth
            margin="dense"
            value={newCategory.nombre}
            onChange={handleChange}
            required
          />
          <TextField
            label="Descripción"
            name="descripcion"
            fullWidth
            margin="dense"
            value={newCategory.descripcion}
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
