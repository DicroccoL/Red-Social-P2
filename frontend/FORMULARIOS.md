# Registro y login del sprint 1

## Archivos para estudiar

| Archivo | Responsabilidad |
| --- | --- |
| src/app/pages/registro/registro.component.ts | FormGroup, controles, validaciones, selección de foto y envío del registro. |
| src/app/pages/registro/registro.component.html | Vincula cada input mediante formControlName y muestra sus errores. |
| src/app/pages/login/login.component.ts | Valida correo y contraseña, llama a la API y guarda sus datos públicos en memoria. |
| src/app/services/autenticacion.service.ts | Agrupa las solicitudes HTTP de registro y login. |
| src/app/models/usuario.model.ts | Describe los tipos TypeScript de los datos y las respuestas. |
| src/app/shared/validadores-formulario.ts | Comprueba contraseñas iguales y fecha no futura; arma los mensajes de los campos. |
| src/app/shared/aviso-modal/ | Muestra confirmaciones y errores mediante un dialog de HTML, sin alert(). |
| src/environments/ | Define la URL del backend de desarrollo y de producción. |

## Cómo funciona el formulario reactivo

FormGroup reúne los campos. Cada FormControl guarda su valor y sus validaciones. Validators.required exige un dato; email comprueba el correo; minLength y maxLength limitan el texto; pattern comprueba una expresión regular.

nonNullable: true mantiene los campos de texto como string en lugar de permitir null. La foto sí puede ser File o null, porque inicialmente no hay archivo.

[formGroup] conecta el formulario HTML con el objeto TypeScript. formControlName vincula un input con el control del mismo nombre. (ngSubmit) ejecuta el método cuando se envía el formulario.

Al enviar, markAllAsTouched() permite mostrar los errores de todos los campos. Si formulario.invalid es true, no enviamos la solicitud. El validador contrasenasIguales se aplica al grupo porque necesita comparar dos controles.

## Qué ocurre con la foto

El input file no utiliza formControlName: su evento change obtiene el File seleccionado y lo coloca en el control imagenPerfil mediante setValue(). Se comprueban tipo y tamaño para dar una respuesta inmediata. El backend también valida el archivo, porque no puede confiar en las comprobaciones del navegador.

URL.createObjectURL() permite previsualizar el File localmente. URL.revokeObjectURL() libera esa referencia al cambiar la foto o salir de la pantalla. La vista previa no sube el archivo.

Al enviar un registro válido, FormData reúne los ocho campos de texto y el archivo imagenPerfil. El navegador genera Content-Type y su boundary: no lo configuramos manualmente.

El servicio definitivo de imágenes todavía está pendiente. El frontend ya permite elegir y enviar la foto; el backend conserva por ahora el guardado en uploads/perfiles. Esto se puede probar localmente, pero no resuelve el almacenamiento persistente en Vercel.

## HttpClient y subscribe

provideHttpClient() registra la configuración de HTTP. El servicio recibe HttpClient por el constructor, igual que Nest inyecta sus servicios.

http.post() devuelve un Observable. subscribe({ next, error }) inicia la solicitud y define qué hacer con su resultado: next se ejecuta con una respuesta correcta; error maneja una respuesta fallida.

enviando deshabilita el formulario y evita dos envíos simultáneos. ChangeDetectorRef.markForCheck() notifica a Angular que actualice la vista al cambiar los datos dentro de subscribe; este proyecto usa la configuración de Angular sin Zone.js.

ngOnDestroy() se ejecuta al salir de la pantalla. unsubscribe() cancela una solicitud pendiente del cliente y libera su suscripción. Esto no deshace una operación que el servidor ya haya realizado.

## Modales

AvisoModalComponent recibe titulo y mensaje mediante @Input. El evento @Output cerrado permite que el formulario reaccione al cerrar el aviso. @ViewChild obtiene la referencia al dialog y ngAfterViewInit lo abre con showModal(). El dialog nativo controla el foco y permite cerrarlo con Escape.

El registro correcto abre una confirmación y luego lleva al login. Los errores conservan los datos para corregirlos. Un error técnico del servidor se convierte en un mensaje comprensible, sin mostrar su respuesta interna.

## Login del backend

LoginDto valida correo y contraseña. POST /api/autenticacion/login devuelve 200 al ingresar; @HttpCode(200) cambia el 201 que Nest usa por defecto en POST.

UsuariosService.buscarParaLogin() usa select('+passwordHash') porque el schema excluye el hash de las consultas normales. AutenticacionService utiliza PasswordHasher.verify() para verificar la contraseña. También lo llama con undefined cuando no existe el correo, como indica la biblioteca.

Si los datos no coinciden, la respuesta es 401. Una cuenta inactiva recibe 403. La respuesta correcta enumera los campos públicos: no devuelve el hash ni la contraseña.

## Datos del usuario y sesión

Después del login, usuarioActual conserva los datos públicos dentro del servicio Angular. Mi perfil los muestra y Cerrar sesión los elimina. Al recargar la página se pierde ese estado. No se guarda la contraseña en localStorage.

Esto permite probar el flujo del sprint 1. JWT, renovación y protección de rutas se implementarán en su etapa posterior. Los datos en memoria no son una credencial ni autorizan operaciones del backend. La navegación sigue siendo libre en esta entrega.

## URLs y despliegue

npm start utiliza environment.development.ts y envía solicitudes a http://localhost:3000/api. npm run build utiliza environment.ts y apunta a https://backendfloppy.vercel.app/api. Las rutas continúan usando lazy loading.

El backend permite CORS desde localhost:4200, 127.0.0.1:4200 y https://frontfloppy.vercel.app. Para producción necesita MONGODB_URI en Vercel > Settings > Environment Variables y un nuevo despliegue. No se copia esa credencial al frontend.

Para probar localmente: iniciá NestJS con npm run start:dev en backend y Angular con npm start en frontend. Un registro válido crea una cuenta real en la base configurada; usá después ese correo y contraseña para ingresar.

## Verificación

npm run test:autenticacion, desde backend, compila y ejecuta 17 pruebas con HTTP, hashing y archivos reales. Los usuarios se guardan en memoria dentro de la prueba, sin escribir cuentas en Atlas.

También se revisó el frontend en Chrome con una API simulada: validaciones, selección de foto, FormData, modales, login, perfil, cierre y vista móvil. La API real local se verificó con Atlas y el CORS del dominio publicado. La prueba completa en producción depende del despliegue del backend y de la solución futura para las imágenes.
