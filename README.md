# Appointment API

API REST sencilla con Express y PostgreSQL para gestionar citas.

## Requisitos

- Node.js 18 o superior.
- PostgreSQL instalado y en ejecución.

## Preparar PostgreSQL

1. Crea una base de datos, por ejemplo:

   ```sql
   CREATE DATABASE appointment_api;
   ```

2. Configura las variables de conexión en tu terminal. Puedes partir de
   [.env.example](./.env.example); el proyecto no carga `.env` automáticamente,
   así que exporta las variables o configúralas en el entorno de ejecución. En
   Linux/macOS, por ejemplo:

   ```sh
   export PGHOST=localhost
   export PGPORT=5432
   export PGDATABASE=appointment_api
   export PGUSER=postgres
   export PGPASSWORD=tu_password
   ```

   También puedes definir `DATABASE_URL`, por ejemplo
   `postgres://postgres:tu_password@localhost:5432/appointment_api`.

3. Aplica el esquema:

   ```sh
   psql "$DATABASE_URL" -f db/schema.sql
   ```

   Si usas variables `PG*` en lugar de `DATABASE_URL`, ejecuta:

   ```sh
   psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" -f db/schema.sql
   ```

4. Instala dependencias e inicia la API:

   ```sh
   npm install
   npm start
   ```

## CRUD de citas

La API escucha en `http://localhost:3000/appointments`. Una cita tiene esta
forma: `{ "name": "Consulta", "date": "2026-10-02", "hour": "09:30" }`. `date`
y `hour` pueden ser `null` u omitirse; `name` es obligatorio.

| Operación | Método y ruta | Resultado |
|---|---|---|
| Listar | `GET /appointments` | `results` con todas las citas |
| Consultar | `GET /appointments/:id` | `result` con una cita |
| Crear | `POST /appointments` | `201` y la cita creada |
| Actualizar | `PUT /appointments/:id` | Reemplaza los campos de la cita |
| Eliminar | `DELETE /appointments/:id` | `204` sin contenido |

Ejemplo:

```sh
curl -X POST http://localhost:3000/appointments \
  -H 'Content-Type: application/json' \
  -d '{"name":"Consulta","date":"2026-10-02","hour":"09:30"}'
```

Los errores de validación devuelven `400`; una cita inexistente devuelve `404`.
Los valores SQL se envían como parámetros para evitar construir consultas con
datos de usuario.

## Aprender a planificar con agentes

Este repositorio incluye un agente personalizado en
[`.github/agents/backend-api.agent.md`](./.github/agents/backend-api.agent.md).
El agente es un perfil de instrucciones: puede explorar el proyecto, proponer
un plan y, cuando se lo pidas, implementar y verificar cambios. No es un proceso
autónomo que ejecute tareas sin supervisión.

### Crear y usar el agente en VS Code

1. Abre este repositorio en VS Code con GitHub Copilot habilitado.
2. Crea `.github/agents/` si todavía no existe y dentro crea
   `backend-api.agent.md`. El nombre del archivo será el identificador visible
   del agente en el selector de agentes.
3. Añade un encabezado YAML con `name` y `description`, y debajo instrucciones
   concretas sobre el rol, el contexto del proyecto y cómo debe trabajar.
   Puedes empezar copiando el agente ya preparado en este repositorio.
4. Guarda el archivo. Abre Copilot Chat en modo Agent y elige `Backend API` en
   el selector. Si no aparece, vuelve a cargar la ventana de VS Code.
5. Empieza pidiendo un plan, no código. Por ejemplo:

   > Analiza cómo está montada la API. No edites archivos todavía. Propón un
   > plan para añadir autenticación, con tareas pequeñas, dependencias, archivos
   > afectados, riesgos y pruebas.

6. Revisa y ajusta el plan. Pide implementar una tarea cada vez, confirma antes
   de cambios importantes y revisa el diff. Termina solicitando pruebas y una
   explicación de qué quedó pendiente.

### Cómo dividir y planificar el trabajo

Para la API de citas de este ejemplo, un plan útil separa áreas con entregables
verificables y respeta sus dependencias:

1. **Persistencia**: definir columnas y restricciones y crear `db/schema.sql`.
   Hecho cuando una base PostgreSQL nueva puede aplicar el esquema.
2. **Conexión**: añadir `pg`, configurar el pool y documentar variables. Depende
   de decidir cómo se representa el esquema y la conexión.
3. **Endpoints**: implementar listado, consulta por id, creación, actualización
   y eliminación con validación y consultas parametrizadas. Depende de la
   conexión y el esquema.
4. **Verificación y documentación**: probar respuestas, errores y persistencia,
   y actualizar los ejemplos de uso. Depende de los endpoints implementados.

En cada tarea define objetivo, alcance, archivos probables, dependencias,
criterio de aceptación y cómo probarla. Las dependencias importan: no tiene
sentido probar la persistencia antes de tener el esquema y la conexión. Mantén
las tareas acotadas para que puedas revisar los cambios del agente y detectar
errores antes de que se propaguen.

Un buen ciclo de trabajo es: **explorar → planificar → aprobar → implementar →
probar → revisar el diff**. Pide al agente que señale supuestos en vez de
inventar requisitos, y comprueba tú que las pruebas cubren el comportamiento
que esperas.
