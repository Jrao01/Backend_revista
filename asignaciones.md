# Tareas de Backend por módulo y responsable

## Ponce – Programas, Áreas y Líneas de Investigación
-  Definir modelos Sequelize `Programa`, `Area` y `Linea` con relaciones (Programa 1‑N Áreas, Área 1‑N Líneas).  
-  Crear migraciones para las nuevas tablas.  
-  Implementar controladores CRUD (`createPrograma`, `listProgramas`, `updatePrograma`, `deletePrograma` y equivalentes para Área y Línea).  
-  Añadir rutas API: `/api/programas`, `/api/areas`, `/api/lineas`.  
-  Validar datos de entrada con **express‑validator** y devolver respuestas JSON uniformes.  
-  Escribir pruebas unitarias (Jest) para controladores y rutas.  

## Mark – Volúmenes y Números de Revista
-  Definir modelo Sequelize `Volumen` (campos: `revista_id`, `numero_volumen`).  
-  Extender modelo `NumeroRevista` para incluir relación a `Volumen` y permitir CRUD.  
-  Crear migraciones para `volumenes` y actualizar la tabla `numeros_revista` si se requieren cambios.  
-  Implementar controladores: `createVolumen`, `listVolumenes`, `updateVolumen`, `deleteVolumen`; y `createNumero`, `listNumeros`, `updateNumero`, `deleteNumero` (anidados bajo revista/volumen).  
-  Definir rutas API: `/api/volumenes` y `/api/revistas/:revId/volumenes/:volId/numeros`.  
-  Añadir validaciones y manejo de errores.  
-  Pruebas unitarias para los nuevos controladores.  

## Dixon – Asignación de Artículos a Números y Estado
-  Modificar modelo `Articulo` añadiendo campo `numero_revista_id` (FK a `NumeroRevista`).  
-  Crear migración para agregar el nuevo campo.  
-  Implementar endpoint **POST** `/api/revistas/:revId/volumenes/:volId/numeros/:numId/articulos` que vincule un artículo existente al número.  
-  En el controlador, actualizar automáticamente el estado del artículo a `asignado`.  
-  Implementar **GET** `/api/articulos/:id` que incluya la información del número asignado.  
-  Pruebas de integración (Supertest) para la asignación y recuperación del artículo.  

## Kelvin – Proceso de Revisión y Arbitraje
-  Implementar middleware `checkRol` para validar roles (admin, editor, revisor, investigador) en rutas protegidas.  
-  Definir modelo `Jurado` y sus relaciones con `Articulo`.  
-  Crear rutas para asignar jurados a artículos: **POST** `/api/articulos/:id/jurados`.  
-  Definir modelo `Evaluacion` y rutas CRUD bajo `/api/evaluaciones`.  
-  Implementar lógica que cambie el estado del artículo a `aprobado` tras una evaluación positiva.  
-  Pruebas unitarias para el flujo de revisión y arbitraje.  

## Julian – Seguridad, Token y Calidad
-  Centralizar gestión de JWT: helper que valide el token y añada `req.user`.  
-  Aplicar middleware de autenticación a todas las rutas que lo requieran.  
-  Uniformizar el manejo de errores: respuestas JSON con `{ error, message }`.  
-  Documentar los nuevos endpoints en `README.md` y generar un esquema OpenAPI.  
-  Escribir pruebas de integración (Supertest) que verifiquen autenticación y autorización.  
-  Refactorizar código duplicado en controladores, aplicar buenas prácticas DRY.  

---  

**Nota**: **Endyths** será responsable de conectar el frontend con estos endpoints y de aplicar los ajustes que el equipo indique.  

Marca cada ítem como completado cuando lo termines o actualiza la lista si aparecen nuevos requerimientos. ¡Avísame si necesitas generar alguna migración, controlador o archivo de pruebas!
