<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import HeaderComponent from '../components/HeaderComponent.vue';
import { useI18n } from 'vue-i18n';

const route = useRoute();
const event = ref(null);
const isLoading = ref(true);
const isEditingGuests = ref(false);
const { t } = useI18n(); // Obtiene la función de traducción

const newGuest = ref({
    name: '',
    apellidos: '',
    email: '',
    phone: '',
    relation: '',
    notes: '',
    rsvpStatus: 'Pending',
});

const fetchEventDetails = async () => {
    try {
        const eventId = route.params.id;
        const response = await axios.get(`http://localhost:3000/api/eventos/${eventId}`);
        event.value = response.data;
    } catch (error) {
        console.error('Error al obtener los detalles del evento:', error);
    } finally {
        isLoading.value = false;
    }
};

const addGuest = async () => {
    if (newGuest.value.name && newGuest.value.apellidos) {
        newGuest.value.rsvpStatus = 'Pending';
        event.value.guests.push({ ...newGuest.value });
        clearGuestFields();
        await updateEventGuests();
    } else {
        alert('Por favor, completa al menos el nombre y los apellidos del invitado.');
    }
};

const removeGuest = async (index) => {
    event.value.guests.splice(index, 1);
    await updateEventGuests();
};

const updateGuestStatus = async (guest) => {
    await updateEventGuests();
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
};

const updateEventGuests = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        router.push('/login');
        return;
    }
    try {
        const eventId = route.params.id;
        const updatedEventData = { guests: event.value.guests };
        await axios.put(`http://localhost:3000/api/eventos/${eventId}`, updatedEventData, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
    } catch (error) {
        console.error('Error al actualizar los invitados del evento:', error);
    }
};

const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
};

onMounted(() => {
    fetchEventDetails();
});
</script>

