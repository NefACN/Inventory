'use client';
import { Button, Typography } from '@mui/material';

export default function HomePage() {
  return (
    <div style={{ padding: '20px' }}>
      <Typography variant="h4" gutterBottom>
        Bienvenido a Material-UI con Next.js 13
      </Typography>
      <Button variant="contained" color="primary">
        Botón Primario
      </Button>
    </div>
  );
}