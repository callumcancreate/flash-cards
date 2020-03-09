import Tag from "./Tag";

export default interface Category {
  categoryId?: number;
  parentId?: number;
  children?: Category[];
  tags: Tag[];
  name: string;
}
