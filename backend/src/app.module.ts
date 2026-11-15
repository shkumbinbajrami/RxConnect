import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { APP_FILTER } from '@nestjs/core';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), AuthModule],
  controllers: [AppController],
  providers: [AppService, { provide: APP_FILTER, useClass: PrismaExceptionFilter }],
})
export class AppModule {}
