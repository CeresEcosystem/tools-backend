import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SymbolsService } from './symbols.service';
import { SymbolAdminDto } from './dto/symbol-admin-dto';
import { UpdateSymbolDto } from './dto/update-symbol-dto';
import {
  Roles,
  Role,
  RolesGuard,
  AuthGuard,
  PageDto,
  PageOptionsDto,
} from '@ceresecosystem/ceres-lib/packages/ceres-backend-common';

@Controller('symbols')
@ApiTags('Symbols Controller', 'Admin')
@ApiBearerAuth()
@Roles(Role.Admin)
@UseGuards(RolesGuard)
@UseGuards(AuthGuard)
export class SymbolsController {
  constructor(private readonly symbolsService: SymbolsService) {}

  @Get()
  public findAll(
    @Query() pageOptions: PageOptionsDto,
  ): Promise<PageDto<SymbolAdminDto>> {
    return this.symbolsService.findAll(pageOptions);
  }

  @Put(':id')
  public update(
    @Param('id') id: string,
    @Body() updateSymbolDto: UpdateSymbolDto,
  ): Promise<void> {
    return this.symbolsService.update(id, updateSymbolDto);
  }
}
