import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css'; // <-- ADD THIS LINE

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);