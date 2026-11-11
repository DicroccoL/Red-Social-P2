import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, PipelineStage } from "mongoose";
import { Comentario } from "../../comentarios/schemas/comentario.schema";
import { Usuario } from "../../usuarios/schemas/usuario.schema";
import { Publicacion } from "../schemas/publicacion.schema";
import { RangoEstadisticasDto } from "./rango-estadisticas.dto";

const DIA_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class EstadisticasService {
  constructor(
    @InjectModel(Publicacion.name)
    private readonly publicaciones: Model<Publicacion>,
    @InjectModel(Comentario.name)
    private readonly comentarios: Model<Comentario>,
    @InjectModel(Usuario.name) private readonly usuarios: Model<Usuario>,
  ) {}

  async obtener(rango: RangoEstadisticasDto) {
    if (rango.desde > rango.hasta) {
      throw new BadRequestException(
        "La fecha inicial debe ser anterior o igual a la final.",
      );
    }
    const inicio = new Date(rango.desde + "T00:00:00-03:00");
    const fin = new Date(
      new Date(rango.hasta + "T00:00:00-03:00").getTime() + DIA_MS,
    );
    const filtro = { activo: true, fechaCreacion: { $gte: inicio, $lt: fin } };

    const [publicacionesPorUsuario, resultados] = await Promise.all([
      this.publicaciones
        .aggregate([
          { $match: filtro },
          { $group: { _id: "$usuario", cantidad: { $sum: 1 } } },
          {
            $lookup: {
              from: this.usuarios.collection.name,
              localField: "_id",
              foreignField: "_id",
              as: "autor",
            },
          },
          {
            $project: {
              cantidad: 1,
              nombre: { $first: "$autor.nombreUsuario" },
            },
          },
          { $sort: { cantidad: -1, nombre: 1, _id: 1 } },
        ])
        .exec(),
      this.comentarios
        .aggregate([
          { $match: filtro },
          ...this.publicacionesActivas(),
          {
            $facet: {
              comentariosPorDia: [
                {
                  $group: {
                    _id: {
                      $dateToString: {
                        format: "%Y-%m-%d",
                        date: "$fechaCreacion",
                        timezone: "-03:00",
                      },
                    },
                    cantidad: { $sum: 1 },
                  },
                },
                { $sort: { _id: 1 } },
              ],
              comentariosPorPublicacion: [
                {
                  $group: {
                    _id: "$publicacion",
                    nombre: { $first: "$post.titulo" },
                    cantidad: { $sum: 1 },
                  },
                },
                { $sort: { cantidad: -1, nombre: 1, _id: 1 } },
              ],
            },
          },
        ])
        .exec(),
    ]);
    return { publicacionesPorUsuario, ...resultados[0] };
  }

  private publicacionesActivas(): PipelineStage[] {
    return [
      {
        $lookup: {
          from: this.publicaciones.collection.name,
          localField: "publicacion",
          foreignField: "_id",
          pipeline: [{ $match: { activo: true } }, { $project: { titulo: 1 } }],
          as: "post",
        },
      },
      { $unwind: "$post" },
    ];
  }
}
