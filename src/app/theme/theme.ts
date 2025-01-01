import { createTheme } from "@mui/material";

const theme = createTheme({
    palette: {
        primary:{
            main: '#1976d2',
            light: '#42a5f5',
            dark: '#1565c0',
            contrastText: '#fff',
        },
        secondary: {
            main: '#dc004e'
            
        }
    },
    typography: {
        fontFamily: 'Roboto, Arial, sans-serif',
    },

});

export default theme;