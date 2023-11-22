import { Controller, Post, Body, Delete, Param } from '@nestjs/common';
import { PriceNotifService } from './price-notif.service';
import { FavTokenDto } from './dto/fav-token.dto';
import { InitFavTokensDto } from './dto/init-fav-tokens.dto';
import { ApiTags } from '@nestjs/swagger';

@Controller('device')
@ApiTags('Price-notification controller')
export class PriceNotifController {
  constructor(private priceNotifService: PriceNotifService) {}

  @Post('initial-favs')
  public addInitialFavoriteTokens(
    @Body() initialFavTokens: InitFavTokensDto,
  ): void {
    this.priceNotifService.addInitFavorites(
      initialFavTokens.deviceId,
      initialFavTokens.tokens,
    );
  }

  @Post('add-token')
  public addToken(@Body() favTokenDto: FavTokenDto): void {
    this.priceNotifService.addNewFavoriteToken(
      favTokenDto.deviceId,
      favTokenDto.token,
    );
  }

  @Delete('remove-token/:deviceId/:token')
  public deleteToken(
    @Param('deviceId') deviceId: string,
    @Param('token') token: string,
  ): void {
    this.priceNotifService.deleteFavoriteToken(deviceId, token);
  }
}
