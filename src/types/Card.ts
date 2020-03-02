export default interface Card {
  cardId?: number;
  tags: string[];
  front: string;
  back: string;
  hint?: string;
}
