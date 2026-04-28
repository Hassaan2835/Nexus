import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

console.log('main.tsx executing');

// Load theme preference on startup
if (localStorage.getItem('theme') === 'dark') {
  document.documentElement.classList.add('dark-theme');
}

const root = document.getElementById('root');
console.log('root element:', root);
createRoot(root!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
