export interface DateTokenVolumeTupleDto {
  token: string;
  date: string;
  volume: string;
}

export interface FormatedTokenVolumeDto {
  volumes: DateTokenVolumeTupleDto[];
}

export class FormatedTokenVolume implements FormatedTokenVolumeDto {
  volumes: DateTokenVolumeTupleDto[];

  constructor(data?: DateTokenVolumeTupleDto[]) {
    if (data) {
      this.volumes = data;
    } else {
      this.volumes = [];
    }
  }
}
