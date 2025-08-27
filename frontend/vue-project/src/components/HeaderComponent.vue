<script setup>
import { RouterLink } from 'vue-router';
import { useUserStore } from '@/stores/user.js';
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';

// Usamos la API de composición de vue-i18n para acceder a las traducciones
const { t, locale } = useI18n();

const userStore = useUserStore();

onMounted(() => {
    userStore.fetchUser();
});
</script>

<template>
    <header class="app-header">
        <div class="header-content">
           <div class="header-content">
              <div class="logo-container">
                <RouterLink to="/" class="logo-link">
                    <span class="logo-text">Elysian</span>
                </RouterLink>
              </div>
              <nav class="main-nav">
                  <RouterLink to="/" class="nav-link">Dashboard</RouterLink>
                  <RouterLink to="/nuevo-evento" class="nav-link">Crear Evento</RouterLink>
              </nav>
            </div>
            <div class="user-profile">
                <select v-model="locale" class="language-switcher">
                    <option value="es">Español</option>
                    <option value="en">English</option>
                </select>
                <RouterLink to="/mi-cuenta" class="user-account" :class="{ 'invisible': $route.name === 'mi-cuenta' }">{{ t('header.myAccount') }}</RouterLink>
                <div v-if="userStore.user">
                    <span class="user-name">{{ userStore.user.name }}</span>
                </div>
            </div>
        </div>
    </header>
</template>

<style scoped>
:root {
  --primary-color: #007bff;
  --secondary-color: #6c757d;
  --text-color: #343a40;
  --background-color: #fff;
  --border-color: #dee2e6;
}

.app-header {
  background-color: var(--background-color);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1rem 2rem;
  border-bottom: 1px solid var(--border-color);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 60px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.logo-container {
  display: flex;
  align-items: center;
}

.logo-link {
  text-decoration: none;
  color: var(--text-color);
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-color);
}

.main-nav {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.nav-link {
 text-decoration: none;
  font-weight: 500;
  color: var(--secondary-color);
  padding: 0.5rem 1rem;
  transition: all 0.3s ease;
}
.user-account{
  text-decoration: none;
  font-weight: 500;
  color: var(--secondary-color);
  padding: 0.5rem 1rem;
  transition: all 0.3s ease;
}
.user-account:hover{
  color: var(--primary-color);
  transform: translateY(-2px);
  text-decoration: underline;
  cursor: pointer;
}

.nav-link:hover {
  color: var(--primary-color);
  transform: translateY(-2px);
  text-decoration: underline;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-name {
  color: var(--text-color);
  font-weight: 500;
}

.user-avatar {
  width: 40px;
  height: 40px;
  background-color: var(--secondary-color);
  border-radius: 50%;
}
.invisible {
    visibility: hidden;
}
.user-name {
    font-size: 1.1rem;
    font-weight: 500;
    color: #f0f2f5;
    background-color: #4365a0;
    padding: 0.4rem 0.8rem;
    border-radius: 20px;
    letter-spacing: 0.5px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    transition: all 0.3s ease;
}

.user-name:hover {
    background-color: #1f2c44;
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
    cursor:default;
}

.language-switcher {
    padding: 0.5rem 0.75rem;
    border-radius: 6px;
    border: 1px solid #ccc;
    background-color: #fff;
    cursor: pointer;
    font-size: 0.9rem;
    margin-right: 1rem;
}
</style>