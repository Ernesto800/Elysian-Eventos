<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import axios from 'axios';
import HeaderComponent from '../components/HeaderComponent.vue';
import Papa from 'papaparse';

// Importa la función de traducción
const { t } = useI18n();
const router = useRouter();

const event = ref({
    nombre: '',
    fecha: '',
    hora: '',
    lugar: '',
    descripcion: '',
});

const guests = ref([]);
const newGuest = ref({
    name: '',
    apellidos: '',
    email: '',
    phone: '',
    relation: '',
    notes: '',
    rsvpStatus: 'Pending',
});

const customFields = ref([]);
const showForm = ref(false);
const showImportModal = ref(false);
const csvColumns = ref([]);
const columnMappings = ref({
    name: '',
    apellidos: '',
    email: '',
    phone: '',
    relation: '',
    notes: '',
});

const addGuest = () => {
    if (newGuest.value.name) {
        const guestWithCustomFields = {
            ...newGuest.value,
            customFields: [...customFields.value],
        };
        guests.value.push(guestWithCustomFields);
        clearGuestFields();
    }
};

const removeGuest = (index) => {
    guests.value.splice(index, 1);
};

const clearGuestFields = () => {
    newGuest.value = {
        name: '',
        apellidos: '',
        email: '',
        phone: '',
        relation: '',
        notes: '',
        rsvpStatus: 'Pending',
    };
    customFields.value = [];
};

const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                csvColumns.value = Object.keys(results.data[0]);
                columnMappings.value.name = csvColumns.value.find(col => col.toLowerCase().includes('nombre')) || '';
                columnMappings.value.apellidos = csvColumns.value.find(col => col.toLowerCase().includes('apellido')) || '';
                columnMappings.value.email = csvColumns.value.find(col => col.toLowerCase().includes('email') || col.toLowerCase().includes('correo')) || '';
                columnMappings.value.phone = csvColumns.value.find(col => col.toLowerCase().includes('phone') || col.toLowerCase().includes('telefono')) || '';
                columnMappings.value.relation = csvColumns.value.find(col => col.toLowerCase().includes('relation') || col.toLowerCase().includes('relacion')) || '';
                columnMappings.value.notes = csvColumns.value.find(col => col.toLowerCase().includes('notes') || col.toLowerCase().includes('notas')) || '';
                
                showImportModal.value = true;
                sessionStorage.setItem('tempImportData', JSON.stringify(results.data));
            },
        });
    }
};

const processImport = () => {
    const rawData = JSON.parse(sessionStorage.getItem('tempImportData'));
    const importedGuests = rawData.map(row => {
        const guestData = {
            name: row[columnMappings.value.name] || '',
            apellidos: row[columnMappings.value.apellidos] || '',
            email: row[columnMappings.value.email] || '',
            phone: row[columnMappings.value.phone] || '',
            relation: row[columnMappings.value.relation] || '',
            notes: row[columnMappings.value.notes] || '',
            rsvpStatus: 'Pending',
            customFields: Object.keys(row)
                .filter(key => !Object.values(columnMappings.value).includes(key) && key !== 'rsvpStatus')
                .map(key => ({ key: key, value: row[key] }))
        };
        return guestData;
    });

    guests.value.push(...importedGuests);
    showImportModal.value = false;
    sessionStorage.removeItem('tempImportData');
};

const createEvent = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        router.push('/login');
        return;
    }

    try {
        const eventData = {
            ...event.value,
            guests: guests.value,
        };

        const response = await axios.post('http://localhost:3000/api/eventos', eventData, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        
        console.log('Evento creado:', response.data);
        router.push('/');
    } catch (error) {
        console.error('Error al crear el evento:', error.response.data);
    }
};

onMounted(() => {
});
</script>

