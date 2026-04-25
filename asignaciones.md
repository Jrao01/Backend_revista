# Plan de Asignaciones y Desarrollo en Paralelo

Para maximizar la velocidad de desarrollo, el trabajo se ha dividido en módulos independientes. Cada desarrollador puede trabajar en su rama sin bloquear a los demás.

---

##  Ponce: Módulo de Gestión de Datos y Ediciones
**Objetivo:** Completar la información necesaria para que un artículo pueda ser publicado.

1.  **Dockerización (Tarea prioritaria):**
    *   **Acción:** Crear el `Dockerfile` y `docker-compose.yml` para asegurar que el entorno de desarrollo sea idéntico para todo el equipo.
2.  **Gestión de Coautores:**
    *   **Modelo:** `AutorSecundario`.
    *   **Tarea:** Crear controlador y rutas para añadir, listar y eliminar coautores de un artículo.
2.  **Gestión de Números/Ediciones:**
    *   **Modelo:** `NumeroRevista`.
    *   **Tarea:** Crear el CRUD completo para que el Editor pueda crear Volúmenes y Números asociados a una Revista.

---

##  Mark: Módulo de Arbitraje y Flujo Editorial
**Objetivo:** Implementar el "Corazón" del sistema: el proceso de revisión por pares.

1.  **Desk Review y Anonimización:**
    *   **Tarea:** Crear endpoint para cambiar el status del artículo y permitir al editor subir el archivo `manuscrito_anonimizado`.
2.  **Asignación de Jurados:**
    *   **Tarea:** Lógica para buscar usuarios con `rol: 'revisor'` y vincularlos a un artículo en la tabla `evaluaciones`.
3.  **Evaluación de Jurados:**
    *   **Tarea:** Endpoint para que el jurado registre su veredicto, comentarios y suba el `informe_evaluacion`.

---

##  Kelvin: Módulo de Producción y Comunicación
**Objetivo:** Finalizar el proceso de publicación y habilitar la comunicación interna.

1.  **Producción y Galeradas:**
    *   **Tarea:** Endpoints para cargar archivos finales (`galerada_pdf`, `xml`, `html`) y asignar el DOI una vez aprobado el artículo.
2.  **Módulo de Discusiones (Mensajería):**
    *   **Tarea:** (Requiere nuevo modelo) Crear un sistema de mensajes simple asociado a cada artículo para que el Autor y el Editor se comuniquen por etapas.
3.  **Cierre de Número:**
    *   **Tarea:** Lógica para cambiar el status de un `NumeroRevista` a `publicado` y fijar fechas finales.

---

## Julian
**Objetivo:** Supervisar la integración y asegurar que el sistema siga funcionando.

1.  **Revisión de Código (Code Review):** Validar la lógica y seguridad de los Pull Requests.
2.  **Infraestructura de Testing:** Mantener y expandir los scripts de prueba (`test_full_flow.js`) a medida que se integren nuevos módulos.
3.  **Gestión de Base de Datos:** Supervisar migraciones o cambios estructurales en Sequelize.

---

##  Notas Técnicas para el Equipo
*   **Base de Datos:** Ya está configurada con SQLite3. Al iniciar el servidor, las tablas se crean automáticamente.
*   **Autenticación:** Usar el middleware `checkAuth` para proteger rutas. El usuario logueado está disponible en `req.usuario`.
*   **Subida de Archivos:** Usar el middleware de `multer` ya configurado en el proyecto.


## Glosario de Términos Técnicos

*   **DOI (Digital Object Identifier):** Es el "DNI" del artículo científico. Es un enlace persistente que nunca cambia aunque el artículo se mueva de servidor. 
    *   *¿De dónde sale?* Lo asigna una agencia externa (como CrossRef) tras pagar una tasa. En el sistema, el Editor lo registra manualmente en la fase de Producción.
*   **Galerada:** Es la versión maquetada y final del artículo (en PDF, HTML o XML) que ya tiene el logo de la revista, números de página y formato oficial. 
    *   *¿De dónde sale?* El maquetador de la revista toma el Word aprobado, lo convierte a PDF/HTML profesional y lo sube al sistema como el archivo definitivo que verán los lectores.
*   **OAI-PMH (Open Archives Initiative Protocol for Metadata Harvesting):** Es un protocolo que permite que otros sistemas (como Google Scholar, Latindex o Scielo) "lean" automáticamente nuestra revista para indexar los artículos.
    *   *¿De dónde sale?* Es una funcionalidad técnica del backend que expone los metadatos de los artículos en un formato XML estándar.
*   **JATS XML:** Es un estándar internacional de XML diseñado específicamente para revistas científicas. Permite que el texto sea leído fácilmente por máquinas y se adapte a cualquier pantalla.
    *   *¿De dónde sale?* Se genera a partir del manuscrito final durante la fase de producción. Es el formato preferido por los índices internacionales.
*   **ISSN (International Standard Serial Number):** Es el código único internacional de 8 dígitos que identifica a la revista como una publicación periódica oficial.
    *   *¿De dónde sale?* Lo otorga la Biblioteca Nacional o el Centro Nacional ISSN de cada país. El Administrador lo configura una sola vez al crear la Revista en el sistema.