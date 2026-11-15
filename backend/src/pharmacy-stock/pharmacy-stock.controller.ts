import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { Role } from '@prisma/client';
import { UserEntity } from '../auth/entities/user.entity';
import { CurrentUser } from '../common/current-user.decorator';
import { RoleGuard } from '../common/role-guard.decorator';
import { AddStockDto } from './dto/add-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { PharmacyStockEntity } from './entities/pharmacy-stock.entity';
import { PharmacyStockService } from './pharmacy-stock.service';

@Controller('pharmacy/stock')
@RoleGuard(Role.PHARMACY)
export class PharmacyStockController {
  constructor(private readonly pharmacyStockService: PharmacyStockService) {}

  @Get()
  findAll(@CurrentUser() user: UserEntity): Promise<PharmacyStockEntity[]> {
    return this.pharmacyStockService.findAll(user.id);
  }

  @Get(':medicineId')
  findOne(@CurrentUser() user: UserEntity, @Param('medicineId', ParseUUIDPipe) medicineId: string): Promise<PharmacyStockEntity> {
    return this.pharmacyStockService.findOne(user.id, medicineId);
  }

  @Post()
  add(@CurrentUser() user: UserEntity, @Body() dto: AddStockDto): Promise<PharmacyStockEntity> {
    return this.pharmacyStockService.add(user.id, dto);
  }

  @Patch(':medicineId')
  update(@CurrentUser() user: UserEntity, @Param('medicineId', ParseUUIDPipe) medicineId: string, @Body() dto: UpdateStockDto): Promise<PharmacyStockEntity> {
    return this.pharmacyStockService.update(user.id, medicineId, dto);
  }

  @Delete(':medicineId')
  remove(@CurrentUser() user: UserEntity, @Param('medicineId', ParseUUIDPipe) medicineId: string): Promise<PharmacyStockEntity> {
    return this.pharmacyStockService.remove(user.id, medicineId);
  }
}
