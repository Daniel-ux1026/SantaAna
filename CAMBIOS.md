# Registro de cambios — Iglesia del Nazareno Santa Ana

Documento con todos los cambios realizados en el rediseño y mejoras del proyecto web.

**Fecha de referencia:** junio 2026  
**Stack:** Node.js, Express.js, SQLite, HTML5, CSS3, JavaScript, Bootstrap 5

---

## Resumen ejecutivo

El sitio público fue rediseñado por completo (diseño moderno, responsive, SEO y accesibilidad). Se mantuvo la funcionalidad original del formulario y la base de datos SQLite. Se añadió un panel administrativo protegido con inicio de sesión y se actualizó la información de contacto de la iglesia.

---

## 1. Rediseño del sitio público

### 1.1 Diseño visual

- Paleta de colores aplicada:
  - Primary: `#2563EB`
  - Secondary: `#F59E0B`
  - Dark: `#0F172A`
  - Light: `#F8FAFC`
  - White: `#FFFFFF`
- Tipografías: **Poppins** (títulos) e **Inter** (cuerpo)
- Diseño minimalista, mobile-first y responsive
- Variables CSS en `:root` para mantenimiento centralizado

### 1.2 Hero principal

- Sección a pantalla completa (`100vh`)
- Título: *Bienvenido a la Iglesia del Nazareno Santa Ana*
- Subtítulo: *Un lugar para crecer en Cristo, servir con amor y transformar vidas.*
- Botones: **Ver Horarios** y **Petición de Oración**
- Imagen de fondo: `img/cultos.png` con overlay oscuro degradado
- Animaciones suaves de entrada (`fadeUp`), respetando `prefers-reduced-motion`

### 1.3 Navbar

- Navbar fija (`fixed-top`) con efecto al hacer scroll (clase `.scrolled`)
- Enlaces: Inicio, Nosotros, Ministerios, Horarios, Sermones, Eventos, Contacto
- Menú hamburguesa en móvil (Bootstrap 5)
- Resaltado del enlace activo según la sección visible
- Logo + texto “Santa Ana” en la marca

### 1.4 Secciones de contenido

| Sección | Cambio |
|---------|--------|
| **Sobre Nosotros** | Texto original conservado; modales reemplazados por tarjeta moderna con icono |
| **Visión** | Texto original conservado; diseño tipo card con imagen `junta.png` |
| **Misión** | Texto original conservado; diseño tipo card con imagen `local.png` |
| **Versículo del día** | Nueva sección destacada — Juan 3:16 |
| **Ministerios** | Nueva sección con 6 tarjetas: Niños, Jóvenes, Mujeres, Varones, Matrimonios, Misiones |
| **Horarios** | Tabla HTML reemplazada por tarjetas; corregidos errores de etiquetas `<tr>` en el HTML original |
| **Galería** | Nueva galería responsive con imágenes de `public/img/` y lightbox |
| **Sermones** | Sección preparada (placeholder para contenido futuro) |
| **Eventos** | Sección preparada (placeholder con enlace a horarios) |
| **Formulario** | Rediseño visual; campos teléfono y correo añadidos (opcionales) |
| **Contacto** | Nueva sección con dirección, teléfono/WhatsApp y petición de oración |

### 1.5 Footer

- Enlaces a Facebook y WhatsApp
- Icono de teléfono (sin YouTube — la iglesia no tiene canal)
- Dirección y copyright © 2026

### 1.6 WhatsApp flotante

- Botón fijo en esquina inferior derecha
- Enlace: `https://wa.me/51976580918`

### 1.7 Accesibilidad (WCAG AA)

- Enlace “Saltar al contenido”
- Atributos ARIA en navegación, galería y formulario
- Estados `:focus-visible` visibles
- Textos alternativos en imágenes
- Soporte de movimiento reducido

### 1.8 Rendimiento

- `loading="lazy"` en imágenes fuera del hero
- Scripts con atributo `defer`
- `preconnect` a Google Fonts

