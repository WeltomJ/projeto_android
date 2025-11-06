import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { CriarLocadorDto } from './dto/criar-locador.dto';
import { AtualizarLocadorDto } from './dto/atualizar-locador.dto';

@Injectable()
export class LocadorService {
    constructor(private prisma: PrismaService) { }

    async criar(data: CriarLocadorDto) {
        const existe = await this.prisma.locador.findUnique({
            where: { email: data.email },
        });

        if (existe) {
            throw new ConflictException('Email já cadastrado');
        }

        // Se tiver senha, fazer hash. Se não, deixar null (login via Google)
        let senhaHash = null;
        if (data.senha) {
            senhaHash = await bcrypt.hash(data.senha, 10);
        }

        const locador = await this.prisma.locador.create({
            data: { 
                ...data, 
                senha: senhaHash,
                provider: data.provider || 'local'
            },
        });

        const { senha, ...result } = locador;
        return result;
    }

    async listar() {
        return this.prisma.locador.findMany({
            select: {
                id: true,
                nome: true,
                email: true,
                telefone: true,
                foto: true,
                criado_em: true,
                _count: {
                    select: { locais: true }
                }
            },
            orderBy: { criado_em: 'desc' }
        });
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

    async atualizar(id: number, data: AtualizarLocadorDto) {
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

    async atualizarFoto(id: number, file: any) {
        await this.buscarPorId(id);
        
        // Aqui você pode fazer upload para cloud storage
        // Por enquanto, vamos apenas salvar a URL ou path
        const fotoUrl = file ? `/uploads/locador/${file.filename}` : null;

        const locador = await this.prisma.locador.update({
            where: { id },
            data: { foto: fotoUrl },
        });

        const { senha, ...result } = locador;
        return result;
    }

    async remover(id: number) {
        await this.buscarPorId(id);
        return this.prisma.locador.delete({ where: { id } });
    }
}