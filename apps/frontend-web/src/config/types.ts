export interface ValueItemType {
  id: number;
  value: string;
}

export interface LazyLoadedEntity<Entity> {
  entity?: Entity
  isLoading: boolean
  error?: string
}