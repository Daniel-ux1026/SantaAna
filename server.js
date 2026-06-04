require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const {
    requireAdmin,
    isAdminConfigured,
    verifyLogin,
    isLockedOut,
    recordFailedAttempt,
    clearAttempts,
    getClientKey,
} = require('./lib/admin-auth');

const app = express();
const PUBLIC_DIR = path.join(__dirname, 'public');
const PRIVATE_DIR = path.join(__dirname, 'private');

app.set('trust proxy', 1);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(
    session({
        name: 'santaana.sid',
        secret: process.env.SESSION_SECRET || 'cambiar-en-produccion-minimo-32-caracteres',
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 2 * 60 * 60 * 1000,
        },
    })
);

// Bloquear acceso directo al HTML del panel en carpeta pública (si existiera)
app.get(['/admin.html', '/admin-login.html'], (req, res) => {
    res.status(404).send('No encontrado');
});

app.get('/', (req, res) => {
    res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

// --- Rutas del panel administrativo (protegidas) ---
app.get('/admin/login', (req, res) => {
    if (req.session && req.session.admin) {
        return res.redirect('/admin');
    }
    res.sendFile(path.join(PRIVATE_DIR, 'admin-login.html'));
});

app.post('/api/admin/login', async (req, res) => {
    if (!isAdminConfigured()) {
        return res.status(503).json({
            error: 'Panel no configurado. Ejecuta: node scripts/set-admin-password.js "TuContraseña"',
        });
    }

    const clientKey = getClientKey(req);
    if (isLockedOut(clientKey)) {
        return res.status(429).json({
            error: 'Demasiados intentos. Espera 15 minutos e inténtalo de nuevo.',
        });
    }

    const { username, password } = req.body || {};
    if (!username || !password) {
        return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
    }

    const valid = await verifyLogin(String(username).trim(), String(password));
    if (!valid) {
        recordFailedAttempt(clientKey);
        return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }

    clearAttempts(clientKey);
    req.session.admin = true;
    req.session.loginAt = Date.now();
    res.json({ success: true });
});

app.post('/api/admin/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.status(500).json({ error: 'No se pudo cerrar sesión' });
        res.clearCookie('santaana.sid');
        res.json({ success: true });
    });
});

app.get('/api/admin/session', (req, res) => {
    res.json({
        authenticated: Boolean(req.session && req.session.admin),
        configured: isAdminConfigured(),
    });
});

app.get('/admin', requireAdmin, (req, res) => {
    res.sendFile(path.join(PRIVATE_DIR, 'admin.html'));
});

app.get('/api/admin/stats', requireAdmin, (req, res) => {
    db.get('SELECT COUNT(*) AS total FROM participants', (err, row) => {
        if (err) return res.status(500).json({ error: 'Error al obtener estadísticas' });
        res.json({ total: row ? row.total : 0 });
    });
});

app.get('/api/admin/participants', requireAdmin, (req, res) => {
    db.all(
        `SELECT
            rowid AS id,
            nombre,
            apellidos,
            telefono,
            correo,
            COALESCE(created_at, '-') AS created_at
        FROM participants
        ORDER BY rowid DESC`,
        (err, rows) => {
            if (err) return res.status(500).json({ error: 'Error al listar participantes' });
            res.json(rows || []);
        }
    );
});

// Formulario público
app.post('/submit', (req, res) => {
    const { nombre, apellidos, telefono, correo } = req.body;

    console.log('Datos recibidos:', nombre, apellidos, telefono || '-', correo || '-');

    if (!nombre || !apellidos) {
        return res.json({ success: false, message: 'Nombre y apellidos son requeridos' });
    }

    const tel = telefono ? String(telefono).trim() : null;
    const email = correo ? String(correo).trim() : null;

    db.run(
        'INSERT INTO participants (nombre, apellidos, telefono, correo) VALUES (?, ?, ?, ?)',
        [nombre.trim(), apellidos.trim(), tel, email],
        function (err) {
            if (err) {
                console.error('Error al insertar en la base de datos', err);
                return res.json({ success: false, message: 'Error al guardar en la base de datos' });
            }
            console.log('Datos insertados correctamente en la base de datos');
            return res.json({ success: true, message: 'Datos guardados correctamente' });
        }
    );
});

// Archivos estáticos del sitio público
app.use(express.static(path.join(__dirname)));
app.use(express.static(PUBLIC_DIR));

// Conexión SQLite
const db = new sqlite3.Database('./participants.db', (err) => {
    if (err) {
        console.error('Error abriendo la base de datos', err);
        startServer();
    } else {
        initDatabase(startServer);
    }
});

function initDatabase(onReady) {
    db.run(
        'CREATE TABLE IF NOT EXISTS participants (nombre TEXT, apellidos TEXT)',
        (err) => {
            if (err) console.error('Error creando tabla', err);
            migrateColumns(() => {
                console.log('Base de datos lista');
                if (!isAdminConfigured()) {
                    console.warn(
                        'AVISO: Panel /admin sin proteger. Ejecuta: node scripts/set-admin-password.js "TuContraseña"'
                    );
                } else {
                    console.log('Panel administrativo: protegido con inicio de sesión');
                }
                onReady?.();
            });
        }
    );
}

function migrateColumns(done) {
    db.all('PRAGMA table_info(participants)', (err, columns) => {
        if (err) {
            console.error('Error leyendo esquema', err);
            return done?.();
        }
        const existing = (columns || []).map((c) => c.name);
        const pending = [
            { name: 'telefono', sql: 'ALTER TABLE participants ADD COLUMN telefono TEXT' },
            { name: 'correo', sql: 'ALTER TABLE participants ADD COLUMN correo TEXT' },
            { name: 'created_at', sql: 'ALTER TABLE participants ADD COLUMN created_at TEXT' },
        ].filter((col) => !existing.includes(col.name));

        let index = 0;
        function runNext() {
            if (index >= pending.length) return done?.();
            const col = pending[index++];
            db.run(col.sql, (alterErr) => {
                if (alterErr) console.error(`Migración ${col.name}:`, alterErr.message);
                runNext();
            });
        }
        runNext();
    });
}

const PORT = process.env.PORT || 3000;

function startServer() {
    app.listen(PORT, () => {
        console.log(`Servidor corriendo en http://localhost:${PORT}`);
        console.log(`Panel admin: http://localhost:${PORT}/admin`);
    });
}
