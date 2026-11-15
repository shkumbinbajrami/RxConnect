import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../common/current-user.decorator';
import { RoleGuard } from '../common/role-guard.decorator';
import { UserEntity } from '../auth/entities/user.entity';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { UpdateMedicineDto } from './dto/update-medicine.dto';
import { MedicineEntity } from './entities/medicine.entity';
import { MedicineService } from './medicine.service';

@Controller('medicine')
export class MedicineController {
  constructor(private readonly medicineService: MedicineService) {}

  @Post()
  @RoleGuard(Role.ADMIN)
  create(@Body() dto: CreateMedicineDto): Promise<MedicineEntity> {
    return this.medicineService.create(dto);
  }

  @Get()
  @UseGuards(AuthGuard)
  findAll(@CurrentUser() user: UserEntity): Promise<MedicineEntity[]> {
    return this.medicineService.findAll(user);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  findOne(@CurrentUser() user: UserEntity, @Param('id', ParseUUIDPipe) id: string): Promise<MedicineEntity> {
    return this.medicineService.findOne(user, id);
  }

  @Patch(':id')
  @RoleGuard(Role.ADMIN)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateMedicineDto): Promise<MedicineEntity> {
    return this.medicineService.update(id, dto);
  }

  @Delete(':id')
  @RoleGuard(Role.ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<MedicineEntity> {
    return this.medicineService.remove(id);
  }
}
