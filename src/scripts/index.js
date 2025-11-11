import App from '../scripts/pages/app';

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
    } catch (error) {
      console.error('Gagal mendaftarkan Service Worker:', error);
    }
  }
});