---

## 2. Formulario e interacción (frontend)

### Archivo: `public/js/script.js`

- Envío por `fetch` a `POST /submit` (sin recargar página) — **sin cambios en el contrato obligatorio**
- Validación de nombre y apellidos (requeridos)
- Validación opcional de teléfono y correo
- Mensajes con **toasts de Bootstrap** (eliminado `alert()`)
- Estado de carga en el botón enviar (spinner)
- Navbar: scroll, enlace activo, cierre del menú móvil
- Galería: lightbox con tecla Escape y clic fuera
- Navegación suave entre anclas

---

## 3. Backend (`server.js`)

### 3.1 Funcionalidad preservada

- Express sirve archivos estáticos desde `public/`
- Ruta `GET /` → `index.html`
- `POST /submit` guarda **nombre** y **apellidos** (obligatorios)
- Base de datos: `participants.db` (SQLite)
- Compatible con registros existentes

### 3.2 Base de datos — migración

- Tabla original: `participants (nombre, apellidos)`
- Columnas añadidas sin borrar datos:
  - `telefono` (TEXT, opcional)
  - `correo` (TEXT, opcional)
  - `created_at` (TEXT, fecha de registro)
- Migración secuencial al iniciar el servidor

### 3.3 Panel administrativo — API

| Método | Ruta | Descripción | Protegida |
|--------|------|-------------|-----------|
| GET | `/admin` | Panel principal | Sí |
| GET | `/admin/login` | Página de inicio de sesión | No |
| POST | `/api/admin/login` | Autenticación | No |
| POST | `/api/admin/logout` | Cerrar sesión | No |
| GET | `/api/admin/session` | Estado de sesión | No |
| GET | `/api/admin/stats` | Total de inscritos | Sí |
| GET | `/api/admin/participants` | Lista de participantes | Sí |

### 3.4 Seguridad del panel

- Módulo: `lib/admin-auth.js`
- Contraseña almacenada como hash **bcrypt** en `.env` (`ADMIN_PASSWORD_HASH`)
- Sesiones con **express-session** (cookie `httpOnly`, `sameSite: strict`, 2 horas)
- Bloqueo temporal tras 5 intentos fallidos (15 minutos)
- HTML del panel en carpeta `private/` (no accesible como archivo estático directo)
- Bloqueo de rutas `/admin.html` y `/admin-login.html` en carpeta pública

### 3.5 Variables de entorno (`.env`)

```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=<hash bcrypt>
SESSION_SECRET=<cadena aleatoria 32+ caracteres>
```

- Archivo `.env` ignorado por Git (`.gitignore`)
- Plantilla: `.env.example`

### 3.6 Script de configuración

- `scripts/set-admin-password.js` — genera hash y guarda `.env`
- Comando npm: `npm run setup-admin` (requiere contraseña como argumento)
- Contraseña configurada para la iglesia: definida mediante el script (mínimo 10 caracteres)

---

## 4. Archivos nuevos

| Archivo | Descripción |
|---------|-------------|
| `public/css/styles.css` | Estilos completos del sitio (reescrito) |
| `public/js/script.js` | Lógica frontend del sitio (reescrito) |
| `public/index.html` | Página principal (reescrita) |
| `public/css/admin.css` | Estilos del panel y login |
| `public/js/admin.js` | Lógica del panel (datos protegidos) |
| `public/js/admin-login.js` | Lógica del formulario de login |
| `private/admin.html` | Vista del panel administrativo |
| `private/admin-login.html` | Vista de inicio de sesión |
| `lib/admin-auth.js` | Middleware y utilidades de autenticación |
| `scripts/set-admin-password.js` | Configuración de contraseña admin |
| `.env.example` | Plantilla de variables de entorno |
| `public/robots.txt` | Instrucciones para buscadores |
| `public/sitemap.xml` | Mapa del sitio |
| `CAMBIOS.md` | Este documento |

---

## 5. Archivos modificados

