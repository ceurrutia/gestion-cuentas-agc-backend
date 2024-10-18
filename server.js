const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const Cuenta = require('./models/cuenta');

dotenv.config();

const app = express();
app.use(cors({
    origin: ['https://gestion-cuentas-agc-frontend-apktwvaot.vercel.app', 'http://localhost:5173'],  
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']  
}));
app.use(express.json());

// Conexión a la base de datos
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Conectado a MongoDB'))
    .catch(err => console.log('Error al conectar con MongoDB:', err));

// Rutas
app.get('/cuentas', async (req, res) => {
    const nombreApellido = req.query.nombreApellido;
    try {
        const query = nombreApellido 
            ? { nombreApellido: { $regex: `^${nombreApellido}`, $options: 'i' } } 
            : {};
        const cuentas = await Cuenta.find(query);
        res.json(cuentas);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener las cuentas' });
    }
});

app.get('/cuentas/:id', async (req, res) => {
    try {
        const cuenta = await Cuenta.findById(req.params.id);
        if (!cuenta) {
            return res.status(404).json({ error: 'Cuenta no encontrada' });
        }
        res.json(cuenta);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener la cuenta' });
    }
});

app.post('/cuentas', async (req, res) => {
    const { nombreApellido, descripcion, cuentaX, cuentaInstagram, cuentaLinkedIn, comentarios } = req.body;
    if (!nombreApellido) {
        return res.status(400).json({ error: 'El campo nombre y apellido es obligatorio' });
    }
    const nuevaCuenta = new Cuenta({ nombreApellido, descripcion, cuentaX, cuentaInstagram, cuentaLinkedIn, comentarios });
    try {
        await nuevaCuenta.save();
        res.status(201).json(nuevaCuenta);
    } catch (err) {
        res.status(500).json({ error: 'Error al guardar los cambios' });
    }
});

app.delete('/cuentas/:id', async (req, res) => {
    try {
        const cuentaEliminada = await Cuenta.findByIdAndDelete(req.params.id);
        if (!cuentaEliminada) {
            return res.status(404).json({ error: 'Cuenta no encontrada' });
        }
        res.json({ message: 'Cuenta eliminada' });
    } catch (err) {
        res.status(500).json({ error: 'Error al eliminar la cuenta' });
    }
});

app.put('/cuentas/:id', async (req, res) => {
    try {
        const cuentaActualizada = await Cuenta.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!cuentaActualizada) {
            return res.status(404).json({ error: 'Cuenta no encontrada' });
        }
        res.json(cuentaActualizada);
    } catch (err) {
        res.status(500).json({ error: 'Error al actualizar la cuenta' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en puerto ${PORT}`);
});
