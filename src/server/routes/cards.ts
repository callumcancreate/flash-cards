import express from 'express';
import * as c from '../controllers/cards';
import validateBody from '../middleware/validateBody';
import { PatchCardSchema } from '../schemas/Card';

const router = express.Router();

router.post('/', c.createCard);
router.get('/:cardId', c.getCard);
router.get('/', c.getCards);
router.patch('/:cardId', validateBody(PatchCardSchema), c.updateCard);
router.delete('/:cardId', c.deleteCard);

export default router;
