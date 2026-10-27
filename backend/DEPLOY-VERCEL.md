# Backend en Vercel

El proyecto de Vercel debe usar `backend` como Root Directory y el framework NestJS.

En Settings → Environment Variables configurar para Production y Preview:

- `MONGODB_URI`: la cadena de conexión completa de Atlas, con la contraseña real. No subirla al repositorio.

`backend/vercel.json` declara el framework NestJS y fija `NODE_OPTIONS` en `--experimental-require-module` para las funciones publicadas. NestJS 12 usa paquetes ESM y nuestro proyecto compila a CommonJS: esta opción permite que Node los cargue en Vercel. Es una opción pública de ejecución; las credenciales como `MONGODB_URI` siguen solamente en Settings.

Si habías agregado `NODE_OPTIONS` en Settings, mantené el mismo valor para evitar configuraciones diferentes. Si necesitás otras opciones de Node, revisá también el valor del archivo.

Después de modificar variables hay que hacer Redeploy. Para publicar cambios de código, primero subir esos cambios al repositorio conectado y desplegar ese commit.

## Qué hace main.ts

`crearAplicacion()` crea Nest y configura las rutas con prefijo `/api`, CORS, los archivos y la validación de DTOs. `app.init()` espera a que la aplicación termine de inicializarse.

En Vercel, `export default handler` es la función que recibe las solicitudes. Espera a que la aplicación esté lista y le pasa la solicitud al servidor Express que usa Nest internamente. Guardamos la promesa de inicialización para compartir la misma aplicación entre las solicitudes de una instancia; Vercel puede crear varias instancias.

En la PC, la condición `!process.env['VERCEL']` ejecuta `app.listen()` para escuchar en el puerto 3000 o en `PORT`. Se sigue usando `npm run start:dev`.

Para comprobar el despliegue, abrir `/api/estado`. Si falla, revisar el error completo en Logs de Vercel.

Las fotos nuevas se suben a Cloudinary. Configurar también `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` y `CLOUDINARY_API_SECRET` en el backend. Los pasos y la explicación están en `CLOUDINARY.md`. El API Secret nunca se configura en Angular.

Referencias:

- https://vercel.com/docs/frameworks/backend/nestjs
- https://vercel.com/docs/frameworks/backend/express
- https://vercel.com/docs/functions/runtimes/node-js/advanced-node-configuration
