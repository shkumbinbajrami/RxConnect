import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PharmacyStockController } from './pharmacy-stock.controller';
import { PharmacyStockService } from './pharmacy-stock.service';

@Module({
  imports: [AuthModule],
  controllers: [PharmacyStockController],
  providers: [PharmacyStockService],
})
export class PharmacyStockModule {}
