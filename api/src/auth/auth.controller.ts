import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(
        @Body() body: { email: string; senha: string; tipo?: 'usuario' | 'locador' },
    ) {
        return this.authService.login(body.email, body.senha, body.tipo || 'usuario');
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refresh(@Body() body: { refreshToken: string }) {
        return this.authService.refreshToken(body.refreshToken);
    }

    @Post('validate')
    @HttpCode(HttpStatus.OK)
    async validate(@Body() body: { token: string }) {
        return this.authService.validateToken(body.token);
    }

    @Post('google')
    @HttpCode(HttpStatus.OK)
    async googleLogin(
        @Body() body: { idToken: string; tipo?: 'usuario' | 'locador' },
    ) {
        return this.authService.googleLogin(body.idToken, body.tipo || 'usuario');
    }
}