import ApiService from '../../data/api';
import AuthService from '../../utils/auth-service';
import Utils from '../../utils/index';
import NotificationHelper from '../../utils/notification-helper';

// Bagian ini adalah halaman untuk menambahkan cerita baru
const AddStoryPage = {
    async render() {
        return `
      <section class="add-story-container">
        <h1>Tambah Cerita Baru</h1>
        <form id="add-story-form">
          
          <div class="form-group">
            <label for="photo">Upload Foto (Wajib)</label>
            <input type="file" id="photo" class="form-control" accept="image/*" required>
            <img id="preview-image" src="#" alt="Pratinjau gambar yang diupload">
          </div>
          
          <div class="form-group">
            <label for="description">Deskripsi (Wajib)</label>
            <textarea id="description" class="form-control" rows="5" required></textarea>
          </div>
          
          <div class="form-group">
            <label>Pilih Lokasi (Wajib)</label>
            <p class="location-picker-info">Klik pada peta untuk memilih lokasi cerita Anda.</p>
            <div id="add-map"></div>
          </div>
          
          <input type="hidden" id="latitude" name="lat">
          <input type="hidden" id="longitude" name="lon">
          
          <div id="error-message" class="form-error" style="margin-bottom: 1rem;"></div>
          
          <button type="submit" id="submit-button" class="btn btn-primary" style="width: 100%;">
            Upload Cerita
          </button>
        </form>
      </section>
    `;
    },

    async afterRender() {
        // Kode pengecekan login
        if (!AuthService.isLoggedIn()) {
            window.location.hash = '#/login';
            return;
        }

        // Menginisialisasi Peta Leaflet
        const map = L.map('add-map').setView([-2.548926, 118.0148634], 5);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);

        let selectedMarker = null;
        const latInput = document.querySelector('#latitude');
        const lonInput = document.querySelector('#longitude');

        // Event klik di peta untuk memilih Latitude/Longitude
        map.on('click', (e) => {
            const { lat, lng } = e.latlng;
            latInput.value = lat;
            lonInput.value = lng;

            // Menghapus marker lama jika ada
            if (selectedMarker) {
                map.removeLayer(selectedMarker);
            }

            // Menambah marker baru di lokasi klik
            selectedMarker = L.marker([lat, lng]).addTo(map)
                .bindPopup('Lokasi cerita dipilih')
                .openPopup();

            Utils.clearError(document.querySelector('#add-map')); // Menghapus error jika ada
        });

        // Pratinjau Gambar
        const photoInput = document.querySelector('#photo');
        const previewImage = document.querySelector('#preview-image');
        photoInput.addEventListener('change', () => {
            Utils.clearError(photoInput);
            const file = photoInput.files[0];
            if (file) {
                previewImage.src = URL.createObjectURL(file);
                previewImage.style.display = 'block';
            }
        });

        // Tombol submit form
        const addStoryForm = document.querySelector('#add-story-form');
        const submitButton = document.querySelector('#submit-button');
        const errorMessageElement = document.querySelector('#error-message');

        addStoryForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            if (!this._validateForm()) return;

            // Menampilkan loading dan menonaktifkan tombol saat proses upload
            submitButton.classList.add('loading');
            submitButton.disabled = true;
            errorMessageElement.textContent = '';

            // Menyiapkan data form
            const formData = new FormData();

            formData.append('photo', document.querySelector('#photo').files[0]);
            formData.append('description', document.querySelector('#description').value);
            formData.append('lat', document.querySelector('#latitude').value);
            formData.append('lon', document.querySelector('#longitude').value);

            // Notifikasi upload story
            try {
                const response = await ApiService.postStory(formData);

                if (response.error) {
                    throw new Error(response.message);
                }

                NotificationHelper.showSuccessNotification(
                    'Upload Berhasil',
                    'Cerita baru Anda telah ditambahkan.'
                );

                window.location.hash = '#/home';

            } catch (error) {
                errorMessageElement.textContent = `Error: ${error.message}`;

                // Menghentikan loading dan mengaktifkan tombol jika gagal
                submitButton.classList.remove('loading');
                submitButton.disabled = false;
            }
        });
    },

    // Validasi form sebelum submit
    _validateForm() {

        let isValid = true;
        const photoInput = document.querySelector('#photo');
        const descriptionInput = document.querySelector('#description');
        const latInput = document.querySelector('#latitude');
        const mapElement = document.querySelector('#add-map');

        Utils.clearError(photoInput);
        Utils.clearError(descriptionInput);
        Utils.clearError(mapElement);

        if (photoInput.files.length === 0) {
            Utils.showError(photoInput, 'Foto tidak boleh kosong.');
            isValid = false;
        }

        if (descriptionInput.value.trim() === '') {
            Utils.showError(descriptionInput, 'Deskripsi tidak boleh kosong.');
            isValid = false;
        }

        if (latInput.value === '') {
            Utils.showError(mapElement, 'Silakan pilih lokasi di peta.');
            isValid = false;
        }

        return isValid;
    },
};

export default AddStoryPage;

