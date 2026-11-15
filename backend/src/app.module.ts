import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { APP_FILTER } from '@nestjs/core';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';
import { MedicineModule } from './medicine/medicine.module';
import { PharmacyStockModule } from './pharmacy-stock/pharmacy-stock.module';
import { VisitModule } from './visit/visit.module';
import { PrescriptionModule } from './prescription/prescription.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), AuthModule, MedicineModule, PharmacyStockModule, VisitModule, PrescriptionModule],
  controllers: [AppController],
  providers: [AppService, { provide: APP_FILTER, useClass: PrismaExceptionFilter }],
})
export class AppModule {}
