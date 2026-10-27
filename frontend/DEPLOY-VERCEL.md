# Publicar el frontend en Vercel

Este proyecto de Vercel publica la aplicación Angular de la carpeta frontend.

## Configuración

En Settings > Build and Deployment del proyecto frontend:

| Campo | Valor |
| --- | --- |
| Root Directory | frontend |
| Framework Preset | Angular |
| Build Command | npm run build |
| Output Directory | dist/frontend/browser |

Root Directory selecciona el proyecto que se va a compilar dentro del repositorio. Output Directory indica qué carpeta generada contiene los archivos públicos. Su ruta se interpreta desde frontend, por eso no se agrega frontend/ otra vez.

vercel.json fija el framework, el comando de compilación y la carpeta de salida. Debe estar dentro de la raíz elegida en Vercel, es decir, frontend/vercel.json.

## Por qué termina en browser

Angular genera el index.html y los archivos JavaScript y CSS en dist/frontend/browser. Publicar únicamente dist/frontend apunta a la carpeta superior, donde no está el index.html de la aplicación.

## Para qué sirve rewrites

Al entrar directamente a /login o /registro, Vercel debe entregar index.html y dejar que el router de Angular muestre la pantalla correspondiente. La regla rewrites resuelve este comportamiento. Los archivos estáticos existentes conservan su prioridad.

## Aplicar el cambio

1. Subí frontend/vercel.json al repositorio conectado a Vercel.
2. Confirmá que Root Directory sea frontend en el proyecto frontend.
3. Esperá el nuevo despliegue o ejecutá Redeploy.
4. Probá la página principal, /login y /registro, y recargá esas rutas.

El archivo local no modifica por sí solo un despliegue que ya está publicado. Para comprobar la solución en la URL pública se necesita un nuevo despliegue que incluya este archivo.

Esta configuración corresponde al frontend. La publicación del backend NestJS se configura en su proyecto separado.

Referencia: https://vercel.com/docs/project-configuration/vercel-json
