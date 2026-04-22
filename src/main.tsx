import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

console.log('main.tsx executing');
const root = document.getElementById('root');
console.log('root element:', root);
createRoot(root!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
