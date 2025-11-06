import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
    private googleClient: OAuth2Client;

    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private configService: ConfigService,
    ) {
        const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
        this.googleClient = new OAuth2Client(clientId);
    }

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

    async googleLogin(idToken: string, tipo: 'usuario' | 'locador' = 'usuario') {
        try {
            // Verificar o token do Google
            const ticket = await this.googleClient.verifyIdToken({
                idToken,
                audience: this.configService.get<string>('GOOGLE_CLIENT_ID'),
            });

            const payload = ticket.getPayload();
            
            if (!payload) {
                throw new UnauthorizedException('Token do Google inválido');
            }

            const { sub: googleId, email, name, picture } = payload;

            if (!email) {
                throw new UnauthorizedException('Email não fornecido pelo Google');
            }

            // Buscar ou criar usuário/locador
            let user: any;

            if (tipo === 'usuario') {
                user = await this.prisma.usuario.findFirst({
                    where: {
                        OR: [
                            { google_id: googleId },
                            { email }
                        ]
                    }
                });

                if (!user) {
                    // Criar novo usuário
                    user = await this.prisma.usuario.create({
                        data: {
                            email,
                            nome: name || email.split('@')[0],
                            google_id: googleId,
                            provider: 'google',
                            foto: picture,
                        }
                    });
                } else if (!user.google_id) {
                    // Atualizar usuário existente com google_id
                    user = await this.prisma.usuario.update({
                        where: { id: user.id },
                        data: {
                            google_id: googleId,
                            provider: 'google',
                            foto: picture || user.foto,
                        }
                    });
                }
            } else {
                user = await this.prisma.locador.findFirst({
                    where: {
                        OR: [
                            { google_id: googleId },
                            { email }
                        ]
                    }
                });

                if (!user) {
                    // Criar novo locador
                    user = await this.prisma.locador.create({
                        data: {
                            email,
                            nome: name || email.split('@')[0],
                            google_id: googleId,
                            provider: 'google',
                            foto: picture,
                        }
                    });
                } else if (!user.google_id) {
                    // Atualizar locador existente com google_id
                    user = await this.prisma.locador.update({
                        where: { id: user.id },
                        data: {
                            google_id: googleId,
                            provider: 'google',
                            foto: picture || user.foto,
                        }
                    });
                }
            }

            // Gerar tokens JWT
            const jwtPayload = {
                email: user.email,
                sub: user.id,
                tipo,
                nome: user.nome
            };

            const accessToken = this.jwtService.sign(jwtPayload);
            const refreshToken = this.jwtService.sign(jwtPayload, { expiresIn: '7d' });

            const { senha: _, google_id: __, ...userWithoutSensitive } = user;

            return {
                user: userWithoutSensitive,
                accessToken,
                refreshToken,
                expiresIn: 3600,
            };
        } catch (error) {
            console.error('Erro no login do Google:', error);
            throw new UnauthorizedException('Falha na autenticação com Google');
        }
    }
}