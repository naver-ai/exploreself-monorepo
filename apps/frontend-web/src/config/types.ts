export interface LazyLoadedEntity<Entity> {
  entity?: Entity
  isLoading: boolean
  error?: string
}