import { Controller, Get } from '@nestjs/common';
import { VolumesService } from './volumes.service';
import { TokenVolumeDto } from './dto/token-volume.dto';

@Controller('volumes')
export class VolumesControler {
  constructor(private readonly volumesService: VolumesService) {}

  @Get()
  public getVolumes(): Promise<TokenVolumeDto[]> {
    return this.volumesService.getVolumes();
  }
}
