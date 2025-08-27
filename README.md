# Elysian-Eventos

## Descripción del Proyecto

Elysian Eventos es una plataforma de gestión de eventos completa, diseñada para simplificar la planificación y organización de cualquier celebración. Facilita la gestión de invitados, el control del presupuesto y la centralización de todos los detalles importantes en un solo lugar.

Construido con una arquitectura de pila completa (Full Stack), el proyecto garantiza una experiencia de usuario fluida y reactiva en el frontend, y un backend robusto para una gestión de datos segura y escalable.

## Características Principales
### Autenticación de Usuarios: Registro y login seguro.

### Gestión de Cuentas:
Los usuarios pueden editar su perfil (nombre, email, etc.).

### Creación y Gestión de Eventos: 
Funcionalidad para crear nuevos eventos con detalles como fecha, hora, lugar y descripción.

### Control de Presupuesto:
Herramienta para gestionar los gastos por categoría.

### Lista de Invitados:
Permite añadir y gestionar invitados, incluyendo su estado de confirmación (RSVP).

### Internacionalización (i18n):
La aplicación está preparada para múltiples idiomas.

## Tecnologías Utilizadas
### Vue.js:
Framework progresivo para construir interfaces de usuario.

### Vue Router:
Enrutador oficial de Vue.js para la navegación en la aplicación.

### Axios:
Cliente HTTP basado en promesas.

### Vue I18n:
Plugin de internacionalización.

### Node.js:
Entorno de ejecución de JavaScript del lado del servidor.

### Express.js:
Framework de Node.js para APIs.

### MongoDB:
Base de datos NoSQL.

### Mongoose: 
Biblioteca para modelado de objetos de MongoDB.

### JSON Web Tokens (JWT):
Estándar de autenticación.

### Bcrypt:
Biblioteca para el hashing seguro de contraseñas.

## Instalación y Configuración
Sigue estos pasos para configurar el proyecto en tu máquina local.

### Requisitos Previos
Node.js (v14+)

npm

MongoDB

1. Clonar el Repositorio
git clone https://github.com/Ernesto800/Elysian-Eventos.git
cd Elysian-Eventos

2. Configurar el Backend


Crea un archivo .env en el directorio backend con las siguientes variables:

MONGO_URI=tu_url_de_conexion_a_mongodb
JWT_SECRET=una_cadena_de_texto_secreta_para_JWT

### Inicia el servidor:

npm start o node server.js

3. Configurar el Frontend
cd ../frontend
npm install

Inicia la aplicación:

npm run serve o npm run dev

La aplicación estará accesible en http://localhost:8080.
