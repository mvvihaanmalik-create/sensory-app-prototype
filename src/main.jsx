import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles.css';
import './micro.css';
if (import.meta.env.MODE === 'phone') document.documentElement.classList.add('phone');
// iOS Safari only applies :active styles when a touch listener exists
document.addEventListener('touchstart', () => {}, { passive: true });
createRoot(document.getElementById('root')).render(<App />);
