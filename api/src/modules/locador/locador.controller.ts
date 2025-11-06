import { Controller, Get, Post, Put, Delete, Body, Param, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { LocadorService } from './locador.service';
import { CriarLocadorDto } from './dto/criar-locador.dto';
import { AtualizarLocadorDto } from './dto/atualizar-locador.dto';

@Controller('locador')
export class LocadorController {
    constructor(private locadorService: LocadorService) { }

    @Post()
    criar(@Body() data: CriarLocadorDto) {
        return this.locadorService.criar(data);
    }

    @Get()
    listar() {
        return this.locadorService.listar();
    }

    @Get(':id')
    buscarPorId(@Param('id') id: string) {
        return this.locadorService.buscarPorId(+id);
    }

    @Put(':id')
    atualizar(@Param('id') id: string, @Body() data: AtualizarLocadorDto) {
        return this.locadorService.atualizar(+id, data);
    }

    @Post(':id/foto')
    @UseInterceptors(FileInterceptor('foto'))
    atualizarFoto(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
        return this.locadorService.atualizarFoto(+id, file);
    }

    @Delete(':id')
    remover(@Param('id') id: string) {
        return this.locadorService.remover(+id);
    }
}