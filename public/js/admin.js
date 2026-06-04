const fetchOptions = { credentials: 'same-origin' };

document.addEventListener('DOMContentLoaded', async () => {
    const sessionOk = await ensureAuthenticated();
    if (!sessionOk) return;

    loadAdminData();
    document.getElementById('btnRefresh')?.addEventListener('click', loadAdminData);
    document.getElementById('btnLogout')?.addEventListener('click', handleLogout);
});

async function ensureAuthenticated() {
    try {
        const res = await fetch('/api/admin/session', fetchOptions);
        const data = await res.json();
        if (!data.authenticated) {
            window.location.href = '/admin/login';
            return false;
        }
        return true;
    } catch {
        window.location.href = '/admin/login';
        return false;
    }
}

async function handleLogout() {
    try {
        await fetch('/api/admin/logout', { method: 'POST', ...fetchOptions });
    } finally {
        window.location.href = '/admin/login';
    }
}

async function loadAdminData() {
    const loading = document.getElementById('loadingState');
    const errorState = document.getElementById('errorState');
    const tableWrapper = document.getElementById('tableWrapper');
    const tbody = document.getElementById('participantsBody');
    const emptyState = document.getElementById('emptyState');

    loading.classList.remove('d-none');
    errorState.classList.add('d-none');
    tableWrapper.classList.add('d-none');

    try {
        const [statsRes, listRes] = await Promise.all([
            fetch('/api/admin/stats', fetchOptions),
            fetch('/api/admin/participants', fetchOptions),
        ]);

        if (statsRes.status === 401 || listRes.status === 401) {
            window.location.href = '/admin/login';
            return;
        }

        if (!statsRes.ok || !listRes.ok) {
            throw new Error('Error al cargar datos del servidor');
        }

        const stats = await statsRes.json();
        const participants = await listRes.json();

        document.getElementById('totalInscritos').textContent = stats.total ?? 0;
        document.getElementById('lastUpdate').textContent = new Date().toLocaleString('es-PE');

        tbody.innerHTML = '';

        if (!participants.length) {
            emptyState.classList.remove('d-none');
        } else {
            emptyState.classList.add('d-none');
            participants.forEach((p, index) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${p.id ?? index + 1}</td>
                    <td>${escapeHtml(p.nombre)}</td>
                    <td>${escapeHtml(p.apellidos)}</td>
                    <td>${escapeHtml(p.telefono || '—')}</td>
                    <td>${escapeHtml(p.correo || '—')}</td>
                    <td>${escapeHtml(p.created_at || '—')}</td>
                `;
                tbody.appendChild(tr);
            });
        }

        tableWrapper.classList.remove('d-none');
    } catch (err) {
        console.error(err);
        errorState.textContent = 'No se pudieron cargar los datos. Verifica que el servidor esté en ejecución.';
        errorState.classList.remove('d-none');
    } finally {
        loading.classList.add('d-none');
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = String(text ?? '');
    return div.innerHTML;
}
