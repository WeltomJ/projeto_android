import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FavoritoService {
    constructor(private prisma: PrismaService) { }

    async adicionar(data: { usuario_id: number; local_id: number }) {
        const existe = await this.prisma.favorito.findUnique({
            where: {
                usuario_id_local_id: {
                    usuario_id: data.usuario_id,
                    local_id: data.local_id,
                },
            },
        });

        if (existe) {
            throw new ConflictException('Local já está nos favoritos');
        }

        return this.prisma.favorito.create({
            data,
            include: {
                local: {
                    include: {
                        medias: { take: 1 },
                    },
                },
            },
        });
    }

    async listarPorUsuario(usuarioId: number) {
        return this.prisma.favorito.findMany({
            where: { usuario_id: usuarioId },
            include: {
                local: {
                    include: {
                        medias: { take: 1 },
                        avaliacoes: { select: { nota: true } },
                    },
                },
            },
            orderBy: { criado_em: 'desc' },
        });
    }

    async verificar(usuarioId: number, localId: number) {
        const favorito = await this.prisma.favorito.findUnique({
            where: {
                usuario_id_local_id: {
                    usuario_id: usuarioId,
                    local_id: localId,
                },
            },
        });

        return { isFavorito: !!favorito, favorito };
    }

    async remover(id: number) {
        const favorito = await this.prisma.favorito.findUnique({ where: { id } });

        if (!favorito) {
            throw new NotFoundException('Favorito não encontrado');
        }

        return this.prisma.favorito.delete({ where: { id } });
    }

    async removerPorLocalUsuario(usuarioId: number, localId: number) {
        const favorito = await this.prisma.favorito.findUnique({
            where: {
                usuario_id_local_id: {
                    usuario_id: usuarioId,
                    local_id: localId,
                },
            },
        });

        if (!favorito) {
            throw new NotFoundException('Favorito não encontrado');
        }

        return this.prisma.favorito.delete({
            where: {
                usuario_id_local_id: {
                    usuario_id: usuarioId,
                    local_id: localId,
                },
            },
        });
    }
}