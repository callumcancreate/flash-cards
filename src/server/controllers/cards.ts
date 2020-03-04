import Card from "../models/Card";

import { asyncCatchWrapper, validateSchema } from "../../utils";
import NamedError from "../models/NamedError";
import { DeleteCardSchema } from "../Schemas/Card";

export const createCard = asyncCatchWrapper(async (req, res) => {
  const card = await new Card(req.body).save();
  res.send({ card });
});

export const getCard = asyncCatchWrapper(async (req, res) => {
  const card = await Card.findById(req.params.cardId);
  return res.send({ card });
});

export const getCards = asyncCatchWrapper(async (req, res) => {
  const cards = await Card.find(req.params, req.query);
  return res.send({ cards });
});

export const updateCard = asyncCatchWrapper(async (req, res) => {
  const cards = await Card.find(req.params);
  const card = cards[0];
  if (!card)
    throw new NamedError(
      "NotFound",
      `Unable to find card with id ${req.params.cardId}`
    );
  for (let key in req.body) {
    card[key] = req.body[key];
  }
  await card.save();
  return res.send({ card });
});

export const deleteCard = asyncCatchWrapper(async (req, res) => {
  const { value, errors } = validateSchema(req.params, DeleteCardSchema);
  if (errors) throw new NamedError("Client", "Bad Request", errors);
  const cards = await Card.find(value);
  const card = cards[0];
  if (!card)
    throw new NamedError(
      "NotFound",
      `Unable to find card with id ${req.params.cardId}`
    );
  const count = await card.delete();
  return res.send({ count });
});
