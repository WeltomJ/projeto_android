import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

export interface ExpoPushMessage {
    to: string | string[];
    title: string;
    body: string;
    data?: any;
    sound?: 'default' | null;
    badge?: number;
    channelId?: string;
}

@Injectable()
export class NotificationsService {
    private readonly logger = new Logger(NotificationsService.name);
    private readonly EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

    /**
     * Envia uma notificação push via Expo
     */
    async sendPushNotification(message: ExpoPushMessage): Promise<void> {
        try {
            // Valida se o token é válido
            if (!this.isValidExpoPushToken(message.to)) {
                this.logger.warn(`Token Expo inválido: ${message.to}`);
                return;
            }

            const response = await axios.post(
                this.EXPO_PUSH_URL,
                {
                    to: message.to,
                    title: message.title,
                    body: message.body,
                    data: message.data || {},
                    sound: message.sound || 'default',
                    badge: message.badge,
                    channelId: message.channelId || 'default',
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                }
            );

            this.logger.log(`Notificação enviada com sucesso: ${JSON.stringify(response.data)}`);
        } catch (error) {
            this.logger.error(`Erro ao enviar notificação: ${error.message}`, error.stack);
        }
    }

    /**
     * Envia notificações em lote
     */
    async sendBatchPushNotifications(messages: ExpoPushMessage[]): Promise<void> {
        try {
            // Filtra apenas tokens válidos
            const validMessages = messages.filter(msg => this.isValidExpoPushToken(msg.to));

            if (validMessages.length === 0) {
                this.logger.warn('Nenhum token válido encontrado para envio em lote');
                return;
            }

            const response = await axios.post(
                this.EXPO_PUSH_URL,
                validMessages,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                }
            );

            this.logger.log(`${validMessages.length} notificações enviadas em lote com sucesso`);
        } catch (error) {
            this.logger.error(`Erro ao enviar notificações em lote: ${error.message}`, error.stack);
        }
    }

    /**
     * Valida se o token é um Expo Push Token válido
     */
    private isValidExpoPushToken(token: string | string[]): boolean {
        if (Array.isArray(token)) {
            return token.every(t => this.isValidExpoPushToken(t));
        }

        if (!token || typeof token !== 'string') {
            return false;
        }

        // Tokens Expo começam com "ExponentPushToken[" ou "ExpoPushToken["
        return token.startsWith('ExponentPushToken[') || token.startsWith('ExpoPushToken[');
    }
}
