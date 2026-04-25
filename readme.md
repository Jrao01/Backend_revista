#  Backend - Revista Científica UNERG

Este repositorio contiene el backend para el sistema de gestión de revistas científicas de la **Universidad Nacional Experimental de los Llanos Rómulo Gallegos (UNERG)**. La plataforma está diseñada para automatizar y gestionar el ciclo de vida completo de un artículo científico, desde su recepción hasta su publicación final.

---

## Tecnologías Utilizadas

- **Entorno de Ejecución:** Node.js
- **Framework Web:** Express.js
- **Base de Datos:** SQLite3 (para desarrollo local)
- **ORM:** Sequelize
- **Autenticación:** JSON Web Tokens (JWT) & Bcrypt
- **Gestión de Archivos:** Multer

---

## Estado de Endpoints y Funcionalidad

| Módulo | Endpoint | Método | Funcionalidad | Estado |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `/api/usuarios/registro` | `POST` | Registro de nuevos usuarios | ✅ Listo |
| | `/api/usuarios/login` | `POST` | Login y obtención de JWT | ✅ Listo |
| | `/api/usuarios/:id` | `GET` | Perfil + Artículos del autor | ✅ Listo |
| **Academia** | `/api/areas`, `/api/programas`, `/api/lineas` | `GET/POST/PUT` | Gestión de estructura UNERG | ✅ Listo |
| **Revistas** | `/api/revistas` | `GET/POST/PUT` | Gestión de cabeceras de revistas | ✅ Listo |
| **Artículos** | `/api/articulos/registrar` | `POST` | Envío inicial con 5 archivos | ✅ Listo |
| | `/api/articulos/:id` | `GET` | Detalle del artículo + Archivos | ✅ Listo |
| | `/api/articulos/:id` | `PUT` | Edición de metadatos básicos | ✅ Listo |

> [!NOTE]
> Para ver el detalle completo de los requerimientos funcionales y reglas de negocio por perfil, consulta el archivo [requerimientos.md](./requerimientos.md).

---

# Asignación de Tareas del Equipo

### **Julian**

*   creacion de Archivos de test de flujos completos para deteccion de errores temprana

### **Ponce**
*   **Dockerización (Tarea prioritaria):**
    *   **Acción:** Crear el `Dockerfile` y `docker-compose.yml` para asegurar que el entorno de desarrollo sea idéntico para todo el equipo.
*   **Módulo de Ediciones:** CRUD de `NumeroRevista` y vinculación de artículos.
*   **Módulo de Colaboración:** Gestión de `AutorSecundario`.

### **Mark**
*   **Workflow Editorial:** Desk Review, informes de plagio y anonimización de manuscritos.
*   **Arbitraje:** Lógica de asignación de jurados ciegos.

### **Kelvin**
*   **Módulo de Jurados:** Registro de evaluaciones y veredictos.
*   **Producción:** Carga de galeradas finales (PDF/XML/HTML) y asignación de DOI.
*   **Discusiones:** Panel de mensajería interna entre roles.

---

## Instalación y Uso

### 1. Clonar el repositorio
```bash
git clone https://github.com/Jrao01/Backend_revista.git
cd backend
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Iniciar el servidor
```bash
node index.js
```
*El servidor corre en el puerto 3000 por defecto. La base de datos se encuentra en `config/database.sqlite`.*

---

## Pruebas (Testing)

Para ejecutar el flujo completo de prueba (Registro -> Artículo -> Perfil):
```bash
node tests/scripts/test_full_flow.js
```

---

## Estructura del Proyecto

```text
backend/
├── config/             # Configuración de DB y Variables
├── controllers/        # Lógica de los endpoints
├── middlewares/        # Middlewares de Auth y Uploads
├── models/             # Modelos de Sequelize
├── routes/             # Definición de rutas de la API
├── tests/              # Scripts y archivos de prueba
├── uploads/            # Archivos físicos subidos
└── index.js            # Punto de entrada de la aplicación
```
