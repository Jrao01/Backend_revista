# 📄 Documento de Requerimientos Funcionales
## Plataforma de Gestión Editorial - UNERG

---

## 1. Introducción 🚀
Este documento define las funcionalidades, vistas y flujos lógicos para el sistema de gestión editorial de las revistas científicas de la **Universidad Nacional Experimental Rómulo Gallegos (UNERG)**. El sistema está diseñado para ser escalable, permitiendo el despliegue inicial en el Área de Ciencias de la Salud y su posterior expansión a otras facultades.

---

## 2. Jerarquía de la Información 🏗️
El sistema opera bajo una estructura de tres niveles para garantizar la organización académica:

| Nivel | Entidad | Descripción | Ejemplo |
| :--- | :--- | :--- | :--- |
| **Nivel 1** | **Revista** | Entidad global con ISSN propio. | CIENCIAEDUC |
| **Nivel 2** | **Número / Volumen** | Contenedor periódico. | Vol. 12, Núm. 1 (Enero-Julio) |
| **Nivel 3** | **Artículo** | Unidad de investigación individual. | Estudio sobre prevalencia de... |

---

## 3. Especificaciones por Perfil de Usuario 👥

### 3.1 Autor (Investigador) ✍️
*Usuario encargado de la postulación de investigaciones y la aplicación de correcciones científicas.*

#### 🖥️ Vistas Principales:
*   **Tablero de Publicaciones (Dashboard):**
    *   Listado de artículos enviados con seguimiento en tiempo real del estado: `enviado`, `en_revision`, `aprobado`, `rechazado`, `publicado` boton para ver el detalle de cada articulo (redirige a panel de Revisiones de Articulo).
    *   boton para nuevo articulo.
    *   **Formulario de Envío Multietapa:**
    *   **Paso 1 (Inicio):** Selección obligatoria de Programa y Línea de Investigación y seleccion de la revista en la que se desea publicar el artículo.
    *   **Paso 2 (Carga de Archivos):** Interfaz drag-and-drop para documentos obligatorios (`manuscrito_original`, `pagina_titulo`, `carta_originalidad`, `certificado_etica`, `ficha_autores`).
    *   **Paso 3 (Metadatos):** Registro de Título (ES/EN), Resumen (ES/EN), Palabras Clave y DOI.
    *   **Paso 4 (Coautores):** Adición de colaboradores con campos obligatorios (Nombre, Correo, Afiliación, ORCID).
*   **Panel de Revisiones de Artículos:**
    *   Descarga de informes detallados y carga de `manuscrito_revision`.
    *   Acceso directo al canal de discusiones con el editor
    *  acceso a todos los archivos relacionados con el articulo
---

### 3.2 Editor (Gestor Editorial) ⚖️
*Perfil de supervisión técnica y administrativa de la publicación.*

#### 🖥️ Vistas Principales:
*   **Gestión de Números y Volúmenes (Issues):**
    *   **Funcionalidad:** Creación del contenedor periódico donde se agrupan los artículos aprobados.
    *   **Requerimientos de Datos:** Volumen (número), Número (entero), Año, Título de la edición (ej. "Enero-Junio"), Status (`futuro`, `publicado`).
    *   **Pasos:**
        1.  Definición de metadatos de la edición.
        2.  Selección de artículos con status `aprobado` para ser vinculados.
        3.  Activación de la publicación (cambio de estado a `publicado` y fijación de `fecha_publicacion`).
*   **Cola de Envíos y Desk Review:**
    *   Clasificación en: `Sin asignar`, `Activos` y `Archivados`.
    *   Gestión de plagio (límite < 30%).
*   **Gestión de Flujo y Arbitraje:**
    *   Anonimización técnica (`manuscrito_anonimizacion`) y asignación de jurados ciegos.
*   **Producción y Galeradas:**
    *   Carga de archivos finales (`galerada_pdf`, `galerada_xml_jats`, `galerada_html`, `galerada_epub`).

---

### 3.3 Jurado (Revisor Externo) 🔍
*Experto encargado del arbitraje bajo el sistema de doble ciego.*

#### 🖥️ Vistas Principales:
*   **Lista de Artículos Asignados:** Visualización de invitación con Título y Resumen.
*   **Formulario de Evaluación Ciega:**
    *   Acceso restringido: Solo visualiza archivos donde `es_anonimo = true`.
    *   Campos: Calificación de Metodología, Originalidad y Pertinencia.
    *   Comentarios: Cuadro para el autor (público) y para el editor (privado).

---

### 3.4 Administrador (Soporte Técnico) 🛠️
*Responsable de la infraestructura y mantenimiento global del sitio.*

#### 🖥️ Vistas Principales:
*   **Mantenimiento Académico:** Gestión de tablas de Áreas, Programas y Líneas.
*   **Configuración de Revistas (Entidad Global):**
    *   **Funcionalidad:** Alta y edición de los datos maestros de la revista científica.
    *   **Requerimientos de Datos:** Nombre de la revista, ISSN (único), Periodicidad (`semestral`, `anual`), Contacto principal, Logo de la UNERG y Políticas de la revista.
*   **Control de Usuarios y Roles:** Creación de perfiles y auditoría de logs.

---

## 4. Reglas de Negocio y Seguridad 🛡️

> [!IMPORTANT]
> **Doble Ciego Estricto:** El sistema debe garantizar por software que el Jurado NUNCA tenga acceso a la `pagina_titulo` ni al `manuscrito_original`.

> [!TIP]
> **Inmutabilidad:** Cada nueva carga de archivo genera una nueva fila en la base de datos con un número de versión incremental.

> [!NOTE]
> **Interoperabilidad:** Mapeo automático de metadatos a **Dublin Core** para exposición vía OAI-PMH.

> [!CAUTION]
> **Almacenamiento Cloud:** Integración obligatoria con Cloud Storage (AWS S3 / Google Cloud) para asegurar la integridad de los datos.