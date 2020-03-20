import _tags from "./tags";
const tags = Object.values(_tags);
export default {
  1: {
    categoryId: 1,
    parentId: undefined,
    tags: tags.slice(0, 2),
    name: "category1"
  },
  2: {
    categoryId: 2,
    parentId: undefined,
    tags: tags.slice(1),
    name: "category2"
  },
  3: {
    categoryId: 3,
    parentId: 1,
    tags: [tags[2]],
    name: "category3"
  }
};
