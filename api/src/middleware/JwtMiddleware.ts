import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtMiddleware implements NestMiddleware {
    constructor(private jwtService: JwtService) { }

    use(req: Request, res: Response, next: NextFunction) {
        const publicRoutes = ['/auth/login', '/auth/refresh', '/auth/validate', '/usuario/register'];

        if (publicRoutes.some(route => req.path.includes(route))) {
            return next();
        }

        const token = req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            throw new UnauthorizedException('Token não fornecido');
        }

        try {
            const payload = this.jwtService.verify(token);
            req['user'] = payload;
            next();
        } catch (error) {
            throw new UnauthorizedException('Token inválido ou expirado');
        }
    }
}