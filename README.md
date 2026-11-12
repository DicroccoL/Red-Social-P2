# Floppy · La red de las mascotas

Floppy es una red social para compartir historias y fotos de mascotas. Al crear una cuenta, cada persona puede armar su perfil, publicar en **La manada** e interactuar con las publicaciones de la comunidad.

El proyecto se desarrolló para **Programación IV**. El repositorio reúne dos aplicaciones TypeScript: un frontend en Angular y una API REST en NestJS.

[Abrir Floppy](https://floppypet.vercel.app/)

## Qué ofrece la aplicación

- Registro con foto de perfil, inicio y cierre de sesión, y renovación de la sesión antes de que venza.
- Un feed de 6 publicaciones por página que se puede ordenar por fecha o por cantidad de me gusta. Las publicaciones pueden incluir una foto y se les puede dar o quitar me gusta.
- Una vista de detalle para leer y agregar comentarios, editar los propios y cargar más resultados.
- Un perfil editable que muestra los datos de la cuenta, la foto y las últimas tres publicaciones del usuario con sus comentarios.
- Un panel de administración para gestionar cuentas y consultar gráficos de actividad por rango de fechas.
- Configuración PWA en la compilación de producción de Angular.

## Arquitectura

| Capa | Responsabilidad |
| --- | --- |
| [Frontend](frontend/src/app) | Las páginas muestran el feed, el perfil y el panel. Los formularios reactivos validan los datos y los servicios HTTP llaman a la API. Las rutas cargan sus páginas bajo demanda y aplican controles de acceso. |
| [Backend](backend/src) | Los controladores reciben las solicitudes, los DTO validan los datos y los servicios ejecutan las reglas de negocio. El código se organiza por funcionalidad en módulos de autenticación, usuarios, publicaciones y comentarios. |
| [MongoDB Atlas](backend/src/base-datos/base-datos.module.ts) | Guarda usuarios, publicaciones y comentarios. Los esquemas de Mongoose definen sus campos y relaciones. |
| [Cloudinary](backend/src/imagenes) | Recibe las fotos desde NestJS. MongoDB guarda la URL y el identificador de cada imagen. |
| [Sesión y permisos](backend/src/seguridad) | NestJS guarda el JWT en una cookie HttpOnly. Los guards del backend verifican la sesión y los permisos para acceder a las rutas protegidas. |

Al publicar con foto, Angular envía el título, el mensaje y el archivo a `POST /api/publicaciones`. NestJS verifica la sesión y valida los datos. El servicio sube la imagen a Cloudinary, guarda la publicación con su URL en MongoDB y devuelve los datos que Angular muestra en el feed.
