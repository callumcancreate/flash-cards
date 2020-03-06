import { asyncCatchWrapper, validateSchema } from "../../utils";
import Tag from "../models/Tag";
import NamedError from "../models/NamedError";

export const getTags = asyncCatchWrapper(async (req, res) => {
  const tags = await Tag.find(req.params, req.query);
  res.send({ tags });
});
