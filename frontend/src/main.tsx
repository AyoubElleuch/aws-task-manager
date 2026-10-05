import { createRoot } from 'react-dom/client';
import App from './App';
import './style.css';
import './auth/config';

createRoot(document.getElementById('root')!).render(<App />);
