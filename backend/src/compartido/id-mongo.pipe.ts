import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { Types } from 'mongoose';

// Valida el formato del ID antes de que el controlador consulte MongoDB.
@Injectable()
export class IdMongoPipe implements PipeTransform<string, string> {
  transform(valor: string) {
    if (!Types.ObjectId.isValid(valor))
      throw new BadRequestException('El identificador no es válido.');
    return valor;
  }
}
