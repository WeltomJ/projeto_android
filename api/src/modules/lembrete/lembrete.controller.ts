import { Controller, Get, Post, Put, Delete, Body, Param, Query, Patch } from '@nestjs/common';
import { LembreteService } from './lembrete.service';
import { TaskSchedulerService } from '../../services/task-scheduler.service';

@Controller('lembrete')
export class LembreteController {
    constructor(
        private lembreteService: LembreteService,
        private taskSchedulerService: TaskSchedulerService,
    ) { }

    @Post()
    criar(@Body() data: any) {
        return this.lembreteService.criar(data);
    }

    @Get(':id')
    buscarPorId(@Param('id') id: string) {
        return this.lembreteService.buscarPorId(+id);
    }

    @Get('usuario/:usuarioId')
    listarPorUsuario(
        @Param('usuarioId') usuarioId: string,
        @Query('concluido') concluido?: string,
    ) {
        const concluidoBool = concluido === 'true' ? true : concluido === 'false' ? false : undefined;
        return this.lembreteService.listarPorUsuario(+usuarioId, concluidoBool);
    }

    @Get('usuario/:usuarioId/pendentes')
    listarPendentes(@Param('usuarioId') usuarioId: string) {
        return this.lembreteService.listarPendentes(+usuarioId);
    }

    @Put(':id')
    atualizar(@Param('id') id: string, @Body() data: any) {
        return this.lembreteService.atualizar(+id, data);
    }

    @Patch(':id/concluir')
    marcarConcluido(@Param('id') id: string) {
        return this.lembreteService.marcarConcluido(+id);
    }

    @Delete(':id')
    remover(@Param('id') id: string) {
        return this.lembreteService.remover(+id);
    }

    @Post('testar-notificacao/:usuarioId')
    testarNotificacao(@Param('usuarioId') usuarioId: string) {
        return this.taskSchedulerService.testarNotificacao(+usuarioId);
    }
}