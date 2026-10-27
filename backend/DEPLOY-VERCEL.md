# Backend en Vercel

El proyecto de Vercel debe usar `backend` como Root Directory y el framework NestJS.

En Settings → Environment Variables configurar para Production y Preview:

- `MONGODB_URI`: la cadena de conexión completa de Atlas, con la contraseña real. No subirla al repositorio.
- `NODE_OPTIONS`: `--experimental-require-module`. NestJS 12 usa paquetes ESM y nuestro proyecto compila a CommonJS. Esta opción permite que Node los cargue en Vercel. Si hay otras opciones, agregarla separada por un espacio.

Después de modificar variables hay que hacer Redeploy. Para publicar cambios de código, primero subir esos cambios al repositorio conectado y desplegar ese commit.

## Qué hace main.ts

`crearAplicacion()` crea Nest y configura las rutas con prefijo `/api`, CORS, los archivos y la validación de DTOs. `app.init()` espera a que la aplicación termine de inicializarse.

En Vercel, `export default handler` es la función que recibe las solicitudes. Espera a que la aplicación esté lista y le pasa la solicitud al servidor Express que usa Nest internamente. Guardamos la promesa de inicialización para compartir la misma aplicación entre las solicitudes de una instancia; Vercel puede crear varias instancias.

En la PC, la condición `!process.env['VERCEL']` ejecuta `app.listen()` para escuchar en el puerto 3000 o en `PORT`. Se sigue usando `npm run start:dev`.

Para comprobar el despliegue, abrir `/api/estado`. Si falla, revisar el error completo en Logs de Vercel.

El almacenamiento definitivo de las imágenes sigue pendiente de elegir un servicio. El guardado local actual no proporciona almacenamiento persistente en Vercel.

Referencias:

- https://vercel.com/docs/frameworks/backend/nestjs
- https://vercel.com/docs/frameworks/backend/express
- https://vercel.com/docs/functions/runtimes/node-js/advanced-node-configuration
