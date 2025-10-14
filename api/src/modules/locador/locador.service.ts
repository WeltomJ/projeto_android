import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class LocadorService {
    constructor(private prisma: PrismaService) { }

    async criar(data: { nome: string; email: string; senha: string; telefone?: string }) {
        const existe = await this.prisma.locador.findUnique({
            where: { email: data.email },
        });

        if (existe) {
            throw new ConflictException('Email já cadastrado');
        }

        const senhaHash = await bcrypt.hash(data.senha, 10);

        const locador = await this.prisma.locador.create({
            data: { ...data, senha: senhaHash },
        });

        const { senha, ...result } = locador;
        return result;
    }

    async buscarPorId(id: number) {
        const locador = await this.prisma.locador.findUnique({
            where: { id },
            select: {
                id: true,
                nome: true,
                email: true,
                telefone: true,
                foto: true,
                criado_em: true,
                atualizado_em: true,
                locais: {
                    include: {
                        medias: { take: 1 },
                    },
                },
            },
        });

        if (!locador) {
            throw new NotFoundException('Locador não encontrado');
        }

        return locador;
    }

    async atualizar(id: number, data: any) {
        await this.buscarPorId(id);

        if (data.senha) {
            data.senha = await bcrypt.hash(data.senha, 10);
        }

        const locador = await this.prisma.locador.update({
            where: { id },
            data,
        });

        const { senha, ...result } = locador;
        return result;
    }

    async remover(id: number) {
        await this.buscarPorId(id);
        return this.prisma.locador.delete({ where: { id } });
    }
}