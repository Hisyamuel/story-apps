import ApiService from '../data/api'; 

const NotificationHelper = {
  // VAPID Key dari API Dicoding
  VAPID_PUBLIC_KEY: 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk',

  async requestPermission() {
    if (!('Notification' in window)) {
      console.error('Browser ini tidak mendukung notifikasi desktop.');
      return;
    }

    const status = await Notification.requestPermission();
    if (status === 'granted') {
      console.log('Izin notifikasi diberikan.');
      this._displayGrantedNotification()
    } else {
      console.log('Izin notifikasi ditolak.');
    }
  },

  _displayGrantedNotification() {
    const options = {
      body: 'Terima kasih telah mengaktifkan notifikasi!',
      icon: 'images/icons/icon-96x96.png',
    };
    navigator.serviceWorker.ready.then((registration) => {
      registration.showNotification('Notifikasi Diaktifkan', options);
    });
  },

  async _subscribeToPush() {
    if (!('PushManager' in window)) {
      console.error('Browser ini tidak mendukung Push Manager.');
      return;
    }

    const registration = await navigator.serviceWorker.ready;
    try {
      // Subscribe ke Push Manager browser
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this._urlBase64ToUint8Array(this.VAPID_PUBLIC_KEY),
      });

      // Mengkonversi subscription ke format JSON standar
      const subscriptionJson = subscription.toJSON();
      
      // payload bersih (HANYA 'endpoint' dan 'keys'). Ini untuk menghapus 'expirationTime' yang dibenci server
      const subscriptionPayload = {
        endpoint: subscriptionJson.endpoint,
        keys: subscriptionJson.keys,
      };
      console.log('Berhasil subscribe (payload bersih):', JSON.stringify(subscriptionPayload));

      // Mengirim payload yang sudah bersih ke server
      await ApiService.subscribePush(subscriptionPayload);

      console.log('Berhasil subscribe:', JSON.stringify(subscription));

      // Mengirim data subscription ke server API
      console.log('Berhasil mengirim subscription ke server.');

    } catch (error) {
      console.error('Gagal subscribe ke push:', error);
      // Jika gagal subscribe (misalnya, VAPID key salah), akan ditangani di sini
    }
  },

  _urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  },

  //Menampilkan notifikasi lokal (bukan dari server)
  showSuccessNotification(title, body) {
    const options = {
      body: body,
      icon: 'images/icons/icon-96x96.png',
    };
    if (navigator.serviceWorker.ready) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(title, options);
      });
    } else {
      // Fallback jika SW belum siap
      alert(`${title}\n${body}`);
    }
  },
};

export default NotificationHelper;