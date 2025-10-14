import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) { }

    async validateUser(email: string, senha: string, tipo: 'usuario' | 'locador' = 'usuario') {
        let user: any;

        if (tipo === 'usuario') {
            user = await this.prisma.usuario.findUnique({ where: { email } });
        } else {
            user = await this.prisma.locador.findUnique({ where: { email } });
        }

        if (!user || !user.senha) {
            throw new UnauthorizedException('Credenciais inválidas');
        }

        const senhaValida = await bcrypt.compare(senha, user.senha);
        if (!senhaValida) {
            throw new UnauthorizedException('Credenciais inválidas');
        }

        const { senha: _, ...result } = user;
        return result;
    }

    async login(email: string, senha: string, tipo: 'usuario' | 'locador' = 'usuario') {
        const user = await this.validateUser(email, senha, tipo);

        const payload = {
            email: user.email,
            sub: user.id,
            tipo,
            nome: user.nome
        };

        const accessToken = this.jwtService.sign(payload);
        const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

        return {
            user,
            accessToken,
            refreshToken,
            expiresIn: 3600,
        };
    }

    async refreshToken(token: string) {
        try {
            const payload = this.jwtService.verify(token);

            const newPayload = {
                email: payload.email,
                sub: payload.sub,
                tipo: payload.tipo,
                nome: payload.nome,
            };

            const accessToken = this.jwtService.sign(newPayload);
            const refreshToken = this.jwtService.sign(newPayload, { expiresIn: '7d' });

            return {
                accessToken,
                refreshToken,
                expiresIn: 3600,
            };
        } catch (error) {
            throw new UnauthorizedException('Token inválido ou expirado');
        }
    }

    async validateToken(token: string) {
        try {
            const payload = this.jwtService.verify(token);
            return { valid: true, payload };
        } catch (error) {
            return { valid: false, payload: null };
        }
    }
}