<template>
    <HeaderComponent />
    <h1 class="page-title">{{ t('createEvent.pageTitle') }}</h1>
    <div class="new-event-container">
        <form @submit.prevent="createEvent" class="event-form">
            <section class="form-section event-details-section">
                <h2>{{ t('createEvent.details') }}</h2>
                <div class="input-group">
                    <label for="eventName">{{ t('createEvent.eventName') }}</label>
                    <input id="eventName" v-model="event.nombre" type="text" required>
                </div>
                <div class="input-group">
                    <label for="eventDate">{{ t('createEvent.eventDate') }}</label>
                    <input id="eventDate" v-model="event.fecha" type="date" required>
                </div>
                <div class="input-group">
                    <label for="eventTime">{{ t('createEvent.eventTime') }}</label>
                    <input id="eventTime" v-model="event.hora" type="time" required>
                </div>
                <div class="input-group">
                    <label for="eventLocation">{{ t('createEvent.eventLocation') }}</label>
                    <input id="eventLocation" v-model="event.lugar" type="text" required>
                </div>
                <div class="input-group">
                    <label for="eventDescription">{{ t('createEvent.eventDescription') }}</label>
                    <textarea id="eventDescription" v-model="event.descripcion"></textarea>
                </div>
            </section>

            <section class="form-section guests-section">
                <h2>{{ t('guests.title') }}</h2>
                <div class="guest-actions">
                    <button type="button" class="btn-primary" @click="showForm = !showForm">
                        {{ showForm ? t('guests.hideGuest') : t('guests.addNewGuest') }}
                    </button>
                    <label class="btn-secondary file-upload-label">
                        {{ t('guests.import') }}
                        <input type="file" @change="handleFileUpload" accept=".csv" style="display: none;">
                    </label>
                </div>

                <div v-if="showImportModal" class="modal-overlay">
                    <div class="modal-content">
                        <h3>{{ t('guests.modalTitle') }}</h3>
                        <p>{{ t('guests.modalDescription') }}</p>
                        <div class="mapping-fields">
                            <div v-for="(value, key) in columnMappings" :key="key" class="mapping-input-group">
                                <label>{{ t(`guests.${key}`) }}</label>
                                <select v-model="columnMappings[key]">
                                    <option value="">{{ t('general.noMap') }}</option>
                                    <option v-for="col in csvColumns" :key="col" :value="col">{{ col }}</option>
                                </select>
                            </div>
                        </div>
                        <button class="btn-primary" @click="processImport">{{ t('general.confirmImport') }}</button>
                    </div>
                </div>

                <div v-if="showForm" class="guest-form-container">
                    <h3>{{ t('guests.formTitle') }}</h3>
                    <div class="guest-form">
                        <div class="input-group">
                            <label for="guestName">{{ t('guests.name') }}</label>
                            <input id="guestName" v-model="newGuest.name" type="text" required>
                        </div>
                        <div class="input-group">
                            <label for="guestApellidos">{{ t('guests.lastName') }}</label>
                            <input id="guestApellidos" v-model="newGuest.apellidos" type="text" required>
                        </div>
                        <div class="input-group">
                            <label for="guestEmail">{{ t('guests.email') }}</label>
                            <input id="guestEmail" v-model="newGuest.email" type="email">
                        </div>
                        <div class="input-group">
                            <label for="guestPhone">{{ t('guests.phone') }}</label>
                            <input id="guestPhone" v-model="newGuest.phone" type="tel">
                        </div>
                        <div class="input-group">
                            <label for="guestRelation">{{ t('guests.relation') }}</label>
                            <input id="guestRelation" v-model="newGuest.relation" type="text" :placeholder="t('guests.relationPlaceholder')">
                        </div>
                        <button type="button" @click="addGuest" class="btn-add-guest">
                            {{ t('guests.addButton') }}
                        </button>
                    </div>
                </div>

                <div v-if="guests.length > 0" class="guest-list-table-container">
                    <h3>{{ t('guests.listTitle') }} ({{ guests.length }})</h3>
                    <table class="guest-table">
                        <thead>
                            <tr>
                                <th>{{ t('guests.name') }}</th>
                                <th>{{ t('guests.lastName') }}</th>
                                <th>{{ t('guests.email') }}</th>
                                <th>{{ t('guests.phone') }}</th>
                                <th>{{ t('guests.relation') }}</th>
                                <th>{{ t('guests.rsvpStatus') }}</th>
                                <th>{{ t('guests.actions') }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(guest, index) in guests" :key="index">
                                <td>{{ guest.name }}</td>
                                <td>{{ guest.apellidos }}</td>
                                <td>{{ guest.email }}</td>
                                <td>{{ guest.phone }}</td>
                                <td>{{ guest.relation }}</td>
                                <td>{{ t(`general.${guest.rsvpStatus.toLowerCase()}`) }}</td>
                                <td>
                                    <button type="button" @click="removeGuest(index)" class="btn-remove">{{ t('general.remove') }}</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
            <button type="submit" class="submit-btn">{{ t('createEvent.createButton') }}</button>
        </form>
    </div>
</template>

<style scoped>
.new-event-container {
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: calc(100vh - 60px);
}

.page-title {
    text-align: center;
    color: #333;
    font-size: 2.5rem;
    margin-bottom: 2rem;
}

.event-form {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    background-color: #fff;
    padding: 2rem;
    border-radius: 10px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
    width: 100%;
    max-width: 1000px;
}

.form-section {
    background-color: #fff;
    padding: 2rem;
    border-radius: 10px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

h2 {
    font-size: 1.8rem;
    color: #444;
    border-bottom: 2px solid #eee;
    padding-bottom: 0.5rem;
    margin-bottom: 1.5rem;
}

.input-group {
    margin-bottom: 1rem;
}

.input-group label {
    display: block;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: #555;
}

.input-group input,
.input-group textarea,
.input-group select {
    width: 100%;
    padding: 0.8rem;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 1rem;
    transition: border-color 0.3s;
}

.input-group input:focus,
.input-group textarea:focus {
    outline: none;
    border-color: #3b82f6;
}

.guest-actions {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
}

.btn-primary, .btn-secondary {
    padding: 0.8rem 1.5rem;
    font-size: 1rem;
    font-weight: 600;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.3s;
}

.btn-primary {
    background-color: #3b82f6;
    color: #fff;
    border: none;
}

.btn-primary:hover {
    background-color: #2563eb;
}

.btn-secondary {
    background-color: #f1f5f9;
    color: #4a5568;
    border: 1px solid #cbd5e1;
}

.btn-secondary:hover {
    background-color: #e2e8f0;
}

.file-upload-label {
    display: inline-block;
}

.guest-form-container {
    background-color: #f8fafc;
    padding: 1.5rem;
    border-radius: 8px;
    border: 1px dashed #cbd5e1;
    margin-bottom: 2rem;
}

h3 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    color: #555;
}

.guest-form {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
}

.guest-form .input-group {
    margin-bottom: 0;
}

.btn-add-guest {
    grid-column: 1 / -1;
    background-color: #10b981;
    color: #fff;
    padding: 0.8rem 1.5rem;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: background-color 0.3s;
}

.btn-add-guest:hover {
    background-color: #059669;
}

.custom-fields-container {
    grid-column: 1 / -1;
    background-color: #f1f5f9;
    padding: 1rem;
    border-radius: 6px;
}

.custom-field {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
    background-color: #e2e8f0;
    padding: 0.5rem 1rem;
    border-radius: 4px;
}

.custom-field-text {
    flex-grow: 1;
}

.remove-field-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    color: #ef4444;
    cursor: pointer;
}

