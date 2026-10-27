const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
require('reflect-metadata');
const { Module, ValidationPipe, ConflictException, BadGatewayException } = require('@nestjs/common');
const { NestFactory } = require('@nestjs/core');
const { PasswordHasher } = require('@nestjs/authentication');
const { AutenticacionController } = require('../dist/autenticacion/autenticacion.controller');
const { AutenticacionService } = require('../dist/autenticacion/autenticacion.service');
const { UsuariosService } = require('../dist/usuarios/usuarios.service');
const { ImagenesService } = require('../dist/imagenes/imagenes.service');

// HTTP y hash reales; Atlas y Cloudinary se reemplazan por servicios de prueba.
const cuentas = new Map();
const imagenes = new Map();
let numeroFoto = 0;
let rechazarSubida = false;
const imagenesPrueba = {
  async subirPerfil(imagen) {
    if (rechazarSubida) throw new BadGatewayException('No se pudo subir la foto.');
    const publicId = `floppy/perfiles/prueba-${++numeroFoto}`;
    const url = `https://res.cloudinary.com/prueba/image/upload/${publicId}.png`;
    imagenes.set(publicId, { url, contenido: imagen.buffer });
    return { publicId, url };
  },
  async eliminar(publicId) { imagenes.delete(publicId); },
};
let rechazarCreacion = false;
const usuariosPrueba = {
  async buscarPorCorreo(correo) { return cuentas.get(correo.trim().toLowerCase()) || null; },
  async buscarParaLogin(correo) { return cuentas.get(correo.trim().toLowerCase()) || null; },
  async crear(datos) {
    if (rechazarCreacion) throw new ConflictException('Correo duplicado.');
    const usuario = { _id: 'usuario-prueba', ...datos };
    cuentas.set(datos.correo, usuario);
    return usuario;
  },
};
const passwordHasher = new PasswordHasher();
class AutenticacionPruebasModule {}
Module({
  controllers: [AutenticacionController],
  providers: [
    AutenticacionService,
    { provide: UsuariosService, useValue: usuariosPrueba },
    { provide: PasswordHasher, useValue: passwordHasher },
    { provide: ImagenesService, useValue: imagenesPrueba },
  ],
})(AutenticacionPruebasModule);

const foto = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aFOsAAAAASUVORK5CYII=', 'base64');
const datos = {
  nombre: 'Persona', apellido: 'Prueba', correo: 'persona@example.com',
  nombreUsuario: 'persona_prueba', contrasena: 'Ejemplo123', repetirContrasena: 'Ejemplo123',
  fechaNacimiento: '2000-01-15', descripcion: 'Prueba aislada de autenticación.',
};
let app;
let baseUrl;
let imagenGuardada;

