import express from 'express';
import cardRouter from './cards';
import categoryRouter from './categories';
import userRouter from './users';
import auth from '../middleware/auth';

const router = express.Router();

router.use('/cards', auth, cardRouter);
router.use('/categories', auth, categoryRouter);
router.use('/users', userRouter);
router.use('*', (req, res) => {
  res.status(400).send({ error: 'Not a valid endpoint' });
});

export default router;
