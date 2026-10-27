const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const { v2: cloudinary } = require('cloudinary');
const { ImagenesService } = require('../dist/imagenes/imagenes.service');
const nombres = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
const valoresOriginales = nombres.map(nombre => process.env[nombre]);
const uploadOriginal = cloudinary.uploader.upload;
const destroyOriginal = cloudinary.uploader.destroy;
const servicio = new ImagenesService();
const imagen = { mimetype: 'image/png', buffer: Buffer.from('imagen-prueba') };

after(() => {
  cloudinary.uploader.upload = uploadOriginal;
  cloudinary.uploader.destroy = destroyOriginal;
  nombres.forEach((nombre, indice) => {
    if (valoresOriginales[indice] === undefined) delete process.env[nombre];
    else process.env[nombre] = valoresOriginales[indice];
  });
});

test('sin credenciales responde 503 antes de llamar al SDK', async () => {
  nombres.forEach(nombre => delete process.env[nombre]);
  cloudinary.uploader.upload = () => { throw new Error('No debe llamar al SDK'); };
  await assert.rejects(servicio.subirPerfil(imagen), error => error.getStatus() === 503);
});

test('envía la foto en memoria y devuelve secure_url y public_id del SDK', async () => {
  nombres.forEach(nombre => { process.env[nombre] = 'valor-de-prueba'; });
  cloudinary.uploader.upload = async (contenido, opciones) => {
    assert.equal(contenido, `data:image/png;base64,${imagen.buffer.toString('base64')}`);
    assert.equal(opciones.folder, 'floppy/perfiles');
    assert.equal(opciones.resource_type, 'image');
    return { secure_url: 'https://res.cloudinary.com/prueba/foto.png', public_id: 'floppy/perfiles/foto' };
  };
  assert.deepEqual(await servicio.subirPerfil(imagen), {
    url: 'https://res.cloudinary.com/prueba/foto.png', publicId: 'floppy/perfiles/foto',
  });
});

test('oculta los detalles internos de un fallo del proveedor y responde 502', async () => {
  cloudinary.uploader.upload = async () => { throw new Error('detalle privado del proveedor'); };
  await assert.rejects(servicio.subirPerfil(imagen), error => {
    assert.equal(error.getStatus(), 502);
    assert.equal(error.message.includes('detalle privado'), false);
    return true;
  });
});

test('elimina la foto por public_id para revertir un registro fallido', async () => {
  cloudinary.uploader.destroy = async (publicId, opciones) => {
    assert.equal(publicId, 'floppy/perfiles/foto');
    assert.equal(opciones.resource_type, 'image');
    return { result: 'ok' };
  };
  await servicio.eliminar('floppy/perfiles/foto');
});
