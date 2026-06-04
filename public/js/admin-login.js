document.addEventListener('DOMContentLoaded', () => {
    checkSession();
    document.getElementById('loginForm')?.addEventListener('submit', handleLogin);
});

async function checkSession() {
    try {
        const res = await fetch('/api/admin/session', { credentials: 'same-origin' });
        const data = await res.json();
        if (data.authenticated) {
            window.location.href = '/admin';
            return;
        }
        if (!data.configured) {
            const alertEl = document.getElementById('loginAlert');
            alertEl.textContent =
                'El panel aún no está configurado. En el servidor ejecuta: node scripts/set-admin-password.js "TuContraseñaSegura"';
            alertEl.className = 'alert alert-warning';
            alertEl.classList.remove('d-none');
            document.getElementById('loginForm')?.querySelectorAll('input, button').forEach((el) => {
                el.disabled = true;
            });
        }
    } catch {
        /* ignorar */
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const alertEl = document.getElementById('loginAlert');
    const btn = document.getElementById('loginBtn');
    const label = btn.querySelector('.btn-label');
    const spinner = btn.querySelector('.spinner-border');

    alertEl.classList.add('d-none');

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    btn.disabled = true;
    label.textContent = 'Verificando...';
    spinner.classList.remove('d-none');

    try {
        const res = await fetch('/api/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({ username, password }),
        });
        const data = await res.json();

        if (res.ok && data.success) {
            window.location.href = '/admin';
            return;
        }

        alertEl.textContent = data.error || 'No se pudo iniciar sesión';
        alertEl.classList.remove('d-none');
    } catch {
        alertEl.textContent = 'Error de conexión con el servidor';
        alertEl.classList.remove('d-none');
    } finally {
        btn.disabled = false;
        label.textContent = 'Iniciar sesión';
        spinner.classList.add('d-none');
    }
}
