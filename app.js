const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const Cuenta = require('./models/cuenta');

dotenv.config();

const app = express();

// Configuración de CORS
app.use(cors({
    origin: ['https://gestion-cuentas-agc-frontend-apktwvaot.vercel.app', 'https://gestion-cuentas-agc-frontend.vercel.app', 'http://localhost:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Conexión a la ddbb
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Conectado a MongoDB'))
    .catch(err => {
        console.error('Error al conectar con MongoDB:', err);
        process.exit(1);  // Salir en caso de error
    });

// Ruta de obtener cuentas
app.get('/cuentas', async (req, res) => {
    try {
        const nombreApellido = req.query.nombreApellido;
        const query = nombreApellido 
            ? { nombreApellido: { $regex: `^${nombreApellido}`, $options: 'i' } }
            : {};
        const cuentas = await Cuenta.find(query);
        res.json(cuentas);
    } catch (err) {
        console.error('Error al obtener cuentas:', err);
        res.status(500).json({ error: 'Error al obtener las cuentas' });
    }
});

// Obtener una cuenta por ID
app.get('/cuentas/:id', async (req, res) => {
    try {
        const cuenta = await Cuenta.findById(req.params.id);
        if (!cuenta) {
            return res.status(404).json({ error: 'Cuenta no encontrada' });
        }
        res.json(cuenta);
    } catch (err) {
        console.error('Error al obtener cuenta:', err);
        res.status(500).json({ error: 'Error al obtener la cuenta' });
    }
});

// Ruta para crear una nueva cuenta
app.post('/cuentas', async (req, res) => {
    try {
        const { nombreApellido, descripcion, cuentaX, cuentaInstagram, cuentaLinkedIn, comentarios } = req.body;
        if (!nombreApellido) {
            return res.status(400).json({ error: 'El campo nombre y apellido es obligatorio' });
        }
        const nuevaCuenta = new Cuenta({ nombreApellido, descripcion, cuentaX, cuentaInstagram, cuentaLinkedIn, comentarios });
        await nuevaCuenta.save();
        res.status(201).json(nuevaCuenta);
    } catch (err) {
        console.error('Error al guardar la nueva cuenta:', err);
        res.status(500).json({ error: 'Error al guardar los cambios' });
    }
});

//Eliminar cuenta por ID
app.delete('/cuentas/:id', async (req, res) => {
    try {
        const cuentaEliminada = await Cuenta.findByIdAndDelete(req.params.id);
        if (!cuentaEliminada) {
            return res.status(404).json({ error: 'Cuenta no encontrada' });
        }
        res.json({ message: 'Cuenta eliminada' });
    } catch (err) {
        console.error('Error al eliminar cuenta:', err);
        res.status(500).json({ error: 'Error al eliminar la cuenta' });
    }
});

// Actualizar cuenta por ID
app.put('/cuentas/:id', async (req, res) => {
    try {
        const cuentaActualizada = await Cuenta.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!cuentaActualizada) {
            return res.status(404).json({ error: 'Cuenta no encontrada' });
        }
        res.json(cuentaActualizada);
    } catch (err) {
        console.error('Error al actualizar cuenta:', err);
        res.status(500).json({ error: 'Error al actualizar la cuenta' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en puerto ${PORT}`);
});