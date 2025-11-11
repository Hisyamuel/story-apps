import Config from '../config';
import AuthService from '../utils/auth-service';

// Layanan API untuk registrasi, login, mendapatkan cerita, dan mengirim cerita
const ApiService = {
  async register({ name, email, password }) {
    const response = await fetch(`${Config.BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });
    return response.json();
  },

  // Fungsi login mengembalikan token yang akan disimpan oleh AuthService
  async login({ email, password }) {
    const response = await fetch(`${Config.BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },

  // Mendapatkan cerita dengan lokasi
  async getStories() {
    const token = AuthService.getToken();
    if (!token) {
      return Promise.reject(new Error('User not authenticated'));
    }

    const response = await fetch(`${Config.BASE_URL}/stories?location=1`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  // Mengirim cerita dengan foto dan lokasi serta error handling
  async postStory(formData) {
    const token = AuthService.getToken();
    if (!token) {
      return Promise.reject(new Error('User not authenticated'));
    }

    const response = await fetch(`${Config.BASE_URL}/stories`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    return response.json();
  },

  // Fungsi untuk push notification
  async subscribePush(subscription) {
    const token = AuthService.getToken();
    if (!token) {
      return Promise.reject(new Error('User not authenticated'));
    }

    const response = await fetch(`${Config.BASE_URL}/notifications/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(subscription),
    });
    return response.json();
  },
};

export default ApiService;