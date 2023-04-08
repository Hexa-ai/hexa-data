export default interface HierarchizedData<T> {
  namespace: string
  children: HierarchizedData<T>[] | T[]
}
