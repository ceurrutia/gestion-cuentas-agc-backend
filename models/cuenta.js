const mongoose = require('mongoose');

const cuentaSchema = new mongoose.Schema({
    nombreApellido: { type: String, required: true },
    descripcion: String,
    cuentaX: String,
    cuentaInstagram: String,
    cuentaLinkedIn: String,
    comentarios: String
});

const Cuenta = mongoose.model('Cuenta', cuentaSchema);

module.exports = Cuenta;