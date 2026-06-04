/**
 * Genera el hash de contraseña y guarda la configuración en .env
 * Uso: node scripts/set-admin-password.js "TuContraseñaSegura"
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const password = process.argv[2];
const envPath = path.join(__dirname, '..', '.env');

if (!password || password.length < 10) {
    console.error('Uso: node scripts/set-admin-password.js "ContraseñaMin10Caracteres"');
    console.error('La contraseña debe tener al menos 10 caracteres.');
    process.exit(1);
}

const username = process.env.ADMIN_USERNAME || 'admin';
const sessionSecret = crypto.randomBytes(32).toString('hex');
const hash = bcrypt.hashSync(password, 12);

let envContent = '';
if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
    envContent = envContent
        .replace(/^ADMIN_USERNAME=.*$/m, '')
        .replace(/^ADMIN_PASSWORD_HASH=.*$/m, '')
        .replace(/^SESSION_SECRET=.*$/m, '')
        .trim();
}

const lines = [
    envContent,
    `ADMIN_USERNAME=${username}`,
    `ADMIN_PASSWORD_HASH=${hash}`,
    `SESSION_SECRET=${sessionSecret}`,
].filter(Boolean);

fs.writeFileSync(envPath, lines.join('\n') + '\n', 'utf8');

console.log('Configuración guardada en .env');
console.log(`Usuario administrador: ${username}`);
console.log('Contraseña: la que acabas de definir (no se guarda en texto plano).');
console.log('Reinicia el servidor: node server.js');
