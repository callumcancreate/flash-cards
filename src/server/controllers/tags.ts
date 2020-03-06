import { asyncCatchWrapper, validateSchema } from "../../utils";
import Tag from "../models/Tag";
import NamedError from "../models/NamedError";

export const getTags = asyncCatchWrapper(async (req, res) => {
  console.log("params", req.params);
  console.log("query", req.query);
  const tags = await Tag.find(req.params, req.query);
  res.send({ tags });
});
