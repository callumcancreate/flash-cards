import express from 'express';
import * as c from '../controllers/tags';

const router = express.Router();

router.get('/', c.getTags);

export default router;
