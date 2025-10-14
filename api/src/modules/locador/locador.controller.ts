import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { LocadorService } from './locador.service';

@Controller('locador')
export class LocadorController {
    constructor(private locadorService: LocadorService) { }

    @Post()
    criar(@Body() data: any) {
        return this.locadorService.criar(data);
    }

    @Get(':id')
    buscarPorId(@Param('id') id: string) {
        return this.locadorService.buscarPorId(+id);
    }

    @Put(':id')
    atualizar(@Param('id') id: string, @Body() data: any) {
        return this.locadorService.atualizar(+id, data);
    }

    @Delete(':id')
    remover(@Param('id') id: string) {
        return this.locadorService.remover(+id);
    }
}