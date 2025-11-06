import { Module } from '@nestjs/common';
import { LembreteController } from './lembrete.controller';
import { LembreteService } from './lembrete.service';
import { PrismaService } from '../../prisma/prisma.service';
import { TaskSchedulerService } from '../../services/task-scheduler.service';
import { NotificationsService } from '../../services/notifications.service';

@Module({
    controllers: [LembreteController],
    providers: [LembreteService, PrismaService, TaskSchedulerService, NotificationsService],
})
export class LembreteModule { }