import { ComentarioPublico } from './publicacion.model';

// Página de comentarios devuelta por el servidor para la carga progresiva.
export interface PaginaComentarios {
  comentarios: ComentarioPublico[];
  total: number;
  offset: number;
  limit: number;
  hayMas: boolean;
}
