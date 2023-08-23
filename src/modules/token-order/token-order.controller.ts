import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/guards/roles.decorator';
import { RolesGuard } from 'src/guards/roles.guard';
import { Role } from '../auth/user-role.enum';
import { AuthGuard } from 'src/guards/auth.guard';
import { PageDto } from 'src/utils/pagination/page.dto';
import { PageOptionsDto } from 'src/utils/pagination/page-options.dto';
import { TokenOrderService } from './token-order.service';
import { UpsertTokenOrderDto } from './dto/upsert-token-order.dto';
import { TokenOrderToDtoMapper } from './mapper/to-dto.mapper';
import { TokenOrderDto } from './dto/token-order.dto';

@Controller('token-order')
@ApiTags('Token Order', 'Admin')
@ApiBearerAuth()
export class TokenOrderController {
  constructor(
    private readonly tokenOrderService: TokenOrderService,
    private readonly toDtoMapper: TokenOrderToDtoMapper,
  ) {}

  @Get()
  @Roles(Role.Admin)
  @UseGuards(RolesGuard)
  @UseGuards(AuthGuard)
  public findAll(
    @Query() pageOptions: PageOptionsDto,
  ): Promise<PageDto<TokenOrderDto>> {
    return this.tokenOrderService.findAll(pageOptions);
  }

  @Put()
  @Roles(Role.Admin)
  @UseGuards(RolesGuard)
  @UseGuards(AuthGuard)
  public create(
    @Body() tokenOrderDto: UpsertTokenOrderDto,
  ): Promise<TokenOrderDto> {
    return this.toDtoMapper.toDtoAsync(
      this.tokenOrderService.upsert(tokenOrderDto),
    );
  }

  @Delete(':symbol')
  @Roles(Role.Admin)
  @UseGuards(RolesGuard)
  @UseGuards(AuthGuard)
  public delete(@Param('symbol') symbol: string): Promise<void> {
    return this.tokenOrderService.delete(symbol);
  }
}
