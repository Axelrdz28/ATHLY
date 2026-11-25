import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { Rescue } from './components/Rescue';
import { requestPersistence } from './lib/store';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Rescue>
      <App />
    </Rescue>
  </StrictMode>,
);

requestPersistence();

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {});
  });
}
