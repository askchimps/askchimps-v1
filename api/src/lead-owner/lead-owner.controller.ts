import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { LeadOwnerService } from './lead-owner.service';
import { CreateLeadOwnerDto } from './dto/create-lead-owner.dto';
import { UpdateLeadOwnerDto } from './dto/update-lead-owner.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Lead Owner')
@ApiBearerAuth('JWT-auth')
@Controller({ path: 'lead-owner', version: '1' })
@UseGuards(JwtAuthGuard)
export class LeadOwnerController {
  constructor(private readonly LeadOwnerService: LeadOwnerService) {}

  @Post()
  create(@Body() createLeadOwnerDto: CreateLeadOwnerDto) {
    return this.LeadOwnerService.create(createLeadOwnerDto);
  }

  @Get()
  findAll() {
    return this.LeadOwnerService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.LeadOwnerService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLeadOwnerDto: UpdateLeadOwnerDto) {
    return this.LeadOwnerService.update(id, updateLeadOwnerDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.LeadOwnerService.remove(id);
  }
}

