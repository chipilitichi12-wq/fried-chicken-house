const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const path = require('path');

let serviceAccount;

if (process.env.FIREBASE_CONFIG) {
    // Si estamos en Render, leemos la variable de entorno
    serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG);
} else {
    // Si estamos en tu PC, leemos el archivo local
    serviceAccount = require('./firebase-key.json');
}

// Verifica si Firebase ya está inicializado para evitar el error
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

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
    const id = req.query.id; // Recibe el ID enviado desde el botón
    try {
        await db.collection('registros').doc(id).delete();
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
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

// Agrega esto en tu server.js junto a las otras rutas
app.get('/obtener-todos', async (req, res) => {
    try {
        const snapshot = await db.collection('registros').get();
        // Mapeamos para incluir el doc.id dentro del objeto
        const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(lista);
    } catch (error) {
        res.status(500).json({ error: "Error" });
    }
});
app.listen(3000, () => {
    console.log('Servidor listo en http://localhost:3000');
});
