import type { Option } from '@globalart/oxide';

export interface RepositoryPort<Entity> {
  insert(entity: Entity | Entity[]): Promise<void>;
  findOneById(id: string): Promise<Option<Entity>>;
  findAll(): Promise<Entity[]>;
  delete(entity: Entity): Promise<boolean>;
}
