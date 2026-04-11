export interface Mapper<
  Model,
  Entity,
  CreateInput,
  CreateModel,
  RelationEntity,
> {
  toModel(entity: Entity): Model;
  toEntity(model: CreateModel, entity?: RelationEntity): CreateInput;
}
