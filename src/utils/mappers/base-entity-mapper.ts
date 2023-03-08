export abstract class BaseEntityMapper<Entity = any, DTO = any> {
  abstract toEntity(dto: DTO): Entity;

  toEntities(dtos: DTO[]): Entity[] {
    return dtos.map(this.toEntity);
  }

  async toEntityAsync(dtoPromise: Promise<DTO>): Promise<Entity> {
    return this.toEntity(await dtoPromise);
  }

  async toEntitiesAsync(dtosPromise: Promise<DTO[]>): Promise<Entity[]> {
    return this.toEntities(await dtosPromise);
  }
}
