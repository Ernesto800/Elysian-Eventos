const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');

router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
});

router.post('/register', async (req, res) => {
    try {
        const { name, apellido, username, email, password, telefono } = req.body;
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            name,
            apellido,
            username,
            email,
            password: hashedPassword,
            telefono
        });

        const savedUser = await newUser.save();
        res.status(201).json({ msg: 'Usuario creado', user: savedUser });

    } catch (err) {
         console.error('Error en el registro:', err); 

        if (err.name === 'ValidationError') {
            return res.status(400).json({ msg: err.message });
        }
        if (err.code === 11000) {
            return res.status(400).json({ msg: 'El email o nombre de usuario ya existe.' });
        }
        console.error(err);
        return res.status(500).json({ msg: 'Error interno del servidor.' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { loginIdentifier, password } = req.body;
        
        const user = await User.findOne({ 
            $or: [{ email: loginIdentifier }, { username: loginIdentifier }] 
        });

        if (!user) {
            return res.status(400).json({ msg: 'Credenciales inválidas.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ msg: 'Credenciales inválidas.' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret_key', { expiresIn: '1h' });

        res.status(200).json({ token, msg: 'Inicio de sesión exitoso.' });
    } catch (err) {
        return res.status(500).json({ msg: 'Error del servidor.', error: err.message });
    }
});
router.patch('/me', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const updatedUser = await User.findByIdAndUpdate(userId, req.body, { new: true, runValidators: true }).select('-password');
        
        if (!updatedUser) {
            return res.status(404).json({ msg: 'Usuario no encontrado.' });
        }
        
        res.json(updatedUser);
    } catch (err) {
        console.error(err.message);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ msg: err.message });
        }
        res.status(500).send('Error del servidor');
    }
});

module.exports = router;