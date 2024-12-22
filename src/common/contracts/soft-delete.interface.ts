export default interface ISoftDeleteService<PrimsaModel> {
  restore(id: number): Promise<PrimsaModel>;
  forceDelete(id: number): Promise<PrimsaModel>;
}
