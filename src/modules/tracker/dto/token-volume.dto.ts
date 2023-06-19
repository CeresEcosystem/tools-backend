interface TimestampleVolumeTupleDto {
  timestamp: string;
  volume: string;
}

export interface TokenVolumeDto {
  volumes: TimestampleVolumeTupleDto[];
}

export class TokenVolume implements TokenVolumeDto {
  volumes: TimestampleVolumeTupleDto[];

  constructor(data?: any) {
    if (data) {
      let extractedData: TimestampleVolumeTupleDto[] = [];
      for (const row of data) {
        const [timestamp, volume] = row;
        extractedData.push({
          timestamp: String(timestamp),
          volume: String(volume),
        });
      }
      this.volumes = extractedData;
    } else {
      this.volumes = [];
    }
  }
}
