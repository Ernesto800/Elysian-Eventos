<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const router = useRouter();
const email = ref('');
const password = ref('');
const error = ref('');
const name = ref('');
const apellido = ref('');
const username = ref('');
const telefono = ref('');

const register = async () => {
  try {
      const response = await axios.post('http://localhost:3000/api/register', {
      email: email.value,
      password: password.value,
      name: name.value,
      apellido: apellido.value,
      username: username.value,
      telefono: telefono.value,
    });
    console.log(response.data.msg);
    router.push('/login');
  } catch (err) {
    console.error('Error del servidor:', err.response.data.msg); 
    error.value = err.response.data.msg || "Error al registrar el usuario.";
  }
};
</script>

<template>
  <div class="auth-container">
    <h2>Registrarse</h2>
    <form @submit.prevent="register">
      <input type="text" placeholder="Nombre" v-model="name" maxlength="15"/>
      <input type="text" placeholder="Apellidos" v-model="apellido" />
      <input type="text" placeholder="username" v-model="username" />
      <input type="email" placeholder="email" v-model="email" />
      <input type="password" placeholder="password" v-model="password" />
      <input type="number" placeholder="Telefono" v-model="telefono" />
      <button type="submit">Registrarse</button>
      <p v-if="error" class="error-message">{{ error }}</p>
    </form>
    <router-link to="/login">¿Ya tienes una cuenta? Inicia Sesión</router-link>
  </div>
</template>

<style>
.auth-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f8f9fa;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  padding: 2rem;
}

.auth-container h2 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #343a40;
  margin-bottom: 2rem;
}

form {
  background-color: #ffffff;
  padding: 3rem;
  border-radius: 10px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

input[type="email"],
input[type="password"] {
  width: 100%;
  padding: 1rem;
  border: 1px solid #ced4da;
  border-radius: 5px;
  font-size: 1rem;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

input[type="email"]:focus,
input[type="password"]:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

button {
  background-color: #007bff;
  color: #ffffff;
  border: none;
  padding: 1rem;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.3s ease;
}

button[type="submit"]:hover {
  background-color: #0056b3;
  transform: translateY(-2px);
}

.error-message {
  color: #dc3545;
  font-weight: 500;
  text-align: center;
  margin-top: -1rem;
}

.auth-container .router-link {
  color: #007bff;
  text-decoration: none;
  font-weight: 500;
  margin-top: 1rem;
  transition: color 0.3s ease;
}

.auth-container .router-link:hover {
  color: #0056b3;
  text-decoration: underline;
}
</style>