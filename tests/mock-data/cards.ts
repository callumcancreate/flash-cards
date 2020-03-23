import _tags from "./tags";
const tags = Object.values(_tags);
export default {
  1: {
    cardId: 1,
    front: "front1",
    back: "back1",
    hint: "hint1",
    tags: tags.slice(0)
  },
  2: {
    cardId: 2,
    front: "front2",
    back: "back2",
    hint: "hint2",
    tags: tags.slice(0)
  },
  3: {
    cardId: 3,
    front: "front3",
    back: "back3",
    hint: "hint3",
    tags: tags.slice(0, 2)
  },
  4: {
    cardId: 4,
    front: "front4",
    back: "back4",
    hint: "hint4",
    tags: tags.slice(0, 2)
  },
  5: {
    cardId: 5,
    front: "front5",
    back: "back5",
    hint: "hint5",
    tags: tags.slice(1)
  },
  6: {
    cardId: 6,
    front: "samefront",
    back: "back6",
    hint: "hint6",
    tags: [tags[2]]
  },
  7: {
    cardId: 7,
    front: "samefront",
    back: "back7",
    hint: "hint7",
    tags: []
  }
};
