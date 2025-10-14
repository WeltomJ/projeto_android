
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { usuario } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsuarioService {
    constructor(private prisma: PrismaService) { }

    async create(data: any): Promise<usuario> {
        try {
            if (data.senha) {
                const saltRounds = 10;
                data.senha = await bcrypt.hash(data.senha, saltRounds);
            }
            const created = await this.prisma.usuario.create({ data });
            return this.sanitize(created);
        } catch (e: any) {
            // Prisma unique constraint violation (e.g. email)
            if (e?.code === 'P2002') {
                const targets = Array.isArray(e.meta?.target) ? e.meta.target : [e.meta?.target].filter(Boolean);
                if (targets?.includes('email')) {
                    throw new HttpException('E-mail já cadastrado', HttpStatus.CONFLICT);
                }
                throw new HttpException('Registro duplicado', HttpStatus.CONFLICT);
            }
            throw new HttpException('Erro ao criar usuário', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async findOne(id: string): Promise<usuario | null> {
        const user = await this.prisma.usuario.findUnique({ where: { id: Number(id) } });
        return user ? this.sanitize(user) : null;
    }

    async update(id: string | number, data: any): Promise<usuario> {
        const userId = typeof id === 'string' ? Number(id) : id;
        if (data.senha) {
            const saltRounds = 10;
            data.senha = await bcrypt.hash(data.senha, saltRounds);
        }
        const updated = await this.prisma.usuario.update({ where: { id: userId }, data });
        return this.sanitize(updated);
    }


    async remove(id: string): Promise<usuario> {
        const deleted = await this.prisma.usuario.delete({ where: { id: Number(id) } });
        return this.sanitize(deleted);
    }

    async login(email: string, senha: string): Promise<usuario> {
        const user = await this.prisma.usuario.findUnique({ where: { email } });
        if (!user) {
            throw new HttpException('Credenciais inválidas', HttpStatus.UNAUTHORIZED);
        }
        const senhaValida = await bcrypt.compare(senha, user.senha);
        if (!senhaValida) {
            throw new HttpException('Credenciais inválidas', HttpStatus.UNAUTHORIZED);
        }
        return this.sanitize(user);
    }

    private sanitize(user: usuario): any {
        const { senha, foto, ...rest } = user as any;
        return { ...rest };
    }
}
