const express = require('express');
const router = express.Router();
const Evento = require('../models/Evento');

router.post('/eventos', async (req, res) => {
    try {
        const eventosExistentes = await Evento.countDocuments();
        if (eventosExistentes >= 3) {
            return res.status(400).json({ msg: 'Has alcanzado el límite de 3 eventos.' });
        }
        
        const { nombre, fecha, hora, lugar, descripcion, guests } = req.body;
        
        const nuevoEvento = new Evento({
            nombre,
            fecha,
            hora,
            lugar,
            descripcion,
            guests,
        });
        
        const eventoGuardado = await nuevoEvento.save();
        res.status(201).json(eventoGuardado);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error del servidor al crear un evento' });
    }
});

// Obtener todos los eventos.
router.get('/eventos', async (req, res) => {
    try {
        const eventos = await Evento.find();
        res.status(200).json(eventos);
    } catch (err) {
        res.status(500).json({ error: 'Error del servidor al obtener todos los eventos' });
    }
});

// Obtener un evento por su ID.
router.get('/eventos/:id', async (req, res) => {
    try {
        const evento = await Evento.findById(req.params.id);
        if (!evento) return res.status(404).json({ msg: 'Evento no encontrado' });
        res.status(200).json(evento);
    } catch (err) {
        res.status(500).json({ error: 'Error del servidor al obtener un evento' });
    }
});

// Actualizar un evento por su ID.
router.put('/eventos/:id', async (req, res) => {
    try {
        const { guests } = req.body;

        if (!guests) {
            return res.status(400).json({ msg: 'Los datos de invitados son requeridos para la actualización' });
        }

        const eventoActualizado = await Evento.findByIdAndUpdate(
            req.params.id,
            { guests: guests },
            { new: true, runValidators: true }
        );

        if (!eventoActualizado) {
            return res.status(404).json({ msg: 'Evento no encontrado' });
        }

        res.status(200).json(eventoActualizado);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Error al actualizar el evento' });
    }
});

// Eliminar evento por su ID.
router.delete('/eventos/:id', async (req, res) => {
    try {
        const eventoEliminado = await Evento.findByIdAndDelete(req.params.id);
        if (!eventoEliminado) return res.status(404).json({ msg: 'Evento no encontrado' });
        res.status(200).json({ msg: 'Evento eliminado' });
    } catch (err) {
        res.status(500).json({ error: 'Error del servidor al eliminar un evento' });
    }
});

router.put('/eventos/:id/presupuesto', async (req, res) => {
    try {
        const { budget, expenses } = req.body;
        
        const eventoActualizado = await Evento.findByIdAndUpdate(
            req.params.id,
            { budget, expenses },
            { new: true, runValidators: true }
        );

        if (!eventoActualizado) {
            return res.status(404).json({ msg: 'Evento no encontrado' });
        }

        res.status(200).json(eventoActualizado);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Error al actualizar el presupuesto' });
    }
});


module.exports = router;