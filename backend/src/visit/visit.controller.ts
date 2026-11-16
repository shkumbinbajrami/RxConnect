import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { Role } from '@prisma/client';
import { UserEntity } from '../auth/entities/user.entity';
import { CurrentUser } from '../common/current-user.decorator';
import { RoleGuard } from '../common/role-guard.decorator';
import { CreateVisitDto } from './dto/create-visit.dto';
import { ListVisitsDto } from './dto/list-visits.dto';
import { ListResult } from '../common/dto/list-query.dto';
import { UpdateVisitDto } from './dto/update-visit.dto';
import { VisitEntity } from './entities/visit.entity';
import { VisitService } from './visit.service';

@Controller('visits')
export class VisitController {
  constructor(private readonly visitService: VisitService) {}

  @Post()
  @RoleGuard(Role.DOCTOR)
  create(@CurrentUser() doctor: UserEntity, @Body() dto: CreateVisitDto): Promise<VisitEntity> {
    return this.visitService.create(doctor.id, dto);
  }

  @Get()
  @RoleGuard(Role.DOCTOR, Role.PATIENT)
  findAll(@CurrentUser() user: UserEntity, @Query() query: ListVisitsDto): Promise<ListResult<VisitEntity>> {
    return this.visitService.findAll(user, query);
  }

  @Get('patients/search')
  @RoleGuard(Role.DOCTOR)
  findPatient(@Query('email') email: string) {
    return this.visitService.findPatient(email);
  }

  @Get(':id')
  @RoleGuard(Role.DOCTOR, Role.PATIENT)
  findOne(@CurrentUser() user: UserEntity, @Param('id', ParseUUIDPipe) id: string): Promise<VisitEntity> {
    return this.visitService.findOne(user, id);
  }

  @Patch(':id')
  @RoleGuard(Role.DOCTOR)
  update(@CurrentUser() doctor: UserEntity, @Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateVisitDto): Promise<VisitEntity> {
    return this.visitService.update(doctor.id, id, dto);
  }

  @Post(':id/start')
  @RoleGuard(Role.DOCTOR)
  start(@CurrentUser() doctor: UserEntity, @Param('id', ParseUUIDPipe) id: string): Promise<VisitEntity> {
    return this.visitService.start(doctor.id, id);
  }

  @Post(':id/complete')
  @RoleGuard(Role.DOCTOR)
  complete(@CurrentUser() doctor: UserEntity, @Param('id', ParseUUIDPipe) id: string): Promise<VisitEntity> {
    return this.visitService.complete(doctor.id, id);
  }

  @Post(':id/cancel')
  @RoleGuard(Role.DOCTOR)
  cancel(@CurrentUser() doctor: UserEntity, @Param('id', ParseUUIDPipe) id: string): Promise<VisitEntity> {
    return this.visitService.cancel(doctor.id, id);
  }

  @Post(':id/discontinue')
  @RoleGuard(Role.DOCTOR)
  discontinue(@CurrentUser() doctor: UserEntity, @Param('id', ParseUUIDPipe) id: string): Promise<VisitEntity> {
    return this.visitService.discontinue(doctor.id, id);
  }

  @Delete(':id')
  @RoleGuard(Role.DOCTOR)
  remove(@CurrentUser() doctor: UserEntity, @Param('id', ParseUUIDPipe) id: string): Promise<VisitEntity> {
    return this.visitService.remove(doctor.id, id);
  }
}
