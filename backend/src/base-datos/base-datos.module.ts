// Carga las variables del archivo .env del backend.
import 'dotenv/config';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// Leemos la dirección de Atlas sin escribir las credenciales en este archivo.
const mongodbUri = process.env['MONGODB_URI'];

// Detenemos el inicio si todavía falta completar la conexión.
if (!mongodbUri || mongodbUri.includes('<db_password>')) {
  throw new Error(
    'Completá MONGODB_URI en backend/.env con la contraseña del usuario de MongoDB Atlas.',
  );
}

// Este módulo concentra la configuración de MongoDB.
@Module({
  imports: [
    // forRoot configura la conexión que usarán los modelos de la aplicación.
    MongooseModule.forRoot(mongodbUri, {
      // Esperamos hasta 10 segundos para seleccionar un servidor MongoDB.
      serverSelectionTimeoutMS: 10000,
      // Realizamos un solo intento de conexión.
      retryAttempts: 1,
    }),
  ],
})
export class BaseDatosModule {}
