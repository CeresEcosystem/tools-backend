export abstract class BaseEntityMapper<Entity = unknown, DTO = unknown> {
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
