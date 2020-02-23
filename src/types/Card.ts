export default interface Card {
  cardId?: number;
  categoryId?: number;
  front: string;
  back: string;
  hint?: string;
}
