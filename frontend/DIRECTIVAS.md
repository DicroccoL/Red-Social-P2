# Mostrar los accesos según el usuario

`src/app/directivas/solo-invitados.directive.ts` define `SoloInvitadosDirective`. Se usa en los enlaces Entrar y Sumate del menú:

```html
<a *appSoloInvitados="autenticacion.usuarioActual" routerLink="/login">
  Entrar
</a>
```

Invitado significa que no hay un usuario con sesión iniciada. La directiva muestra el contenido solo en ese caso.

- `@Directive` declara la directiva y su selector, el nombre que usamos en HTML.
- El asterisco indica una directiva estructural: decide si el contenido existe en la vista.
- `@Input` recibe `usuarioActual` desde el componente. El setter se ejecuta cuando ese valor cambia.
- `TemplateRef` representa el fragmento HTML del enlace.
- `ViewContainerRef` permite insertarlo con `createEmbeddedView()` o quitarlo con `clear()`.
- `contenidoVisible` evita insertar varias copias del mismo enlace.

Si `usuarioActual` es `null`, aparecen Entrar y Sumate. Después de un login correcto, el servicio guarda el usuario y se retiran esos enlaces. Al cerrar sesión, el servicio vuelve a guardar `null` y reaparecen.

`app.component.ts` importa la directiva y recibe AutenticacionService por el constructor para que el HTML consulte al mismo usuario que utiliza el resto de la aplicación. No creamos otro estado de sesión.

Los enlaces del logo apuntan a Publicaciones cuando hay un usuario, y a Login cuando no lo hay.

Esto controla la presentación del menú. La sesión continúa en memoria y se pierde al recargar; JWT y los permisos del backend corresponden a la etapa posterior del proyecto.

Referencia: https://angular.dev/guide/directives/structural-directives