<template>
    <HeaderComponent />
    <div class="event-details-container">
        <div v-if="isLoading" class="loading-state">
            <p>{{ t('event.loading') }}</p>
        </div>
        
        <div v-else-if="!event" class="error-state">
            <p>{{ t('event.notFound') }}</p>
        </div>

        <div v-else class="event-details-wrapper">
            <h1 class="page-title">{{ event.nombre }}</h1>

            <section class="details-section">
                <h2>{{ t('event.details') }}</h2>
                <div class="details-grid">
                    <p><b>{{ t('event.date') }}:</b> {{ formatDate(event.fecha) }}</p>
                    <p><b>{{ t('event.time') }}:</b> {{ event.hora }}</p>
                    <p><b>{{ t('event.location') }}:</b> {{ event.lugar }}</p>
                    <p><b>{{ t('event.description') }}:</b> {{ event.descripcion }}</p>
                </div>
                <router-link :to="`/eventos/${event._id}/presupuesto`" class="btn-budget">
                    {{ t('event.budgetControl') }}
                </router-link>
            </section>

            <section class="guests-section">
                <h2>{{ t('event.guestList') }} ({{ event.guests ? event.guests.length : 0 }})</h2>
                
                <button @click="isEditingGuests = !isEditingGuests" class="btn-primary">
                    {{ isEditingGuests ? t('event.hideForm') : t('event.addEditGuests') }}
                </button>

                <div v-if="isEditingGuests" class="guest-form-container">
                    <h3>{{ t('event.addNewGuest') }}</h3>
                    <div class="guest-form">
                        <div class="input-group">
                            <label for="guestName">{{ t('event.name') }}</label>
                            <input id="guestName" v-model="newGuest.name" type="text" required>
                        </div>
                        <div class="input-group">
                            <label for="guestApellidos">{{ t('event.lastname') }}</label>
                            <input id="guestApellidos" v-model="newGuest.apellidos" type="text" required>
                        </div>
                        <div class="input-group">
                            <label for="guestEmail">{{ t('event.email') }}</label>
                            <input id="guestEmail" v-model="newGuest.email" type="email">
                        </div>
                        <div class="input-group">
                            <label for="guestPhone">{{ t('event.phone') }}</label>
                            <input id="guestPhone" v-model="newGuest.phone" type="tel">
                        </div>
                        <div class="input-group">
                            <label for="guestRelation">{{ t('event.relation') }}</label>
                            <input id="guestRelation" v-model="newGuest.relation" type="text" :placeholder="t('general.placeholderRelation')">
                        </div>
                        
                        <button type="button" @click="addGuest" class="btn-add-guest">
                            {{ t('event.addGuest') }}
                        </button>
                    </div>
                </div>

                <div v-if="!event.guests || event.guests.length === 0" class="empty-state">
                    <p>{{ t('event.noGuests') }}</p>
                </div>
                <div v-else class="guest-list-table-container">
                    <table class="guest-table">
                        <thead>
                            <tr>
                                <th>{{ t('event.name') }}</th>
                                <th>{{ t('event.lastname') }}</th>
                                <th>{{ t('event.email') }}</th>
                                <th>{{ t('event.phone') }}</th>
                                <th>{{ t('event.relation') }}</th>
                                <th>{{ t('event.rsvpStatus') }}</th>
                                <th>{{ t('event.actions') }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(guest, index) in event.guests" :key="index">
                                <td>{{ guest.name }}</td>
                                <td>{{ guest.apellidos }}</td>
                                <td>{{ guest.email }}</td>
                                <td>{{ guest.phone }}</td>
                                <td>{{ guest.relation }}</td>
                                <td>
                                    <select v-model="guest.rsvpStatus" @change="updateGuestStatus(guest)" class="rsvp-select">
                                        <option value="Pending">{{ t('event.pending') }}</option>
                                        <option value="Confirmed">{{ t('event.confirmed') }}</option>
                                        <option value="Declined">{{ t('event.declined') }}</option>
                                    </select>
                                </td>
                                <td>
                                    <button type="button" @click="removeGuest(index)" class="btn-remove">{{ t('event.delete') }}</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    </div>
</template>

<style scoped>
.event-details-container {
    padding: 2rem;
    background-color: #f8f9fa;
    min-height: calc(100vh - 60px);
}
.event-details-wrapper {
    max-width: 900px;
    margin: 0 auto;
    background: #fff;
    padding: 2.5rem;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}
.page-title {
    color: #34495e;
    font-size: 2.8rem;
    text-align: center;
    margin-bottom: 2rem;
    font-weight: 600;
}
.details-section, .guests-section {
    margin-bottom: 3rem;
}
h2 {
    color: #2c3e50;
    font-size: 1.8rem;
    border-bottom: 2px solid #e9ecef;
    padding-bottom: 0.5rem;
    margin-bottom: 1.5rem;
}
.details-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-bottom: 1.5rem;
}
.details-grid p {
    background-color: #ecf0f1;
    padding: 1rem;
    border-radius: 8px;
    font-size: 1rem;
    color: #4a4a4a;
}
.btn-primary, .btn-budget, .btn-add-guest, .btn-remove {
    padding: 0.8rem 1.5rem;
    font-size: 1rem;
    border-radius: 8px;
    cursor: pointer;
    border: none;
    color: #fff;
    text-decoration: none;
    text-align: center;
    transition: background-color 0.3s ease;
}
.btn-primary {
    background-color: #3498db;
    margin-bottom: 1.5rem;
}
.btn-primary:hover {
    background-color: #2980b9;
}
.btn-budget {
    background-color: #2ecc71;
    display: inline-block;
    margin-top: 1rem;
}
.btn-budget:hover {
    background-color: #27ae60;
}
.guest-form-container {
    background-color: #f1f3f5;
    padding: 2rem;
    border-radius: 12px;
    margin-bottom: 2rem;
}
.guest-form h3 {
    margin-top: 0;
    color: #555;
}
.guest-form {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    align-items: flex-end;
}
.input-group {
    display: flex;
    flex-direction: column;
}
.input-group label {
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: #555;
}
.input-group input {
    padding: 0.75rem;
    border: 1px solid #ccc;
    border-radius: 6px;
}
.btn-add-guest {
    background-color: #3498db;
}
.btn-add-guest:hover {
    background-color: #2980b9;
}
.guest-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 1rem;
    display: block;
    overflow: hidden;
    white-space: nowrap;
}
.guest-table th, .guest-table td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid #dee2e6;
    overflow: hidden;
    text-overflow: ellipsis;
}
.guest-table th {
    background-color: #34495e;
    color: #fff;
    font-weight: 600;
}
.guest-table tr:hover {
    background-color: #f1f3f5;
}
.btn-remove {
    background-color: #e74c3c;
}
.btn-remove:hover {
    background-color: #c0392b;
}
.rsvp-select {
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 6px;
    cursor: pointer;
}
.rsvp-select option[value="Pending"] { color: #f39c12; font-weight: bold; }
.rsvp-select option[value="Confirmed"] { color: #2ecc71; font-weight: bold; }
.rsvp-select option[value="Declined"] { color: #e74c3c; font-weight: bold; }
.loading-state, .empty-state, .error-state {
    text-align: center;
    padding: 2rem;
    color: #7f8c8d;
}
@media (max-width: 768px) {
    .event-details-wrapper {
        padding: 1.5rem;
    }
    .guest-table, .guest-table thead, .guest-table tbody, .guest-table th, .guest-table td, .guest-table tr { 
        display: block; 
    }
    .guest-table thead tr { 
        position: absolute;
        top: -9999px;
        left: -9999px;
    }
    .guest-table tr { border: 1px solid #dee2e6; margin-bottom: 1rem; }
    .guest-table td { 
        border: none;
        border-bottom: 1px solid #eee; 
        position: relative;
        padding-left: 50%; 
        text-align: right;
    }
    .guest-table td:before { 
        position: absolute;
        top: 6px;
        left: 6px;
        width: 45%; 
        padding-right: 10px; 
        white-space: nowrap;
        text-align: left;
        font-weight: bold;
        content: attr(data-label);
    }
}
</style>