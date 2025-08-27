const mongoose = require('mongoose');

const validateEmail = (email) => {
    const re = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    return re.test(email);
};

const guestSchema = new mongoose.Schema({
    name: { type: String, required: true },
    apellidos: { type: String, required: true },
    email: { 
        type: String, 
        validate: [validateEmail, 'Por favor, introduce un correo electrónico válido'] 
    },
    phone: { type: String },
    relation: { type: String },
    notes: { type: String },
    rsvpStatus: { type: String, default: 'Pending' },
});

const expenseSchema = new mongoose.Schema({
    name: { type: String, required: true },
    amount: { type: Number, required: true },
    category: { type: String, required: true },
    isPaid: { type: Boolean, default: false }
});

const eventoSchema = new mongoose.Schema({
    nombre: { type: String, required: true, trim: true },
    fecha: { 
        type: Date, 
        required: true,
        min: [new Date(), 'La fecha del evento no puede ser en el pasado']
    },
    hora: { type: String, required: true },
    lugar: { type: String, required: true, trim: true },
    descripcion: { type: String, trim: true },
    guests: [guestSchema],
    budget: { type: Number, default: 0 },
    expenses: [expenseSchema],
});

module.exports = mongoose.model('Evento', eventoSchema);