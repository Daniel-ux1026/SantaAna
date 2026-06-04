/**
 * Iglesia del Nazareno Santa Ana — Frontend principal
 * Mantiene envío a /submit (nombre + apellidos obligatorios)
 */

document.addEventListener('DOMContentLoaded', function () {
    initNavbar();
    initForm();
    initGallery();
    initSmoothNav();
});

/* ---------- Navbar scroll ---------- */
function initNavbar() {
    const navbar = document.getElementById('mainNavbar');
    if (!navbar) return;

    const onScroll = () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Resaltar enlace activo
    const sections = document.querySelectorAll('section[id]');
    const navLinks = navbar.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach((section) => {
            const top = section.offsetTop - 120;
            if (window.scrollY >= top) current = section.getAttribute('id');
        });
        navLinks.forEach((link) => {
            link.classList.toggle('active', link.getAttribute('href') === '#' + current);
        });
    }, { passive: true });

    // Cerrar menú móvil al hacer clic
    navLinks.forEach((link) => {
        link.addEventListener('click', () => {
            const collapse = document.getElementById('navbarNav');
            if (collapse && collapse.classList.contains('show')) {
                bootstrap.Collapse.getOrCreateInstance(collapse).hide();
            }
        });
    });
}

/* ---------- Navegación suave ---------- */
function initSmoothNav() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

/* ---------- Formulario ---------- */
function initForm() {
    const form = document.getElementById('contactForm');
    if (!form) {
        console.error('No se encontró el formulario con ID "contactForm".');
        return;
    }

    form.addEventListener('submit', async function (event) {
        event.preventDefault();
        clearValidation(form);

        const nombre = document.getElementById('nombre').value.trim();
        const apellidos = document.getElementById('apellidos').value.trim();
        const telefono = document.getElementById('telefono').value.trim();
        const correo = document.getElementById('correo').value.trim();

        let valid = true;

        if (!nombre) {
            setInvalid('nombre');
            valid = false;
        }
        if (!apellidos) {
            setInvalid('apellidos');
            valid = false;
        }
        if (telefono && !/^[\d\s+\-()]{7,20}$/.test(telefono)) {
            setInvalid('telefono');
            valid = false;
        }
        if (correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
            setInvalid('correo');
            valid = false;
        }

        if (!valid) {
            showToast('Revisa los campos marcados.', 'error');
            return;
        }

        const submitBtn = document.getElementById('submitBtn');
        const btnText = submitBtn.querySelector('.btn-text');
        const spinner = submitBtn.querySelector('.spinner-border');

        submitBtn.disabled = true;
        btnText.textContent = 'Enviando...';
        spinner.classList.remove('d-none');

        const formData = { nombre, apellidos };
        if (telefono) formData.telefono = telefono;
        if (correo) formData.correo = correo;

        try {
            const response = await fetch('/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await response.json();

            if (data.success) {
                showToast(data.message || '¡Registro exitoso! Gracias por unirte.', 'success');
                form.reset();
            } else {
                showToast(data.message || 'Error al enviar el formulario.', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showToast('Ocurrió un error al enviar el formulario. Intenta de nuevo.', 'error');
        } finally {
            submitBtn.disabled = false;
            btnText.textContent = 'Enviar';
            spinner.classList.add('d-none');
        }
    });
}

function setInvalid(fieldId) {
    const el = document.getElementById(fieldId);
    if (el) el.classList.add('is-invalid');
}

function clearValidation(form) {
    form.querySelectorAll('.is-invalid').forEach((el) => el.classList.remove('is-invalid'));
}

/* ---------- Toast (sin alert) ---------- */
function showToast(message, type) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const id = 'toast-' + Date.now();
    const isSuccess = type === 'success';
    const icon = isSuccess ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill';
    const title = isSuccess ? 'Éxito' : 'Atención';

    const html = `
        <div id="${id}" class="toast toast-custom ${type}" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header">
                <i class="bi ${icon} me-2" aria-hidden="true"></i>
                <strong class="me-auto">${title}</strong>
                <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Cerrar"></button>
            </div>
            <div class="toast-body">${message}</div>
        </div>`;

    container.insertAdjacentHTML('beforeend', html);
    const toastEl = document.getElementById(id);
    const toast = new bootstrap.Toast(toastEl, { delay: 5000 });
    toast.show();
    toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
}

/* ---------- Galería Lightbox ---------- */
function initGallery() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const closeBtn = lightbox?.querySelector('.lightbox-close');

    if (!lightbox || !lightboxImg) return;

    document.querySelectorAll('.gallery-item').forEach((item) => {
        item.addEventListener('click', () => {
            const src = item.dataset.full || item.querySelector('img')?.src;
            const alt = item.querySelector('img')?.alt || '';
            if (!src) return;
            lightboxImg.src = src;
            lightboxImg.alt = alt;
            lightbox.hidden = false;
            document.body.style.overflow = 'hidden';
            closeBtn.focus();
        });
    });

    function closeLightbox() {
        lightbox.hidden = true;
        lightboxImg.src = '';
        document.body.style.overflow = '';
    }

    closeBtn?.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !lightbox.hidden) closeLightbox();
    });
}
