import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class LembreteService {
    constructor(private prisma: PrismaService) { }

    async criar(data: {
        usuario_id: number;
        local_id?: number;
        titulo: string;
        descricao?: string;
        lembrar_em: string;
    }) {
        return this.prisma.lembrete.create({
            data: {
                ...data,
                lembrar_em: new Date(data.lembrar_em),
            },
            include: {
                local: { select: { id: true, nome: true } },
            },
        });
    }

    async buscarPorId(id: number) {
        const lembrete = await this.prisma.lembrete.findUnique({
            where: { id },
            include: {
                local: { select: { id: true, nome: true } },
            },
        });

        if (!lembrete) {
            throw new NotFoundException('Lembrete não encontrado');
        }

        return lembrete;
    }

    async listarPorUsuario(usuarioId: number, concluido?: boolean) {
        const where: any = { usuario_id: usuarioId };

        if (concluido !== undefined) {
            where.concluido = concluido;
        }

        return this.prisma.lembrete.findMany({
            where,
            include: {
                local: { select: { id: true, nome: true } },
            },
            orderBy: { lembrar_em: 'asc' },
        });
    }

    async atualizar(id: number, data: any) {
        await this.buscarPorId(id);

        if (data.lembrar_em) {
            data.lembrar_em = new Date(data.lembrar_em);
        }

        return this.prisma.lembrete.update({
            where: { id },
            data,
            include: {
                local: { select: { id: true, nome: true } },
            },
        });
    }

    async marcarConcluido(id: number) {
        return this.atualizar(id, { concluido: true });
    }

    async remover(id: number) {
        await this.buscarPorId(id);
        return this.prisma.lembrete.delete({ where: { id } });
    }

    async listarPendentes(usuarioId: number) {
        const agora = new Date();

        return this.prisma.lembrete.findMany({
            where: {
                usuario_id: usuarioId,
                concluido: false,
                lembrar_em: { lte: agora },
            },
            include: {
                local: { select: { id: true, nome: true } },
            },
            orderBy: { lembrar_em: 'asc' },
        });
    }
}