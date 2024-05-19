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
import { TokenOrderService } from './token-order.service';
import { UpsertTokenOrderDto } from './dto/upsert-token-order.dto';
import { TokenOrderToDtoMapper } from './mapper/to-dto.mapper';
import { TokenOrderDto } from './dto/token-order.dto';
import {
  Roles,
  Role,
  RolesGuard,
  AuthGuard,
  PageDto,
  PageOptionsDto,
} from '@ceresecosystem/ceres-lib/packages/ceres-backend-common';

@Controller('token-order')
@ApiTags('Token Order Controller', 'Admin')
@ApiBearerAuth()
@Roles(Role.Admin)
@UseGuards(RolesGuard)
@UseGuards(AuthGuard)
export class TokenOrderController {
  constructor(
    private readonly tokenOrderService: TokenOrderService,
    private readonly toDtoMapper: TokenOrderToDtoMapper,
  ) {}

  @Get()
  public findAll(
    @Query() pageOptions: PageOptionsDto,
  ): Promise<PageDto<TokenOrderDto>> {
    return this.tokenOrderService.findAll(pageOptions);
  }

  @Put()
  public upsert(
    @Body() tokenOrderDto: UpsertTokenOrderDto,
  ): Promise<TokenOrderDto> {
    return this.toDtoMapper.toDtoAsync(
      this.tokenOrderService.upsert(tokenOrderDto),
    );
  }

  @Delete(':symbol')
  public delete(@Param('symbol') symbol: string): Promise<void> {
    return this.tokenOrderService.delete(symbol);
  }
}
