import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class LocalService {
    constructor(private prisma: PrismaService) { }

    async criar(data: any) {
        return this.prisma.local.create({ data });
    }

    async buscarPorId(id: number) {
        const local = await this.prisma.local.findUnique({
            where: { id },
            include: {
                dono: { select: { id: true, nome: true, email: true, telefone: true } },
                medias: true,
                avaliacoes: {
                    include: {
                        usuario: { select: { id: true, nome: true, foto: true } },
                    },
                },
                horarios: true,
                amenidades: { include: { amenidade: true } },
                redes: true,
            },
        });

        if (!local) {
            throw new NotFoundException('Local não encontrado');
        }

        return local;
    }

    async listar(filtros?: { cidade?: string; estado?: string }) {
        const where: any = {};

        if (filtros?.cidade) {
            where.endereco_cidade = { contains: filtros.cidade };
        }

        if (filtros?.estado) {
            where.endereco_estado = filtros.estado;
        }

        return this.prisma.local.findMany({
            where,
            include: {
                dono: { select: { id: true, nome: true } },
                medias: { take: 1 },
                avaliacoes: { select: { nota: true } },
            },
        });
    }

    async atualizar(id: number, data: any) {
        await this.buscarPorId(id);
        return this.prisma.local.update({ where: { id }, data });
    }

    async remover(id: number) {
        await this.buscarPorId(id);
        return this.prisma.local.delete({ where: { id } });
    }

    async buscarPorProximidade(lat: number, lng: number, raio: number = 5) {
        // Aproximação simples usando diferença de coordenadas
        // Para produção, considere usar PostGIS ou cálculo Haversine
        const margem = raio / 111; // 1 grau ≈ 111km

        return this.prisma.local.findMany({
            where: {
                AND: [
                    { latitude: { gte: lat - margem, lte: lat + margem } },
                    { longitude: { gte: lng - margem, lte: lng + margem } },
                ],
            },
            include: {
                dono: { select: { id: true, nome: true } },
                medias: { take: 1 },
                avaliacoes: { select: { nota: true } },
            },
        });
    }

    async buscarPorLocador(locadorId: number) {
        return this.prisma.local.findMany({
            where: { dono_id: locadorId },
            include: {
                medias: { take: 1 },
                avaliacoes: { select: { nota: true } },
            },
        });
    }
}