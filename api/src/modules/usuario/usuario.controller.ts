import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Put } from '@nestjs/common';
import { UsuarioService } from './usuario.service';

@Controller('usuario')
export class UsuarioController {
    constructor(
        private readonly usuarioService: UsuarioService
    ) {
    }

    @Post('register')
    async create(@Body() createUsuarioDto: any) {
        return await this.usuarioService.create(createUsuarioDto);
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        const user = await this.usuarioService.findOne(id);
        if (!user) {
            throw new HttpException('Usuário não encontrado', HttpStatus.NOT_FOUND);
        }
        return user;
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() updateUsuarioDto: any) {
        return await this.usuarioService.update(id, updateUsuarioDto);
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        return await this.usuarioService.remove(id);
    }

    @Post('login')
    async login(@Body() body: { email: string; senha: string }) {
        return await this.usuarioService.login(body.email, body.senha);
    }

    @Put(':id/expo-token')
    async updateExpoPushToken(@Param('id') id: string, @Body() body: { expoPushToken: string }) {
        return await this.usuarioService.updateExpoPushToken(Number(id), body.expoPushToken);
    }

}