<script setup>
import { ref, onMounted, computed } from 'vue';
import { useUserStore } from '@/stores/user.js';
import axios from 'axios';
import HeaderComponent from '../components/HeaderComponent.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const userStore = useUserStore();
const events = ref([]);
const isLoading = ref(true);
const userSubscriptionPlan = ref('basic');
const showUpgradeModal = ref(false);
const eventLimits = {
    'basic': 3,
    'premium': 20,
    'premium_plus': Infinity,
};

const currentEventLimit = computed(() => {
    return eventLimits[userSubscriptionPlan.value] || 0;
});

const hasReachedLimit = computed(() => {
    if (userSubscriptionPlan.value === 'premium_plus') {
        return false;
    }
    return events.value.length >= currentEventLimit.value;
});

const fetchEvents = async () => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No se encontró el token de autenticación.');
            return;
        }
        const response = await axios.get('http://localhost:3000/api/eventos', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        events.value = response.data;
        // Aquí podrías obtener el plan del usuario desde el backend,
        // por ejemplo, en la respuesta de autenticación o en un endpoint de perfil.
        // userSubscriptionPlan.value = response.data.user.subscriptionPlan;
    } catch (error) {
        console.error('Error al obtener los eventos:', error);
    } finally {
        isLoading.value = false;
    }
};

const deleteEvent = async (eventId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('No se encontró el token de autenticación.');
                return;
            }
            await axios.delete(`http://localhost:3000/api/eventos/${eventId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            events.value = events.value.filter(event => event._id !== eventId);
        } catch (error) {
            console.error('Error al eliminar el evento:', error);
        }
    }

const showModal = () => {
    showUpgradeModal.value = true;
};

const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
};

onMounted(() => {
    userStore.fetchUser();
    fetchEvents();
});
</script>

<template>
    <HeaderComponent />
    <div class="dashboard-container">
        <h1 class="welcome-message">{{ t('dashboard.welcome', { name: userStore.user ? userStore.user.name : '' }) }}</h1>
        
        <div class="events-header">
            <h2>{{ t('dashboard.myEvents') }}</h2>
            <div class="event-info">        
                <router-link
                    v-if="!hasReachedLimit"
                    to="/nuevo-evento"
                    class="btn-create-event"
                >
                    {{ t('dashboard.createEvent') }}
                </router-link>
                <button
                    v-else
                    @click="showModal"
                    class="btn-create-event btn-disabled"
                >
                    {{ t('dashboard.createEvent') }}
                </button>
            </div>
        </div>

        <div v-if="isLoading" class="loading-state">
            <p>{{ t('general.loading') }}</p>
        </div>
        
        <div v-else-if="events.length === 0" class="empty-state">
            <p>{{ t('dashboard.noEvents') }}</p>
        </div>
        <div v-else class="events-grid">
            <div v-for="event in events" :key="event._id" class="event-card">
                <router-link :to="`/eventos/${event._id}`">
                    <h3>{{ event.nombre }}</h3>
                    <p>{{ formatDate(event.fecha) }}</p>
                    <p>{{ event.lugar }}</p>
                </router-link>
                <button type="button" @click.stop="deleteEvent(event._id)" class="delete-button">Borrar</button>
            </div>
        </div>
    </div>

    <div v-if="showUpgradeModal" class="modal-overlay">
        <div class="modal-content">
            <h3>¡Límite alcanzado!</h3>
            <p>Has alcanzado el límite de {{ currentEventLimit }} eventos para tu plan actual.</p>
            <p>Para crear más eventos, por favor, actualiza tu plan.</p>
            <div class="modal-actions">
                <button @click="showUpgradeModal = false" class="btn-secondary">Cerrar</button>
                <button @click="router.push('/plan-upgrade')" class="btn-primary">Actualizar Plan</button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.dashboard-container {
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
}

h1 {
    color: #333;
    text-align: center;
    margin-bottom: 2rem;
}

.loading-state,
.empty-state {
    text-align: center;
    font-size: 1.2rem;
    color: #666;
    padding: 2rem;
}

.events-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
}

.event-info {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.event-count-message {
    color: #666;
    font-weight: bold;
}

.btn-create-event {
    background-color: #3b82f6;
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    text-decoration: none;
    font-weight: bold;
    transition: background-color 0.2s;
}

.btn-create-event:hover:not(.btn-disabled) {
    background-color: #2563eb;
}

.btn-disabled {
    background-color: #a0aec0;
    cursor: not-allowed;
    pointer-events: none;
}

.events-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1.5rem;
}

.event-card {
    background-color: #f9f9f9;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    transition: transform 0.2s, box-shadow 0.2s;
    display: flex;
    flex-direction: column;
}

.event-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}

.event-card a {
    text-decoration: none;
    color: inherit;
    flex-grow: 1;
    margin-bottom: 1rem;
}

.event-card h3 {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
    color: #333;
}

.event-card p {
    font-size: 1rem;
    color: #666;
    margin-bottom: 0.25rem;
}

.delete-button {
    background-color: #ef4444;
    color: #fff;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: bold;
    align-self: flex-start;
    transition: background-color 0.2s;
}

.delete-button:hover {
    background-color: #dc2626;
}

.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-content {
    background-color: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    text-align: center;
    max-width: 400px;
}

.modal-content h3 {
    margin-top: 0;
    font-size: 1.5rem;
    color: #3b82f6;
}

.modal-content p {
    color: #666;
    line-height: 1.5;
}

.modal-actions {
    margin-top: 1.5rem;
    display: flex;
    justify-content: space-around;
    gap: 1rem;
}

.btn-primary, .btn-secondary {
    padding: 0.75rem 1.5rem;
    border-radius: 6px;
    font-weight: bold;
    cursor: pointer;
    border: none;
    transition: background-color 0.2s;
}

.btn-primary {
    background-color: #3b82f6;
    color: white;
}

.btn-primary:hover {
    background-color: #2563eb;
}

.btn-secondary {
    background-color: #e2e8f0;
    color: #4a5568;
}

.btn-secondary:hover {
    background-color: #cbd5e1;
}
</style>
