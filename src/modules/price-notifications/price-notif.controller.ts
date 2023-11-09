import { Controller, Post, Body, Delete, Param } from '@nestjs/common';
import { PriceNotifService } from './price-notif.service';
import { FavTokenDto } from './dto/fav-token.dto';
import { InitFavTokensDto } from './dto/init-fav-tokens.dto';

@Controller('device')
export class PriceNotifController {
  constructor(private priceNotifService: PriceNotifService) {}

  @Post('initialFavs')
  addInitialFavoriteTokens(@Body() initialFavTokens: InitFavTokensDto) {
    this.priceNotifService.addInitFavorites(
      initialFavTokens.deviceId,
      initialFavTokens.tokens,
    );
  }

  @Post('addToken')
  addToken(@Body() favTokenDto: FavTokenDto) {
    this.priceNotifService.addNewFavoriteToken(
      favTokenDto.deviceId,
      favTokenDto.token,
    );
  }

  @Delete('removeToken/:deviceId/:token')
  deleteToken(
    @Param('deviceId') deviceId: string,
    @Param('token') token: string,
  ) {
    this.priceNotifService.deleteFavoriteToken(deviceId, token);
  }
}
