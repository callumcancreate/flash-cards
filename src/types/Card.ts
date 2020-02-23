export default interface Card {
  id?: number;
  categoryId?: number;
  front: string;
  back: string;
  hint?: string;
}