function login(cambios = {}) {
  return fetch(`${baseUrl}/api/autenticacion/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ correo: datos.correo, contrasena: datos.contrasena, ...cambios }),
  });
}

function registrar(cambios = {}, contenido = foto) {
  const formulario = new FormData();
  for (const [campo, valor] of Object.entries({ ...datos, ...cambios })) formulario.append(campo, valor);
  if (contenido !== null) formulario.append('imagenPerfil', new Blob([contenido], { type: 'image/png' }), 'foto.png');
  return fetch(`${baseUrl}/api/autenticacion/registro`, { method: 'POST', body: formulario });
}

async function fotosGuardadas() {
  return [...imagenes.values()];
}

before(async () => {
  app = await NestFactory.create(AutenticacionPruebasModule, { logger: false });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  await app.listen(0, '127.0.0.1');
  baseUrl = await app.getUrl();
});

after(async () => {
  if (app) await app.close();
});

test('registro 201: guarda un hash verificable y devuelve únicamente datos públicos', async () => {
  const respuesta = await registrar();
  const cuerpo = await respuesta.json();
  assert.equal(respuesta.status, 201, JSON.stringify(cuerpo));
  assert.equal(cuerpo.usuario.perfil, 'usuario');
  const guardado = cuentas.get(datos.correo);
  assert.notEqual(guardado.passwordHash, datos.contrasena);
  assert.equal(await passwordHasher.verify(datos.contrasena, guardado.passwordHash), true);
  for (const campo of ['contrasena', 'repetirContrasena']) assert.equal(campo in guardado, false);
  for (const campo of ['passwordHash', 'contrasena', 'repetirContrasena']) assert.equal(campo in cuerpo.usuario, false);
  imagenGuardada = cuerpo.usuario.imagenPerfilUrl;
  assert.equal((await fotosGuardadas()).length, 1);
});

test('Mongo recibe la URL HTTPS y el identificador devueltos por el servicio de imágenes', () => {
  const usuario = cuentas.get(datos.correo);
  assert.equal(usuario.imagenPerfilUrl, imagenGuardada);
  assert.equal(imagenes.get(usuario.imagenPerfilPublicId).url, imagenGuardada);
  assert.deepEqual(imagenes.get(usuario.imagenPerfilPublicId).contenido, foto);
});

test('registro con correo duplicado en mayúsculas devuelve 409', async () => {
  assert.equal((await registrar({ correo: 'PERSONA@example.com' })).status, 409);
  assert.equal((await fotosGuardadas()).length, 1);
});
test('contraseña débil se rechaza con 400', async () => {
  assert.equal((await registrar({ contrasena: 'corta', repetirContrasena: 'corta' })).status, 400);
});
test('contraseñas distintas se rechazan con 400', async () => {
  assert.equal((await registrar({ repetirContrasena: 'Distinta123' })).status, 400);
});
test('fecha futura se rechaza con 400', async () => {
  assert.equal((await registrar({ fechaNacimiento: '2999-01-01' })).status, 400);
});
test('el cliente no puede asignarse el perfil administrador', async () => {
  assert.equal((await registrar({ perfil: 'administrador' })).status, 400);
});
test('foto obligatoria: sin archivo responde 400', async () => {
  assert.equal((await registrar({}, null)).status, 400);
});
test('un archivo de texto declarado PNG se rechaza', async () => {
  assert.equal((await registrar({}, Buffer.from('no es imagen'))).status, 400);
});
test('imagen mayor a 2 MiB se rechaza con 413', async () => {
  assert.equal((await registrar({}, Buffer.alloc(2 * 1024 * 1024 + 1))).status, 413);
});
test('un fallo al crear el documento elimina la foto de ese intento', async () => {
  rechazarCreacion = true;
  try {
    assert.equal((await registrar({ correo: 'otra@example.com' })).status, 409);
    assert.equal((await fotosGuardadas()).length, 1);
  } finally { rechazarCreacion = false; }
});

test('si falla la subida, no se crea el usuario ni queda una foto nueva', async () => {
  rechazarSubida = true;
  try {
    assert.equal((await registrar({ correo: 'sin-foto@example.com' })).status, 502);
    assert.equal(cuentas.has('sin-foto@example.com'), false);
    assert.equal(imagenes.size, 1);
  } finally { rechazarSubida = false; }
});

test('login correcto devuelve 200 y los datos públicos, sin hash ni contraseña', async () => {
  const respuesta = await login({ correo: 'PERSONA@example.com' });
  const cuerpo = await respuesta.json();
  assert.equal(respuesta.status, 200, JSON.stringify(cuerpo));
  assert.equal(cuerpo.usuario.correo, datos.correo);
  for (const campo of ['passwordHash', 'contrasena', 'repetirContrasena']) assert.equal(campo in cuerpo.usuario, false);
});
test('contraseña incorrecta devuelve 401', async () => {
  const respuesta = await login({ contrasena: 'Incorrecta123' });
  assert.equal(respuesta.status, 401);
  assert.equal((await respuesta.json()).message, 'Correo o contraseña incorrectos.');
});
test('correo inexistente devuelve el mismo error 401', async () => {
  const respuesta = await login({ correo: 'inexistente@example.com' });
  assert.equal(respuesta.status, 401);
  assert.equal((await respuesta.json()).message, 'Correo o contraseña incorrectos.');
});
test('login con correo inválido devuelve 400', async () => {
  assert.equal((await login({ correo: 'no-es-correo' })).status, 400);
});
test('el login tampoco acepta campos extra', async () => {
  assert.equal((await login({ perfil: 'administrador' })).status, 400);
});
test('una cuenta inactiva no puede ingresar aunque la contraseña sea correcta', async () => {
  const usuario = cuentas.get(datos.correo);
  usuario.activo = false;
  try { assert.equal((await login()).status, 403); }
  finally { usuario.activo = true; }
});
