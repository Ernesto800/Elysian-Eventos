<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import HeaderComponent from '../components/HeaderComponent.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const router = useRouter();
const user = ref(null);
const editMode = ref(false);
const userData = ref({});
const message = ref('');
const showMessage = ref(false);
const isError = ref(false);

const fetchUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        router.push('/login');
        return;
    }
    try {
        const response = await axios.get('http://localhost:3000/api/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        user.value = response.data;
        userData.value = { ...response.data };
    } catch (error) {
        console.error('Error fetching user data:', error.response.data.msg);
        localStorage.removeItem('token');
        router.push('/login');
    }
};

const logout = () => {
    localStorage.removeItem('token');
    router.push('/login');
    window.location.reload();
};

const toggleEditMode = () => {
    editMode.value = !editMode.value;
};

const saveChanges = async () => {
    const token = localStorage.getItem('token');
    try {
        const response = await axios.patch('http://localhost:3000/api/me', userData.value, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        user.value = response.data;
        editMode.value = false;
        isError.value = false;
        message.value = t('account.changesSaved');
        showMessage.value = true;
    } catch (error) {
        console.error('Error al guardar los cambios:', error.response?.data?.msg || error.message);
        isError.value = true;
        message.value = t('account.saveError');
        showMessage.value = true;
    }
};

const cancelEdit = () => {
    userData.value = { ...user.value };
    editMode.value = false;
};

const closeMessage = () => {
    showMessage.value = false;
    message.value = '';
    isError.value = false;
};

onMounted(() => {
    fetchUser();
});
</script>

<template>
<HeaderComponent/>
<div class="mi-cuenta-container">
    <div class="card-container">
        <h1>{{ t('account.title') }}</h1>
        <div v-if="user" class="account-info">
            <div v-if="!editMode">
                <p><strong>{{ t('account.name') }}:</strong> {{ user.name }}</p>
                <p><strong>{{ t('account.lastname') }}:</strong> {{ user.apellido }}</p>
                <p><strong>{{ t('account.username') }}:</strong> {{ user.username }}</p>
                <p><strong>{{ t('account.email') }}:</strong> {{ user.email }}</p>
                <p><strong>{{ t('account.phone') }}:</strong> {{ user.telefono }}</p>
                <div class="edit-buttons-info">
                    <button @click="toggleEditMode">{{ t('general.edit') }}</button>
                    <button @click="logout" class="logout-button">{{ t('general.logout') }}</button>
                </div>
            </div>
            <div v-else class="edit-fields">
                <div class="field-row">
                    <strong>{{ t('account.name') }}:</strong> 
                    <input type="text" v-model="userData.name" maxlength="15">
                </div>
                <div class="field-row">
                    <strong>{{ t('account.lastname') }}:</strong> 
                    <input type="text" v-model="userData.apellido">
                </div>
                <div class="field-row">
                    <strong>{{ t('account.username') }}:</strong> 
                    <input type="text" v-model="userData.username">
                </div>
                <div class="field-row">
                    <strong>{{ t('account.email') }}:</strong> 
                    <input type="email" v-model="userData.email">
                </div>
                <div class="field-row">
                    <strong>{{ t('account.phone') }}:</strong> 
                    <input type="number" v-model="userData.telefono">
                </div>
                <div class="edit-buttons-edit">
                    <button @click="saveChanges" class="save-button">{{ t('general.save') }}</button>
                    <button @click="cancelEdit" class="cancel-button">{{ t('general.cancel') }}</button>
                </div>
            </div>
        </div>
        <div v-else class="loading-container">
            <div class="spinner"></div>
            <p class="loading-text">{{ t('account.loadingUser') }}</p>
        </div>

        <div v-if="showMessage" :class="['message-box', { 'error-box': isError }]">
            <p>{{ message }}</p>
            <button @click="closeMessage" class="close-btn">&times;</button>
        </div>
    </div>
</div>
</template>

<style scoped>
.mi-cuenta-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: calc(100vh - 60px);
    background-color: #f0f2f5;
    padding: 2rem;
}

.card-container {
    background-color: #ffffff;
    padding: 2.5rem;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 500px;
    text-align: center;
    position: relative;
    top: -40px;
    transition: transform 0.3s ease-in-out;
}

.card-container:hover {
    transform: translateY(-5px);
}

h1 {
    color: #4a4a4a;
    font-size: 2.5rem;
    margin-bottom: 2rem;
    font-weight: 300;
}

.account-info {
    text-align: left;
    margin-top: 1.5rem;
}

.edit-fields {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.field-row {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.field-row strong {
    flex: 0 0 100px;
    color: #333;
    font-weight: 600;
}

.field-row input {
    flex-grow: 1;
    padding: 0.75rem 1rem;
    border: 1px solid #ccc;
    border-radius: 6px;
    font-size: 1rem;
    width: 100%;
}

button {
    background-color: #007bff;
    color: #fff;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
    transition: background-color 0.3s ease;
}
button:hover {
    background-color: #044b97;
}
.edit-buttons-info {
    margin-top: 30px;
    display: flex;
    justify-content: center;
    gap: 1rem;
}

.edit-buttons-edit {
    margin-top: 30px;
    display: flex;
    justify-content: center;
    gap: 1rem;
}

.save-button {
    background-color: #28a745;
}

.save-button:hover {
    background-color: #218838;
}

.cancel-button {
    background-color: #dc3545;
}

.cancel-button:hover {
    background-color: #c82333;
}

.logout-button {
    background-color: #dc3545;
}
.logout-button:hover {
    background-color: #c82333;
}

.message-box {
    position: absolute;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background-color: #28a745;
    color: #fff;
    padding: 1rem 2rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    display: flex;
    align-items: center;
    justify-content: space-between;
    z-index: 100;
    animation: fadeIn 0.5s ease-in-out;
}

.message-box.error-box {
    background-color: #dc3545;
}

.message-box p {
    margin: 0;
    padding: 0;
    font-size: 1rem;
    line-height: 1.5;
    color: #fff;
    border: none;
}

.message-box .close-btn {
    background: none;
    border: none;
    color: #fff;
    font-size: 1.5rem;
    cursor: pointer;
    margin-left: 1rem;
    padding: 0;
}


@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

@keyframes fadeIn {
    from { opacity: 0; top: 0px; }
    to { opacity: 1; top: 20px; }
}

@media (max-width: 600px) {
    .card-container {
        padding: 1.5rem;
    }
    .field-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
    }
}
</style>