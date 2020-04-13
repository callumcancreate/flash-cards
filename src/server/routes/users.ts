import express from 'express';
import * as c from '../controllers/users';
import auth from '../middleware/auth';

const router = express.Router();

router.post('/', c.register);
router.post('/login', c.login);
router.get('/me', auth, c.getMyProfile);
router.post('/auth/refresh', c.authRefresh);

export default router;
