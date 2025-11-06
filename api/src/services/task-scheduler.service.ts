import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../services/notifications.service';

@Injectable()
export class TaskSchedulerService {
    private readonly logger = new Logger(TaskSchedulerService.name);

    constructor(
        private prisma: PrismaService,
        private notificationsService: NotificationsService,
    ) {}

    /**
     * Verifica lembretes pendentes a cada minuto
     */
    @Cron(CronExpression.EVERY_MINUTE)
    async verificarLembretesPendentes() {
        this.logger.debug('Verificando lembretes pendentes...');

        const agora = new Date();
        
        // Busca lembretes que já passaram do horário e ainda não foram notificados
        const lembretesPendentes = await this.prisma.lembrete.findMany({
            where: {
                lembrar_em: {
                    lte: agora,
                },
                concluido: false,
                notificado: false,
            },
            include: {
                usuario: {
                    select: {
                        id: true,
                        nome: true,
                        expo_push_token: true,
                    }
                },
                local: {
                    select: {
                        id: true,
                        nome: true,
                        endereco_logradouro: true,
                        endereco_cidade: true,
                    }
                }
            },
            take: 50, // Limita para não sobrecarregar
        });

        if (lembretesPendentes.length === 0) {
            this.logger.debug('Nenhum lembrete pendente encontrado');
            return;
        }

        this.logger.log(`Encontrados ${lembretesPendentes.length} lembretes pendentes`);

        // Envia notificações
        for (const lembrete of lembretesPendentes) {
            try {
                // Verifica se o usuário tem token de notificação
                if (!lembrete.usuario.expo_push_token) {
                    this.logger.warn(`Usuário ${lembrete.usuario.id} não possui token Expo`);
                    
                    // Marca como notificado mesmo sem enviar (para não ficar tentando sempre)
                    await this.prisma.lembrete.update({
                        where: { id: lembrete.id },
                        data: { notificado: true },
                    });
                    
                    continue;
                }

                // Monta a mensagem da notificação
                let body = lembrete.descricao || 'Você tem um lembrete!';
                
                if (lembrete.local) {
                    body = `${lembrete.local.nome} - ${lembrete.local.endereco_cidade}`;
                    if (lembrete.descricao) {
                        body += `\n${lembrete.descricao}`;
                    }
                }

                // Envia a notificação
                await this.notificationsService.sendPushNotification({
                    to: lembrete.usuario.expo_push_token,
                    title: `🔔 ${lembrete.titulo}`,
                    body,
                    data: {
                        lembreteId: lembrete.id,
                        localId: lembrete.local?.id,
                        type: 'lembrete',
                    },
                    sound: 'default',
                });

                // Marca como notificado
                await this.prisma.lembrete.update({
                    where: { id: lembrete.id },
                    data: { notificado: true },
                });

                this.logger.log(`Notificação enviada para lembrete ${lembrete.id} - ${lembrete.titulo}`);
            } catch (error) {
                this.logger.error(
                    `Erro ao processar lembrete ${lembrete.id}: ${error.message}`,
                    error.stack
                );
            }
        }

        this.logger.log(`Processamento de lembretes concluído`);
    }

    /**
     * Limpa lembretes antigos concluídos (executado diariamente à meia-noite)
     */
    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async limparLembretesAntigos() {
        this.logger.log('Limpando lembretes antigos...');

        const dataLimite = new Date();
        dataLimite.setDate(dataLimite.getDate() - 30); // 30 dias atrás

        const resultado = await this.prisma.lembrete.deleteMany({
            where: {
                concluido: true,
                lembrar_em: {
                    lt: dataLimite,
                },
            },
        });

        this.logger.log(`${resultado.count} lembretes antigos removidos`);
    }

    /**
     * Método manual para testar o envio de notificações
     */
    async testarNotificacao(usuarioId: number) {
        const usuario = await this.prisma.usuario.findUnique({
            where: { id: usuarioId },
            select: { expo_push_token: true, nome: true },
        });

        if (!usuario?.expo_push_token) {
            throw new Error('Usuário não possui token Expo');
        }

        await this.notificationsService.sendPushNotification({
            to: usuario.expo_push_token,
            title: '🎉 Notificação de Teste',
            body: `Olá ${usuario.nome}! Esta é uma notificação de teste.`,
            data: { type: 'test' },
        });

        return { success: true, message: 'Notificação de teste enviada!' };
    }
}
