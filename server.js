const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(bodyParser.json());

// Servir los archivos estáticos desde la raíz
app.use(express.static(path.join(__dirname)));

// Ruta principal para servir `index.html`
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Conexión a la base de datos SQLite
const db = new sqlite3.Database('./participants.db', (err) => {
    if (err) {
        console.error('Error abriendo la base de datos', err);
    } else {
        db.run('CREATE TABLE IF NOT EXISTS participants (nombre TEXT, apellidos TEXT)');
    }
});

// Manejar la solicitud POST para registrar participantes
app.post('/submit', (req, res) => {
    const { nombre, apellidos } = req.body;

    console.log("Datos recibidos:", nombre, apellidos);

    if (!nombre || !apellidos) {
        return res.json({ success: false, message: 'Nombre y apellidos son requeridos' });
    }

    db.run('INSERT INTO participants (nombre, apellidos) VALUES (?, ?)', [nombre, apellidos], (err) => {
        if (err) {
            console.error('Error al insertar en la base de datos', err);
            return res.json({ success: false, message: 'Error al guardar en la base de datos' });
        }

        console.log('Datos insertados correctamente en la base de datos');
        return res.json({ success: true, message: 'Datos guardados correctamente' });
    });
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