| Archivo | Cambio principal |
|---------|------------------|
| `server.js` | Migración DB, rutas admin, autenticación, dotenv |
| `package.json` | Dependencias: `bcryptjs`, `dotenv`, `express-session`; script `setup-admin` |

---

## 6. Archivos eliminados o movidos

| Antes | Después |
|-------|---------|
| `public/admin.html` | Eliminado → movido a `private/admin.html` (protegido) |

---

## 7. SEO

- Meta description
- Open Graph (Facebook, etc.)
- Twitter Cards
- `link rel="canonical"`
- `public/robots.txt` — permite `/`, bloquea `/admin`
- `public/sitemap.xml` — URL principal (actualizar dominio al publicar)

> **Nota:** En meta tags y sitemap se usa el dominio placeholder `iglesianazarenosantaana.org`. Cámbialo por el dominio real al desplegar en producción.

---

## 8. Información de contacto actualizada

| Dato | Valor |
|------|--------|
| **Dirección** | San Fernando #174, Chiclayo, Perú |
| **Teléfono / WhatsApp** | 976 580 918 (`+51 976 580 918`) |
| **YouTube** | No aplica — enlace eliminado del sitio |
| **Facebook** | URL original conservada |

---

## 9. Dependencias npm añadidas

```json
"bcryptjs": "^3.0.3",
"dotenv": "^17.4.2",
"express-session": "^1.19.0"
```

Las dependencias originales (`express`, `sqlite3`, `body-parser`, `xlsx`, `exceljs`) se mantienen.

---

## 10. Cómo ejecutar el proyecto

```bash
# Instalar dependencias (si es necesario)
npm install

# Configurar contraseña del panel (solo la primera vez o al cambiarla)
node scripts/set-admin-password.js "TuContraseña"

# Iniciar servidor
node server.js
# o
npm start
```

- **Sitio público:** http://localhost:3000  
- **Panel admin:** http://localhost:3000/admin  
- **Login admin:** http://localhost:3000/admin/login  

**Credenciales por defecto:**

- Usuario: `admin`
- Contraseña: la definida con `set-admin-password.js` (configurada como `Biblia123456` para la iglesia)

---

## 11. Funcionalidades que NO se modificaron / rompieron

- Guardado en SQLite (`participants.db`)
- Endpoint `POST /submit` con nombre y apellidos obligatorios
- Bootstrap 5
- Imágenes existentes en `public/img/`
- Compatibilidad con Node.js (probado en entorno del proyecto)
- Servidor Express y estructura general del proyecto

---

## 12. Mejoras futuras sugeridas (no implementadas)

- Exportar participantes a Excel desde el panel
- Filtros y búsqueda en la lista de inscritos
- Gráficos de inscripciones
- Contenido real en secciones Sermones y Eventos
- HTTPS en producción (`NODE_ENV=production` para cookie segura)
- Cambiar `SESSION_SECRET` y contraseña admin periódicamente
- Autenticación de dos factores (opcional)

---

## 13. Estructura del proyecto (actual)

```
SantaAna-main/
├── server.js
├── package.json
├── participants.db
├── participants.xlsx
├── .env                    # No subir a Git (credenciales)
├── .env.example
├── CAMBIOS.md              # Este archivo
├── lib/
│   └── admin-auth.js
├── scripts/
│   └── set-admin-password.js
├── private/                # No servido públicamente
│   ├── admin.html
│   └── admin-login.html
└── public/
    ├── index.html
    ├── robots.txt
    ├── sitemap.xml
    ├── css/
    │   ├── styles.css
    │   └── admin.css
    ├── js/
    │   ├── script.js
    │   ├── admin.js
    │   └── admin-login.js
    └── img/
        ├── cultos.png
        ├── enseñanza.png
        ├── horario.png
        ├── junta.png
        ├── local.png
        ├── logo.png
        └── reverendo.png
```

---

*Documento generado para la Iglesia del Nazareno Santa Ana — Chiclayo, Perú.*
