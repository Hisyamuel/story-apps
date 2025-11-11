import ApiService from '../../data/api';
import AuthService from '../../utils/auth-service';
import Utils from '../../utils/index';
import NotificationHelper from '../../utils/notification-helper';

// Bagian ini adalah halaman login untuk aplikasi.
const LoginPage = {
  async render() {
    return `
      <div class="auth-container">
        <h1>Login Akun</h1>
        <form id="login-form">
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" class="form-control" required>
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" class="form-control" required minlength="8">
          </div>
          
          <button type="submit" id="submit-button" class="btn btn-primary" style="width: 100%;">
            Login
          </button>
          
        </form>
        <div class="redirect-link">
          <p>Belum punya akun? <a href="#/register" style="color: #FFD600;">Daftar di sini</a></p>
        </div>
        <div id="error-message" class="form-error" style="text-align: center; margin-top: 1rem;"></div>
      </div>
    `;
  },

  // Menangani logika setelah halaman dirender
  async afterRender() {
    const loginForm = document.querySelector('#login-form');
    const emailInput = document.querySelector('#email');
    const passwordInput = document.querySelector('#password');
    const errorMessageElement = document.querySelector('#error-message');

    // Menangkap tombol submit
    const submitButton = document.querySelector('#submit-button');

    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      Utils.clearError(errorMessageElement);

      // Menampilkan loading dan menonaktifkan tombol
      submitButton.classList.add('loading');
      submitButton.disabled = true;

      const email = emailInput.value;
      const password = passwordInput.value;

      try {
        const response = await ApiService.login({ email, password });

        if (response.error) {
          throw new Error(response.message);
        }

        AuthService.saveToken(response.loginResult.token);

        await NotificationHelper.requestPermission();
        await NotificationHelper._subscribeToPush();

        document.querySelector('app-bar').render();
        window.location.hash = '#/home';

        // Jika sukses, akan pindah halaman. Jadi tidak perlu menghapus status loading.

      } catch (error) {
        errorMessageElement.textContent = `Login Gagal: ${error.message}`;

        // Menghentikan loading dan mengaktifkan tombol jika gagal
        submitButton.classList.remove('loading');
        submitButton.disabled = false;
      }
    });
  },
};

export default LoginPage;
