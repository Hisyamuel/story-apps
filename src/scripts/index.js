import App from '../scripts/pages/app';
import NotificationHelper from './utils/notification-helper'; 

const app = new App({
  header: document.querySelector('.app-bar'),
  content: document.querySelector('#main-content'),
});

window.addEventListener('hashchange', () => {
  app.renderPage();
});

window.addEventListener('load', async () => { 
  app.renderPage();

  // Registrasi Service Worker
  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker berhasil didaftarkan.');

      setTimeout(() => {
        NotificationHelper.requestPermission();
      }, 3000); 

    } catch (error) {
      console.error('Gagal mendaftarkan Service Worker:', error);
    }
  }
});