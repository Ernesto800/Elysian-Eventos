import { defineStore } from 'pinia';
import axios from 'axios';

export const useUserStore = defineStore('user', {
    state: () => ({
        user: null,
        token: localStorage.getItem('token'),
        isLoading: false,
    }),
    actions: {
        async fetchUser() {
            if (this.user || !this.token) {
                return;
            }
            this.isLoading = true;
            try {
                const response = await axios.get('http://localhost:3000/api/me', {
                    headers: {
                        'Authorization': `Bearer ${this.token}`,
                    },
                });
                this.user = response.data;
            } catch (error) {
                console.error('Error al obtener los datos del usuario:', error);
                this.logout();
            } finally {
                this.isLoading = false;
            }
        },
        async logout() {
            this.user = null;
            this.token = null;
            localStorage.removeItem('token');
        },
    },
});