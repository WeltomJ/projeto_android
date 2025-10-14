import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AvaliacaoService {
    constructor(private prisma: PrismaService) { }

    async criar(data: { usuario_id: number; local_id: number; nota: number; comentario?: string }) {
        if (data.nota < 1 || data.nota > 5) {
            throw new BadRequestException('A nota deve estar entre 1 e 5');
        }

        // Verifica se o usuário já avaliou este local
        const avaliacaoExistente = await this.prisma.avaliacao.findFirst({
            where: {
                usuario_id: data.usuario_id,
                local_id: data.local_id,
            },
        });

        if (avaliacaoExistente) {
            throw new BadRequestException('Você já avaliou este local');
        }

        return this.prisma.avaliacao.create({
            data,
            include: {
                usuario: { select: { id: true, nome: true, foto: true } },
                local: { select: { id: true, nome: true } },
            },
        });
    }

    async buscarPorId(id: number) {
        const avaliacao = await this.prisma.avaliacao.findUnique({
            where: { id },
            include: {
                usuario: { select: { id: true, nome: true, foto: true } },
                local: { select: { id: true, nome: true } },
            },
        });

        if (!avaliacao) {
            throw new NotFoundException('Avaliação não encontrada');
        }

        return avaliacao;
    }

    async listarPorLocal(localId: number) {
        return this.prisma.avaliacao.findMany({
            where: { local_id: localId },
            include: {
                usuario: { select: { id: true, nome: true, foto: true } },
            },
            orderBy: { criado_em: 'desc' },
        });
    }

    async listarPorUsuario(usuarioId: number) {
        return this.prisma.avaliacao.findMany({
            where: { usuario_id: usuarioId },
            include: {
                local: {
                    select: { id: true, nome: true },
                    include: { medias: { take: 1 } },
                },
            },
            orderBy: { criado_em: 'desc' },
        });
    }

    async atualizar(id: number, data: { nota?: number; comentario?: string }) {
        await this.buscarPorId(id);

        if (data.nota && (data.nota < 1 || data.nota > 5)) {
            throw new BadRequestException('A nota deve estar entre 1 e 5');
        }

        return this.prisma.avaliacao.update({
            where: { id },
            data,
            include: {
                usuario: { select: { id: true, nome: true, foto: true } },
                local: { select: { id: true, nome: true } },
            },
        });
    }

    async remover(id: number) {
        await this.buscarPorId(id);
        return this.prisma.avaliacao.delete({ where: { id } });
    }

    async obterMediaLocal(localId: number) {
        const result = await this.prisma.avaliacao.aggregate({
            where: { local_id: localId },
            _avg: { nota: true },
            _count: true,
        });

        return {
            media: result._avg.nota || 0,
            total: result._count,
        };
    }
}