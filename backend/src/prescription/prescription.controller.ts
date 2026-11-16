import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { Role } from '@prisma/client';
import { CurrentUser } from '../common/current-user.decorator';
import { RoleGuard } from '../common/role-guard.decorator';
import { UserEntity } from '../auth/entities/user.entity';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';
import { IssuePrescriptionDto } from './dto/issue-prescription.dto';
import { LookupPrescriptionDto } from './dto/lookup-prescription.dto';
import { DispensePrescriptionDto } from './dto/dispense-prescription.dto';
import { ReverseDispenseDto } from './dto/reverse-dispense.dto';
import { PrescriptionEntity } from './entities/prescription.entity';
import { PrescriptionService } from './prescription.service';
import { ListPrescriptionsDto } from './dto/list-prescriptions.dto';
import { ListDispensesDto } from './dto/list-dispenses.dto';
import { ListResult } from '../common/dto/list-query.dto';

@Controller('prescriptions')
export class PrescriptionController {
  constructor(private readonly prescriptionService: PrescriptionService) {}

  @Post()
  @RoleGuard(Role.DOCTOR)
  create(@CurrentUser() user: UserEntity, @Body() dto: CreatePrescriptionDto): Promise<PrescriptionEntity> { return this.prescriptionService.create(user.id, dto); }

  @Get()
  @RoleGuard(Role.DOCTOR, Role.PATIENT)
  findAll(@CurrentUser() user: UserEntity, @Query() query: ListPrescriptionsDto): Promise<ListResult<PrescriptionEntity>> { return this.prescriptionService.findAll(user, query); }

  @Post('lookup')
  @RoleGuard(Role.PHARMACY)
  lookup(@Body() dto: LookupPrescriptionDto): Promise<PrescriptionEntity> { return this.prescriptionService.lookup(dto); }

  @Get('dispenses/mine')
  @RoleGuard(Role.PHARMACY)
  pharmacyDispenses(@CurrentUser() user: UserEntity, @Query() query: ListDispensesDto) { return this.prescriptionService.pharmacyDispenses(user.id, query); }

  @Post('dispenses/:id/reverse')
  @RoleGuard(Role.PHARMACY)
  reverse(@CurrentUser() user: UserEntity, @Param('id', ParseUUIDPipe) id: string, @Body() dto: ReverseDispenseDto) { return this.prescriptionService.reverse(user.id, id, dto.reason); }

  @Get(':id')
  @RoleGuard(Role.DOCTOR, Role.PATIENT)
  findOne(@CurrentUser() user: UserEntity, @Param('id', ParseUUIDPipe) id: string): Promise<PrescriptionEntity> { return this.prescriptionService.findOne(user, id); }

  @Patch(':id')
  @RoleGuard(Role.DOCTOR)
  update(@CurrentUser() user: UserEntity, @Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdatePrescriptionDto): Promise<PrescriptionEntity> { return this.prescriptionService.update(user.id, id, dto); }

  @Delete(':id')
  @RoleGuard(Role.DOCTOR)
  remove(@CurrentUser() user: UserEntity, @Param('id', ParseUUIDPipe) id: string): Promise<void> { return this.prescriptionService.remove(user.id, id); }

  @Post(':id/issue')
  @RoleGuard(Role.DOCTOR)
  issue(@CurrentUser() user: UserEntity, @Param('id', ParseUUIDPipe) id: string, @Body() dto: IssuePrescriptionDto): Promise<PrescriptionEntity> { return this.prescriptionService.issue(user.id, id, dto.expiresAt); }

  @Post(':id/cancel')
  @RoleGuard(Role.DOCTOR)
  cancel(@CurrentUser() user: UserEntity, @Param('id', ParseUUIDPipe) id: string): Promise<PrescriptionEntity> { return this.prescriptionService.cancel(user.id, id); }

  @Get(':id/access')
  @RoleGuard(Role.DOCTOR, Role.PATIENT)
  access(@CurrentUser() user: UserEntity, @Param('id', ParseUUIDPipe) id: string) { return this.prescriptionService.access(user, id); }

  @Get(':id/fills')
  @RoleGuard(Role.DOCTOR, Role.PATIENT)
  fills(@CurrentUser() user: UserEntity, @Param('id', ParseUUIDPipe) id: string) { return this.prescriptionService.fills(user, id); }

  @Get(':id/pharmacies')
  @RoleGuard(Role.DOCTOR, Role.PATIENT)
  pharmacies(@CurrentUser() user: UserEntity, @Param('id', ParseUUIDPipe) id: string) { return this.prescriptionService.pharmacies(user, id); }

  @Post(':id/dispense')
  @RoleGuard(Role.PHARMACY)
  dispense(@CurrentUser() user: UserEntity, @Param('id', ParseUUIDPipe) id: string, @Body() dto: DispensePrescriptionDto) { return this.prescriptionService.dispense(user.id, id, dto); }
}
