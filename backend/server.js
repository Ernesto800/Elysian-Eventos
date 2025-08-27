const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

const eventosRoutes = require('./routes/eventos');
const authRoutes = require('./routes/auth');

app.use('/api', authRoutes);
app.use('/api', eventosRoutes);


mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Conectado a MongoDB Atlas'))
.catch(err => console.error('Error de conexión a la base de datos:', err));

// Esquema de Evento
const Evento = require('./models/Evento');

// Rutas de la API
app.get('/', (req, res) => {
    res.send('Servidor de eventos funcionando!');
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});