import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';

// Importamos los estilos globales aquí para que apliquen a toda la app
import './styles/theme.css';
import './styles/spatial.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);