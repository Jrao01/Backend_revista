#  Backend - Revista Científica UNERG

Este repositorio contiene el backend para el sistema de gestión de revistas científicas de la **Universidad Nacional Experimental de los Llanos Rómulo Gallegos (UNERG)**. La plataforma automatiza el ciclo de vida de un artículo científico, desde su recepción hasta su publicación final.

---

## Tecnologías Utilizadas

- **Entorno de Ejecución:** Node.js (v18+)
- **Framework Web:** Express.js
- **Base de Datos:** SQLite3 (vía Sequelize ORM)
- **Autenticación:** JSON Web Tokens (JWT) & Bcrypt
- **Gestión de Archivos:** Multer
- **Contenerización:** Docker & Docker Compose

---

## Instalación y Encendido (Docker)

La forma más rápida de poner en marcha el proyecto es utilizando Docker.

### 1. Clonar y Entrar
```bash
git clone https://github.com/Jrao01/Backend_revista.git
cd backend
```

### 2. Configurar Variables de Entorno
Crea un archivo `.env` en la raíz del proyecto (o copia el `.env.example`):
```bash
PORT=3000
JWT_SECRET=tu_secreto_super_seguro
```

### 3. Levantar con Docker Compose
```bash
docker-compose up -d --build
```
*El servidor estará disponible en `http://localhost:3000`.*

#### Otros comandos de Docker:
- **Apagar el servidor:** `docker-compose down`
- **Reiniciar el servidor:** `docker-compose restart`
- **Ver logs en tiempo real:** `docker-compose logs -f`

---

## Documentación de API (Endpoints)

Todos los endpoints base son prefijados por `/api`. Las rutas protegidas requieren el header:  
`Authorization: Bearer <TU_TOKEN_JWT>`

### Autenticación y Usuarios (`/api/usuarios`)

| Método | Ruta | Descripción | Parámetros (Body JSON) | Protegida |
| :--- | :--- | :--- | :--- | :---: |
| `POST` | `/registro` | Registro de usuario | `nombre`, `apellido`, `correo`, `password`, `rol`, `orcid`, `afiliacion_institucional` | No |
| `POST` | `/login` | Inicio de sesión | `correo`, `password` | No |
| `GET` | `/` | Estado del servicio | - | Sí |
| `GET` | `/:id` | Ver perfil completo | - | Sí |
| `PUT` | `/:id` | Actualizar datos | `nombre`, `apellido`, `correo`, `orcid`, `afiliacion_institucional` | Sí |

---

### Gestión de Artículos (`/api/articulos`)

#### 1. Registro de Artículo (`POST /registrar`)
Requiere `multipart/form-data`.

**Campos de Formulario (Text):**
- `revista_id`, `programa_id`, `linea_id`: IDs numéricos.
- `titulo_es`, `titulo_en`: Títulos.
- `resumen_es`, `resumen_en`: Resúmenes.
- `palabras_clave`: String.
- `es_anonimo`: "true" / "false".
- `contenido_estructurado`: (Opcional) Objeto JSON con la estructura del artículo.

**Archivos (File):**
- `manuscrito_original` (Obligatorio), `pagina_titulo`, `carta_originalidad`, `ficha_autores`, `material_suplementario`.

#### 2. Otros Endpoints de Artículos

| Método | Ruta | Descripción | Parámetros |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Listar todos los artículos | - |
| `GET` | `/:id` | Detalle de un artículo | ID en URL. Incluye metadatos y lista de archivos. |
| `PUT` | `/:id` | Editar metadatos | `titulo_es`, `resumen_es`, `linea_id`, `contenido_estructurado`, etc. |
| `POST` | `/:id/archivos` | Subir archivo adicional | `archivo` (file), `tipo_archivo` (text), `version` (text). |

---

### Estructura Académica (`/api/areas`, `/api/programas`, `/api/lineas`)

| Método | Ruta | Descripción | Body (JSON) |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Listar elementos | - |
| `POST` | `/` | Crear nuevo | **Áreas:** `nombre`, `color_institucional`. <br> **Prog:** `nombre`, `area_id`. <br> **Líneas:** `nombre`, `area_id`, `tipo`. |
| `PUT` | `/:id` | Actualizar | Campos mencionados arriba según el módulo. |

---

### Gestión de Revistas (`/api/revistas`)

| Método | Ruta | Descripción | Body (JSON) |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Listar revistas | - |
| `POST` | `/` | Crear revista | `nombre`, `issn`, `periodicidad` (semestral/anual), `descripcion`. |
| `PUT` | `/:id` | Actualizar revista | `nombre`, `issn`, `periodicidad`, `descripcion`. |

---

## Pruebas (Testing)

**Desde el contenedor Docker:**
```bash
docker exec -it revista_backend node tests/scripts/test_full_flow.js
```

---

## Estructura del Proyecto

- `controllers/`: Lógica de negocio (Sequelize queries).
- `models/`: Definición de tablas y relaciones.
- `routes/`: Definición de rutas Express.
- `middlewares/`: JWT Auth y Multer (Uploads).
- `uploads/`: Carpeta física de documentos (ignorada por Git).
