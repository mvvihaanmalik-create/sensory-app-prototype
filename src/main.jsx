import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles.css';
if (import.meta.env.MODE === 'phone') document.documentElement.classList.add('phone');
createRoot(document.getElementById('root')).render(<App />);
