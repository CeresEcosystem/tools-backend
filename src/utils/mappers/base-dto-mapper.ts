export abstract class BaseDtoMapper<Entity = any, DTO = any> {
  abstract toDto(entity: Entity): DTO;

  toDtos(entities: Entity[]): DTO[] {
    return entities.map(this.toDto);
  }

  async toDtoAsync(entityPromise: Promise<Entity>): Promise<DTO> {
    return this.toDto(await entityPromise);
  }

  async toDtosAsync(entitiesPromise: Promise<Entity[]>): Promise<DTO[]> {
    return this.toDtos(await entitiesPromise);
  }
}
