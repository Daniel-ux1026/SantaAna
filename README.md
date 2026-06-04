# Iglesia del Nazareno Santa Ana

Sitio web oficial de la **Iglesia del Nazareno Santa Ana** (Chiclayo, Perú). Plataforma moderna para presentar la iglesia, conectar con la comunidad y gestionar inscripciones de participantes.

**Repositorio:** [github.com/Daniel-ux1026/SantaAna](https://github.com/Daniel-ux1026/SantaAna)

---

## ¿De qué trata el proyecto?

Es una **página web institucional y funcional** para una iglesia cristiana evangélica (tradición del Nazareno). Combina:

- Un **sitio público** informativo y acogedor (horarios, ministerios, visión, misión, galería, contacto).
- Un **formulario de registro** para personas que desean integrarse o dejar sus datos.
- Un **panel administrativo privado** para que el equipo de la iglesia consulte quién se ha inscrito.

El tono visual busca transmitir **esperanza, comunidad, profesionalismo y fe**, con un diseño limpio inspirado en sitios modernos de organizaciones cristianas.

---

## ¿Para qué se hizo?

- Dar a la iglesia una **presencia digital profesional** acorde a su misión.
- Facilitar que visitantes conozcan **horarios, ministerios y valores** sin depender solo de redes sociales.
- **Centralizar inscripciones** del formulario en una base de datos local (SQLite).
- Permitir al equipo **consultar inscritos** de forma ordenada y segura (panel `/admin`).
- Mejorar **contacto directo** (WhatsApp, teléfono, dirección física).

---

## ¿Qué problemas soluciona?

| Antes | Ahora |
|-------|--------|
| Diseño básico y poco adaptable a móviles | Sitio **responsive**, mobile-first |
| Información en modales poco cómodos | Contenido en **tarjetas** legibles |
| Horarios en tabla con errores HTML | **Tarjetas de horarios** claras |
| Solo nombre y apellidos en backend | También **teléfono y correo** (opcionales), preparados en BD |
| Mensajes con `alert()` | **Notificaciones toast** elegantes |
| Sin panel de gestión seguro | **Admin con login** y contraseña cifrada (bcrypt) |
| Poca visibilidad en buscadores | **SEO** (meta tags, Open Graph, sitemap, robots.txt) |
| Sin galería ni secciones de ministerios | **Galería con lightbox** y sección de **ministerios** |

---

## Tecnologías utilizadas

### Backend

| Tecnología | Uso |
|------------|-----|
| [Node.js](https://nodejs.org/) | Entorno de ejecución |
| [Express.js](https://expressjs.com/) | Servidor HTTP y API REST |
| [SQLite](https://www.sqlite.org/) | Base de datos (`participants.db`) |
| [bcryptjs](https://www.npmjs.com/package/bcryptjs) | Hash de contraseña del panel admin |
| [express-session](https://www.npmjs.com/package/express-session) | Sesiones seguras del administrador |
| [dotenv](https://www.npmjs.com/package/dotenv) | Variables de entorno (`.env`) |

### Frontend

| Tecnología | Uso |
|------------|-----|
| HTML5 | Estructura semántica |
| CSS3 | Estilos personalizados y variables de diseño |
| JavaScript (vanilla) | Formulario, galería, navbar, toasts |
| [Bootstrap 5](https://getbootstrap.com/) | Grid, componentes y utilidades |
| [Bootstrap Icons](https://icons.getbootstrap.com/) | Iconografía |
| Google Fonts (**Poppins**, **Inter**) | Tipografía |

### Herramientas y otros

- **body-parser** — JSON en peticiones POST  
- **xlsx / exceljs** — Dependencias presentes para futura exportación de datos  
- **GitHub Actions** — Workflow de despliegue (`.github/workflows/deploy.yml`)

---

## Implementado hasta ahora

### Sitio público

- Hero a pantalla completa con imagen de culto y llamados a la acción  
- Navbar sticky con menú hamburguesa y efecto al scroll  
- Secciones: Sobre Nosotros, Visión, Misión, Versículo del día (Juan 3:16)  
- Ministerios: Niños, Jóvenes, Mujeres, Varones, Matrimonios, Misiones  
- Horarios en tarjetas (Lunes–Domingo)  
- Galería responsive con lightbox  
- Secciones preparadas: Sermones y Eventos (placeholder)  
- Formulario de registro con validación y envío AJAX  
- Contacto, footer con redes y botón flotante de WhatsApp  
- Accesibilidad (WCAG AA): skip link, ARIA, foco visible  
- SEO: meta description, Open Graph, Twitter Cards, `robots.txt`, `sitemap.xml`  

### Backend y datos

- `POST /submit` — guarda nombre y apellidos (obligatorios), teléfono y correo (opcionales)  
- Migración automática de columnas en SQLite sin perder datos antiguos  
- Registro de fecha (`created_at`) por inscripción  

### Panel administrativo (`/admin`)

- Inicio de sesión en `/admin/login`  
- Contraseña almacenada como hash bcrypt (archivo `.env`, no sube a Git)  
- Bloqueo temporal tras intentos fallidos de login  
- Vista de total de inscritos y tabla de participantes  
- Cierre de sesión  
- APIs protegidas: `/api/admin/stats`, `/api/admin/participants`  

### Documentación

- `CAMBIOS.md` — registro detallado de todos los cambios del rediseño  

---

## Previsto a futuro

- [ ] Contenido real en **Sermones** (audio/video o enlaces)  
- [ ] **Calendario de eventos** dinámico  
- [ ] **Exportar inscritos** a Excel desde el panel  
- [ ] Filtros y búsqueda en la lista de participantes  
- [ ] Gráficos de inscripciones por fecha  
- [ ] Registro de accesos al panel admin  
- [ ] Ajustar workflow de GitHub Pages / despliegue del servidor Node en producción  
- [ ] Dominio propio y HTTPS en producción  

---

## Información de la iglesia

| | |
|--|--|
| **Dirección** | San Fernando #174, Chiclayo, Perú |
| **Teléfono / WhatsApp** | 976 580 918 |
| **Facebook** | [Iglesia del Nazareno Santa Ana](https://www.facebook.com/p/Iglesia-del-Nazareno-Santa-Ana-100066810976376/) |

---

## Instalación y uso local

### Requisitos

- Node.js 18+ (recomendado 20+)
- npm

### Pasos

```bash
# Clonar el repositorio
git clone https://github.com/Daniel-ux1026/SantaAna.git
cd SantaAna

# Instalar dependencias
npm install

# Configurar contraseña del panel (mínimo 10 caracteres)
node scripts/set-admin-password.js "TuContraseñaSegura"

# Iniciar servidor
npm start
```

### URLs locales

| Ruta | Descripción |
|------|-------------|
| http://localhost:3000 | Sitio público |
| http://localhost:3000/admin | Panel administrativo (requiere login) |
| http://localhost:3000/admin/login | Inicio de sesión |

**Usuario admin por defecto:** `admin` (configurable en `.env` con `ADMIN_USERNAME`).

> El archivo `.env` no se sube a GitHub. En cada entorno (PC, servidor) debes ejecutar `set-admin-password.js` o crear `.env` manualmente a partir de `.env.example`.

---

## Estructura del proyecto

```
SantaAna/
├── server.js              # Servidor Express y APIs
├── package.json
├── participants.db        # Base de datos SQLite
├── .env.example           # Plantilla de variables de entorno
├── CAMBIOS.md             # Historial detallado de cambios
├── lib/
│   └── admin-auth.js      # Autenticación del panel
├── scripts/
│   └── set-admin-password.js
├── private/               # HTML del admin (no público directo)
│   ├── admin.html
│   └── admin-login.html
└── public/                # Sitio estático
    ├── index.html
    ├── css/
    ├── js/
    ├── img/
    ├── robots.txt
    └── sitemap.xml
```

---

## Variables de entorno

| Variable | Descripción |
|----------|-------------|
| `ADMIN_USERNAME` | Usuario del panel (por defecto `admin`) |
| `ADMIN_PASSWORD_HASH` | Hash bcrypt de la contraseña |
| `SESSION_SECRET` | Clave secreta para sesiones (mín. 32 caracteres) |
| `PORT` | Puerto del servidor (opcional, por defecto `3000`) |

---

## Scripts npm

| Comando | Acción |
|---------|--------|
| `npm start` | Inicia el servidor (`node server.js`) |
| `npm run setup-admin` | Atajo para configurar contraseña (requiere argumento; ver script) |

---

## Autor y licencia

- **Autor del proyecto:** Daniel (`package.json`)  
- **Licencia:** ISC  

---

## Documentación adicional

Para el listado completo de cambios técnicos del rediseño, consulta **[CAMBIOS.md](./CAMBIOS.md)**.
