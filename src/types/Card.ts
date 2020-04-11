import Tag from './Tag';

export default interface Card {
  cardId?: number;
  tags: Tag[];
  front: string;
  back: string;
  hint?: string;
}
