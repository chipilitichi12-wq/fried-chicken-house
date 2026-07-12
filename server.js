const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const path = require('path');

const serviceAccount = require('./firebase-key.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Ruta para buscar en Firestore
app.get('/buscar', async (req, res) => {
    try {
        const dni = req.query.dni;
        const doc = await db.collection('registros').doc(dni).get();

        if (!doc.exists) {
            return res.json({ error: "No encontrado" });
        }
        res.json(doc.data());
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Ruta para eliminar cliente en Firestore
app.get('/eliminar', async (req, res) => {
    try {
        const dni = req.query.dni;
        await db.collection('registros').doc(dni).delete();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Ruta POST para guardar datos
app.post('/guardar', async (req, res) => {
    try {
        const { email, nombre, apellido, edad, ciudad, direccion, celular, dni } = req.body;

        await db.collection('registros').doc(dni).set({
            email, nombre, apellido, edad, ciudad, direccion, celular, dni,
            fechaRegistro: new Date().toLocaleString()
        });

        res.send("<h1>¡Registro exitoso!</h1><a href='/'>Volver al inicio</a>");
    } catch (err) {
        res.status(500).send("Error: " + err.message);
    }
});

app.listen(3000, () => {
    console.log('Servidor listo en http://localhost:3000');
});