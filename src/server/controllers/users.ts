import { asyncCatchWrapper } from "../../utils";
// import User from "../models/User";
import NamedError from "../models/NamedError";

export const login = asyncCatchWrapper((req, res) => {
  res.send(req.body);
});
