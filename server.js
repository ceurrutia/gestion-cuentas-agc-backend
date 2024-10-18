const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const Cuenta = require('./models/cuenta');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());


// Conexión con DDBB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Conectado a MongoDB'))
    .catch(err => console.log('Error al conectar con MongoDB:', err));

app.use(cors({
    origin: 'https://gestion-cuentas-agc-frontend-apktwvaot.vercel.app',  
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']  
}));

// Rutas
// Toodas las cuentas
app.get('/cuentas', async (req, res) => {
    try {
        const cuentas = await Cuenta.find();
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

// Crear una nueva cuenta
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

// Eliminar una cuenta por ID
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

//put

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



// BUSCADR POR nombre y apellido
app.get('/cuentas', async (req, res) => {
    const nombreApellido = req.query.nombreApellido;
    try {
        const cuentas = await Cuenta.find({ 
            // Coincidir las primeras letras, ojo
            nombreApellido: { $regex: `^${nombreApellido}`, $options: 'i' } 
        }); 
        res.json(cuentas);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener las cuentas' });
    }
});



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en puerto ${PORT}`);
});
