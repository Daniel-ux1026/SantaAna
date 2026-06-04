const bcrypt = require('bcryptjs');

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;
const loginAttempts = new Map();

function getClientKey(req) {
    return req.ip || req.socket?.remoteAddress || 'unknown';
}

function isLockedOut(key) {
    const record = loginAttempts.get(key);
    if (!record) return false;
    if (Date.now() < record.lockedUntil) return true;
    if (record.lockedUntil && Date.now() >= record.lockedUntil) {
        loginAttempts.delete(key);
    }
    return false;
}

function recordFailedAttempt(key) {
    const record = loginAttempts.get(key) || { count: 0, lockedUntil: 0 };
    record.count += 1;
    if (record.count >= MAX_ATTEMPTS) {
        record.lockedUntil = Date.now() + LOCKOUT_MS;
        record.count = 0;
    }
    loginAttempts.set(key, record);
}

function clearAttempts(key) {
    loginAttempts.delete(key);
}

function isAdminConfigured() {
    return Boolean(
        process.env.ADMIN_PASSWORD_HASH &&
        process.env.SESSION_SECRET &&
        process.env.SESSION_SECRET.length >= 32
    );
}

function requireAdmin(req, res, next) {
    if (!isAdminConfigured()) {
        const msg = 'Panel administrativo no configurado. Contacta al administrador del sistema.';
        if (req.path.startsWith('/api/')) {
            return res.status(503).json({ error: msg });
        }
        return res.status(503).send(msg);
    }
    if (req.session && req.session.admin === true) {
        return next();
    }
    if (req.path.startsWith('/api/')) {
        return res.status(401).json({ error: 'Sesión expirada o no autorizado' });
    }
    return res.redirect('/admin/login');
}

async function verifyLogin(username, password) {
    const expectedUser = process.env.ADMIN_USERNAME || 'admin';
    const hash = process.env.ADMIN_PASSWORD_HASH;

    if (!hash || username !== expectedUser) {
        return false;
    }

    return bcrypt.compare(password, hash);
}

module.exports = {
    requireAdmin,
    isAdminConfigured,
    verifyLogin,
    isLockedOut,
    recordFailedAttempt,
    clearAttempts,
    getClientKey,
};
