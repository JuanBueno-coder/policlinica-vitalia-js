# Vitalia Gestión

Aplicación web SPA para gestionar la Policlínica Vitalia. Práctica de la UD1 de Desarrollo de Interfaces (2º DAM), segunda parte.

**Grupo 5** - Temática 5: Centro Médico y Especialidades

## Integrantes y reparto

| Gestión | Responsable |
|---|---|
| Especialidades | Gabriel Vigo Rodríguez |
| Médicos | Alejandro Gómez Izquierdo |
| Pacientes | David Jiménez Martín |
| Citas | Juan Antonio Bueno Rodríguez |
| Pruebas | Juan Antonio Bueno Rodríguez |

## Enlaces

- GitHub: (pendiente)
- Alojamiento web: (pendiente)

## Base de datos

- Nombre de la base de datos: `policlinica_vitalia`
- Usuario: `vitalia`
- Contraseña: `Vitalia2026`
- Servidor: `db` (es el nombre del contenedor de MySQL en docker-compose)
- Usuario root de MySQL (solo para phpMyAdmin): `root` / `root`

El archivo `sql/backup.sql` crea la base de datos, las tablas con sus relaciones, mete los datos (10 o más registros por tabla) y crea el usuario `vitalia`.

El diagrama entidad-relación está en `sql/diagrama_E-R.png` (sacado del diseñador de phpMyAdmin).

## Cómo arrancarlo con Docker

Hace falta tener Docker Desktop instalado.

1. Abrir una terminal en la carpeta del proyecto.
2. Ejecutar:

   ```
   docker compose up -d --build
   ```

3. Esperar unos segundos a que MySQL termine de arrancar (la primera vez tarda más porque importa el backup.sql).
4. Abrir en el navegador:
   - Aplicación: http://localhost:8080
   - phpMyAdmin: http://localhost:8081 (usuario `root`, contraseña `root`)

Para pararlo: `docker compose down`

Si se cambia el `backup.sql` hay que borrar el volumen para que se vuelva a importar:

```
docker compose down -v
docker compose up -d --build
```

Contenedores que se crean:

- `vitalia-web`: PHP 8.2 con Apache (puerto 8080)
- `vitalia-db`: MySQL 8.0 (puerto 3307 desde fuera por si ya tienes un MySQL en el 3306)
- `vitalia-phpmyadmin`: phpMyAdmin (puerto 8081)

## Tablas

- **especialidades**: nombre, nº de consultas, activa, fecha de apertura y planta
- **medicos**: nombre, nº de colegiado, turno, años de experiencia, en activo, fecha de alta y especialidad
- **pacientes**: nombre, DNI, teléfono, peso, recordatorio por SMS, fecha de nacimiento y aseguradora
- **citas**: fecha y hora, motivo, duración, atendida, médico y paciente
- **pruebas**: tipo, resultado, fecha de realización, coste, urgente y cita
- **plantas** y **aseguradoras**: tablas auxiliares para los desplegables

Relaciones 1:N: plantas → especialidades → médicos → citas → pruebas, y aseguradoras → pacientes → citas.

## Funcionalidades

Cada tabla tiene en el menú:

- Alta (con desplegables cargados de la base de datos)
- Buscar y modificar (buscas, pulsas "Modificar" en el resultado y cambias los datos)
- Borrar (por código o por otro campo: nombre en especialidades, nº de colegiado en médicos y DNI en pacientes)
- Listado de todos los registros
- Listado filtrado

Los mensajes salen en un toast de Bootstrap y los borrados piden confirmación con un modal.

## Estructura

```
vitalia-gestion/
  css/estilos.css
  js/ajax.js        clase Policlinica (peticiones fetch al php)
  js/objetos.js     clases Especialidad, Medico, Paciente, Cita, Prueba
  js/codigo.js      todo lo de la interfaz
  php/config.php    conexión a la base de datos
  php/especialidades.php, medicos.php, pacientes.php, citas.php, pruebas.php
  php/auxiliares.php
  sql/backup.sql
  sql/diagrama_E-R.png
  index.html
  Dockerfile
  docker-compose.yml
  README.MD
```
