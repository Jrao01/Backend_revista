#!/bin/bash

# Script de utilidades para manejo de Docker en el proyecto Backend Revista UNERG
# Permite ejecutar comandos comunes de Docker Compose de forma simplificada

case "$1" in
  # Usar comando 'docker compose' en caso de que no funcione con 'docker-compose'. Suele funcionar de las dos formas tambien
  # Construir y levantar los contenedores desde cero (recomendado cuando hay cambios en Dockerfile o dependencias)
  (build)
    docker-compose up --build
    ;;

  # Levantar los contenedores sin reconstruir imágenes
  (up)
    docker-compose up
    ;;

  # Detener y eliminar los contenedores activos
  (down)
    docker-compose down
    ;;

  # Reiniciar el entorno completo (detiene y reconstruye imágenes)
  (restart)
    docker-compose down && docker-compose up --build
    ;;

  # Reconstrucción total del entorno (elimina contenedores huérfanos y fuerza recreación completa)
  (rebuild)
    docker-compose down
    docker-compose up --build --force-recreate --remove-orphans
    ;;

  # Ver logs en tiempo real del backend
  (logs)
    docker-compose logs -f
    ;;

  # Mostrar estado de los contenedores activos
  (ps)
    docker-compose ps
    ;;

  # Limpieza completa:
  # - Elimina contenedores
  # - Elimina volúmenes (ojo: borra datos persistentes como SQLite)
  # - Limpia recursos no usados de Docker
  (clean)
    docker-compose down -v
    docker system prune -f
    ;;

  # Mostrar ayuda de comandos disponibles
  (*)
    echo "Comandos disponibles para el proyecto Backend Revista UNERG:"
    echo ""
    echo "  ./docker.sh build    -> Construir y levantar contenedores"
    echo "  ./docker.sh up       -> Levantar contenedores"
    echo "  ./docker.sh down     -> Detener contenedores"
    echo "  ./docker.sh restart  -> Reiniciar entorno completo"
    echo "  ./docker.sh rebuild  -> Reconstrucción total del entorno"
    echo "  ./docker.sh logs     -> Ver logs en tiempo real"
    echo "  ./docker.sh ps       -> Ver estado de contenedores"
    echo "  ./docker.sh clean    -> Limpieza completa del entorno"
    ;;
esac