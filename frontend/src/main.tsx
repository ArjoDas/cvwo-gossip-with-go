import { StrictMode } from 'react';            // for code-checking during development 
import { createRoot } from 'react-dom/client'; // initialises concurrent rendering engine
import './index.css';
import App from './App.tsx';
import { ThemeProvider } from './context/ThemeContext';

// injects react code into the root html element
// ! tells compiler that getElementById won't return null
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
);
