export default (input: string) => {
  let str = input.substr(0, 1).toLowerCase();
  str += input
    .substr(1)
    .replace(/(\w)([A-Z])/g, "$1_$2")
    .toLowerCase();
  return str;
};