.add-custom-field {
    display: flex;
    gap: 0.5rem;
    align-items: center;
}

.custom-input {
    flex-grow: 1;
    border: 1px solid #cbd5e1;
    padding: 0.5rem;
    border-radius: 4px;
}

.btn-add-field {
    background-color: #22c55e;
    color: #fff;
    border: none;
    border-radius: 4px;
    padding: 0.5rem 1rem;
    font-size: 1.2rem;
    cursor: pointer;
}

.guest-list-table-container {
    overflow-x: auto;
}

.guest-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 1.5rem;
    background-color: #fff;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    border-radius: 8px;
    overflow: hidden;
}

.guest-table th, .guest-table td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid #ddd;
}

.guest-table th {
    background-color: #f1f5f9;
    font-weight: 700;
    color: #4a5568;
    text-transform: uppercase;
    font-size: 0.9rem;
}

.btn-remove {
    background-color: #ef4444;
    color: #fff;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s;
}

.btn-remove:hover {
    background-color: #dc2626;
}

.submit-btn {
    display: block;
    width: 100%;
    padding: 1rem;
    font-size: 1.2rem;
    font-weight: 700;
    color: #fff;
    background-color: #3b82f6;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.3s;
}

.submit-btn:hover {
    background-color: #2563eb;
}
</style>