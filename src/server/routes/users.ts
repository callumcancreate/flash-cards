import express from 'express';
import * as c from '../controllers/users';
import auth from '../middleware/auth';

const router = express.Router();

router.post('/', c.register);
router.post('/login', c.login);
router.get('/me', auth, c.getMyProfile);
router.get('/auth/refresh', c.authRefresh);
router.get('/auth/logout', auth, c.logout);

export default router;
